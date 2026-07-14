-- ============================================================================
-- Business Sales Reporting and Analytics Platform
-- Supabase schema
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- Categories ----------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz not null default now()
);

-- ---------- Customers ----------
create table if not exists customers (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  email            text,
  phone            text,
  billing_address  text,
  created_at       timestamptz not null default now()
);

-- ---------- Products ----------
create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category_id     uuid references categories(id) on delete set null,
  price           numeric(12,2) not null default 0,
  cost            numeric(12,2) not null default 0,
  stock_quantity  integer not null default 0,
  reorder_level   integer not null default 5,
  supplier        text,
  created_at      timestamptz not null default now()
);

-- ---------- Employees ----------
create table if not exists employees (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  role          text not null default 'Sales Executive',
  email         text,
  phone         text,
  hire_date     date,
  sales_target  numeric(12,2) not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------- Sales (invoice header) ----------
create table if not exists sales (
  id              uuid primary key default gen_random_uuid(),
  invoice_no      text not null unique,
  customer_id     uuid references customers(id) on delete set null,
  employee_id     uuid references employees(id) on delete set null,
  sale_date       date not null default current_date,
  subtotal        numeric(12,2) not null default 0,
  discount        numeric(12,2) not null default 0,
  tax             numeric(12,2) not null default 0,
  total           numeric(12,2) not null default 0,
  payment_status  text not null default 'paid' check (payment_status in ('paid', 'pending', 'overdue')),
  created_at      timestamptz not null default now()
);

-- ---------- Sale line items ----------
create table if not exists sale_items (
  id           uuid primary key default gen_random_uuid(),
  sale_id      uuid not null references sales(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  quantity     integer not null default 1,
  unit_price   numeric(12,2) not null default 0,
  line_total   numeric(12,2) not null default 0
);

create index if not exists idx_sales_date on sales(sale_date);
create index if not exists idx_sales_customer on sales(customer_id);
create index if not exists idx_sales_employee on sales(employee_id);
create index if not exists idx_sale_items_sale on sale_items(sale_id);
create index if not exists idx_sale_items_product on sale_items(product_id);
create index if not exists idx_products_category on products(category_id);

-- ============================================================================
-- Row Level Security
-- Any signed-in user of this app (an internal staff account) can read/write
-- all business data. Public/anonymous access is blocked.
-- ============================================================================

alter table categories  enable row level security;
alter table customers   enable row level security;
alter table products    enable row level security;
alter table employees   enable row level security;
alter table sales       enable row level security;
alter table sale_items  enable row level security;

create policy "Authenticated full access - categories" on categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access - customers" on customers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access - products" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access - employees" on employees
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access - sales" on sales
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access - sale_items" on sale_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================================
-- ADMIN / CUSTOMER ROLE-BASED ACCESS (run this section for an existing project)
-- ============================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'customer' check (role in ('admin','customer')),
  created_at timestamptz not null default now()
);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,full_name,email,role) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.email,''),'customer') on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
insert into profiles(id,full_name,email) select id,coalesce(raw_user_meta_data->>'full_name',''),coalesce(email,'') from auth.users on conflict(id) do nothing;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from profiles where id=auth.uid() and role='admin'); $$;

create table if not exists orders (
 id uuid primary key default gen_random_uuid(), order_no text not null unique default ('ORD-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
 customer_id uuid not null references profiles(id) on delete cascade, total numeric(12,2) not null default 0,
 status text not null default 'pending' check(status in('pending','confirmed','shipped','delivered','cancelled')), created_at timestamptz not null default now()
);
alter table profiles enable row level security; alter table orders enable row level security;
drop policy if exists "profiles own read" on profiles; create policy "profiles own read" on profiles for select using(auth.uid()=id or public.is_admin());
drop policy if exists "profiles own update" on profiles; create policy "profiles own update" on profiles for update using(auth.uid()=id) with check(auth.uid()=id);
drop policy if exists "orders access" on orders; create policy "orders access" on orders for select using(customer_id=auth.uid() or public.is_admin());
drop policy if exists "customer creates order" on orders; create policy "customer creates order" on orders for insert with check(customer_id=auth.uid());
drop policy if exists "admin updates orders" on orders; create policy "admin updates orders" on orders for update using(public.is_admin()) with check(public.is_admin());

-- Replace broad policies with role-aware access.
do $$ declare r record; begin for r in select policyname,tablename from pg_policies where schemaname='public' and policyname like 'Authenticated full access%' loop execute format('drop policy if exists %I on %I',r.policyname,r.tablename); end loop; end $$;
create policy "admin categories" on categories for all using(public.is_admin()) with check(public.is_admin());
create policy "customers view categories" on categories for select using(auth.role()='authenticated');
create policy "admin customers" on customers for all using(public.is_admin()) with check(public.is_admin());
create policy "admin products" on products for all using(public.is_admin()) with check(public.is_admin());
create policy "customers view products" on products for select using(auth.role()='authenticated');
create policy "admin employees" on employees for all using(public.is_admin()) with check(public.is_admin());
create policy "admin sales" on sales for all using(public.is_admin()) with check(public.is_admin());
create policy "admin sale items" on sale_items for all using(public.is_admin()) with check(public.is_admin());

-- IMPORTANT: after running, make your account admin:
-- update profiles set role='admin' where email='YOUR_ADMIN_EMAIL@gmail.com';
