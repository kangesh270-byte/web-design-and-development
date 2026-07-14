import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { Layout } from '../components/Layout'
import { supabase } from '../lib/supabaseClient'
import type { Customer, Employee, Sale } from '../lib/types'

type ReportType = 'daily' | 'weekly' | 'monthly' | 'revenue' | 'product'

const REPORT_LABELS: Record<ReportType, string> = {
  daily: 'Daily Sales Report',
  weekly: 'Weekly Sales Report',
  monthly: 'Monthly Sales Report',
  revenue: 'Revenue Report',
  product: 'Product Performance Report'
}

function currency(n: number) {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function toCsv(rows: Record<string, string | number>[]) {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  rows.forEach((r) => lines.push(headers.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(',')))
  return lines.join('\n')
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function Reports() {
  const [sales, setSales] = useState<(Sale & { customer?: Customer; employee?: Employee })[]>([])
  const [items, setItems] = useState<any[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const [reportType, setReportType] = useState<ReportType>('daily')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [s, it, e, c] = await Promise.all([
        supabase.from('sales').select('*, customer:customers(*), employee:employees(*)'),
        supabase.from('sale_items').select('*, product:products(*)'),
        supabase.from('employees').select('*').order('full_name'),
        supabase.from('customers').select('*').order('name')
      ])
      setSales((s.data as any) ?? [])
      setItems((it.data as any) ?? [])
      setEmployees(e.data ?? [])
      setCustomers(c.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (fromDate && s.sale_date < fromDate) return false
      if (toDate && s.sale_date > toDate) return false
      if (employeeFilter && s.employee_id !== employeeFilter) return false
      if (customerFilter && s.customer_id !== customerFilter) return false
      return true
    })
  }, [sales, fromDate, toDate, employeeFilter, customerFilter])

  const filteredSaleIds = useMemo(() => new Set(filteredSales.map((s) => s.id)), [filteredSales])
  const filteredItems = useMemo(() => items.filter((it) => filteredSaleIds.has(it.sale_id)), [items, filteredSaleIds])

  const grouped = useMemo(() => {
    if (reportType === 'product') {
      const map = new Map<string, { name: string; qty: number; revenue: number }>()
      filteredItems.forEach((it) => {
        const key = it.product?.name ?? 'Unknown'
        const cur = map.get(key) ?? { name: key, qty: 0, revenue: 0 }
        cur.qty += it.quantity
        cur.revenue += Number(it.line_total)
        map.set(key, cur)
      })
      return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
    }

    if (reportType === 'revenue') {
      return filteredSales
        .slice()
        .sort((a, b) => a.sale_date.localeCompare(b.sale_date))
        .map((s) => ({
          invoice: s.invoice_no,
          date: s.sale_date,
          customer: s.customer?.name ?? 'Walk-in',
          subtotal: Number(s.subtotal),
          discount: Number(s.discount),
          tax: Number(s.tax),
          total: Number(s.total)
        }))
    }

    // daily / weekly / monthly grouping by period key
    const keyFor = (dateStr: string) => {
      const d = new Date(dateStr)
      if (reportType === 'daily') return dateStr
      if (reportType === 'monthly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      // weekly: ISO week start (Monday)
      const day = d.getDay() || 7
      const monday = new Date(d)
      monday.setDate(d.getDate() - day + 1)
      return monday.toISOString().slice(0, 10)
    }

    const map = new Map<string, { period: string; orders: number; revenue: number }>()
    filteredSales.forEach((s) => {
      const key = keyFor(s.sale_date)
      const cur = map.get(key) ?? { period: key, orders: 0, revenue: 0 }
      cur.orders += 1
      cur.revenue += Number(s.total)
      map.set(key, cur)
    })
    return Array.from(map.values()).sort((a, b) => a.period.localeCompare(b.period))
  }, [reportType, filteredSales, filteredItems])

  const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total), 0)

  function handleExport() {
    const csv = toCsv(grouped as any)
    download(`${reportType}-report-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  return (
    <Layout eyebrow="ANALYTICS" title="Report Generator">
      <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 4 }}>
          <div>
            <label className="label">Report Type</label>
            <select className="input" value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
              {Object.entries(REPORT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label">From</label>
            <input className="input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="label">To</label>
            <input className="input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Employee</label>
            <select className="input" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
              <option value="">All employees</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Customer</label>
            <select className="input" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
              <option value="">All customers</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: 17 }}>{REPORT_LABELS[reportType]}</h3>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
            {filteredSales.length} orders · {currency(totalRevenue)} total revenue
          </div>
        </div>
        <button className="btn btn-ghost" onClick={handleExport} disabled={grouped.length === 0}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="panel table-wrap">
        {loading ? (
          <div style={{ padding: 20, color: 'var(--muted)' }}>Crunching numbers…</div>
        ) : grouped.length === 0 ? (
          <div style={{ padding: 20, color: 'var(--muted)' }}>No records match these filters.</div>
        ) : reportType === 'product' ? (
          <table className="data">
            <thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
            <tbody>
              {(grouped as any[]).map((r) => (
                <tr key={r.name}><td style={{ fontWeight: 600 }}>{r.name}</td><td className="mono">{r.qty}</td><td className="mono">{currency(r.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        ) : reportType === 'revenue' ? (
          <table className="data">
            <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Subtotal</th><th>Discount</th><th>Tax</th><th>Total</th></tr></thead>
            <tbody>
              {(grouped as any[]).map((r) => (
                <tr key={r.invoice}>
                  <td className="mono" style={{ fontWeight: 600 }}>{r.invoice}</td>
                  <td className="mono">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                  <td>{r.customer}</td>
                  <td className="mono">{currency(r.subtotal)}</td>
                  <td className="mono">{currency(r.discount)}</td>
                  <td className="mono">{currency(r.tax)}</td>
                  <td className="mono">{currency(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="data">
            <thead><tr><th>Period</th><th>Orders</th><th>Revenue</th></tr></thead>
            <tbody>
              {(grouped as any[]).map((r) => (
                <tr key={r.period}><td className="mono" style={{ fontWeight: 600 }}>{r.period}</td><td className="mono">{r.orders}</td><td className="mono">{currency(r.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
