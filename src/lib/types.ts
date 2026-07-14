export interface Category {
  id: string
  name: string
  created_at: string
}

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  billing_address: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  category_id: string | null
  category?: Category | null
  price: number
  cost: number
  stock_quantity: number
  reorder_level: number
  supplier: string | null
  created_at: string
}

export interface Employee {
  id: string
  full_name: string
  role: string
  email: string | null
  phone: string | null
  hire_date: string | null
  sales_target: number
  created_at: string
}

export type PaymentStatus = 'paid' | 'pending' | 'overdue'

export interface Sale {
  id: string
  invoice_no: string
  customer_id: string | null
  customer?: Customer | null
  employee_id: string | null
  employee?: Employee | null
  sale_date: string
  subtotal: number
  discount: number
  tax: number
  total: number
  payment_status: PaymentStatus
  created_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string | null
  product?: Product | null
  quantity: number
  unit_price: number
  line_total: number
}

export interface SaleWithItems extends Sale {
  sale_items: SaleItem[]
}
