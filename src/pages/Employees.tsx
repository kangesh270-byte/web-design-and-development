import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react'
import { Layout } from '../components/Layout'
import { supabase } from '../lib/supabaseClient'
import type { Employee, Sale } from '../lib/types'

const empty = { full_name: '', role: '', email: '', phone: '', hire_date: '', sales_target: '' }

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const [e, s] = await Promise.all([
      supabase.from('employees').select('*').order('created_at', { ascending: false }),
      supabase.from('sales').select('*')
    ])
    if (!e.error) setEmployees(e.data ?? [])
    if (!s.error) setSales(s.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const salesByEmployee = useMemo(() => {
    const map = new Map<string, number>()
    sales.forEach((s) => {
      if (!s.employee_id) return
      map.set(s.employee_id, (map.get(s.employee_id) ?? 0) + Number(s.total))
    })
    return map
  }, [sales])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return employees.filter((e) => e.full_name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q))
  }, [employees, query])

  function openNew() {
    setEditing(null)
    setForm(empty)
    setError(null)
    setModalOpen(true)
  }

  function openEdit(e: Employee) {
    setEditing(e)
    setForm({
      full_name: e.full_name,
      role: e.role,
      email: e.email ?? '',
      phone: e.phone ?? '',
      hire_date: e.hire_date ?? '',
      sales_target: String(e.sales_target ?? 0)
    })
    setError(null)
    setModalOpen(true)
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    setError(null)
    const payload = {
      full_name: form.full_name,
      role: form.role,
      email: form.email || null,
      phone: form.phone || null,
      hire_date: form.hire_date || null,
      sales_target: Number(form.sales_target || 0)
    }
    if (editing) {
      const { error } = await supabase.from('employees').update(payload).eq('id', editing.id)
      if (error) return setError(error.message)
    } else {
      const { error } = await supabase.from('employees').insert(payload)
      if (error) return setError(error.message)
    }
    setModalOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this employee?')) return
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (!error) load()
  }

  return (
    <Layout
      eyebrow="TEAM"
      title="Employees"
      action={<button className="btn btn-primary" onClick={openNew}><Plus size={15} /> Add Employee</button>}
    >
      <div className="panel" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 320 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--muted)' }} />
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search by name or role…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="panel table-wrap">
        <table className="data">
          <thead>
            <tr><th>Name</th><th>Role</th><th>Contact</th><th>Hired</th><th>Target</th><th>Achieved</th><th></th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ color: 'var(--muted)' }}>Loading team…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={7} style={{ color: 'var(--muted)' }}>No employees found.</td></tr>}
            {filtered.map((e) => {
              const achieved = salesByEmployee.get(e.id) ?? 0
              const pct = e.sales_target ? Math.min(100, Math.round((achieved / e.sales_target) * 100)) : 0
              return (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.full_name}</td>
                  <td>{e.role}</td>
                  <td style={{ fontSize: 12.5 }}>{e.email || e.phone || '—'}</td>
                  <td className="mono">{e.hire_date ? new Date(e.hire_date).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="mono">₹{Number(e.sales_target).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`pill ${pct >= 100 ? 'pill-mint' : pct >= 50 ? 'pill-signal' : 'pill-coral'}`}>{pct}%</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost" style={{ padding: 7 }} onClick={() => openEdit(e)}><Pencil size={13} /></button>
                      <button className="btn btn-danger" style={{ padding: 7 }} onClick={() => handleDelete(e.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>{editing ? 'Edit Employee' : 'Add Employee'}</h3>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setModalOpen(false)}><X size={15} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Full Name</label>
                <input className="input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Role</label>
                <input className="input" required placeholder="Sales Executive" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="label">Hire Date</label>
                  <input className="input" type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="label">Monthly Sales Target (₹)</label>
                <input className="input" type="number" value={form.sales_target} onChange={(e) => setForm({ ...form, sales_target: e.target.value })} />
              </div>
              {error && <div style={{ color: 'var(--coral)', fontSize: 12.5, marginBottom: 14 }}>{error}</div>}
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} type="submit">
                {editing ? 'Save Changes' : 'Add Employee'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
