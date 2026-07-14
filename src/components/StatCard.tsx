import { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export function StatCard({
  label,
  value,
  delta,
  icon,
  accent = 'signal'
}: {
  label: string
  value: string
  delta?: number
  icon: ReactNode
  accent?: 'signal' | 'mint' | 'coral'
}) {
  const positive = (delta ?? 0) >= 0

  return (
    <div className="panel" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="label" style={{ marginBottom: 14 }}>
          {label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: 'grid',
            placeItems: 'center',
            background: `var(--${accent}-dim)`,
            color: `var(--${accent})`
          }}
        >
          {icon}
        </div>
      </div>
      <div className="mono" style={{ fontSize: 26, fontWeight: 600, marginBottom: delta !== undefined ? 8 : 0 }}>
        {value}
      </div>
      {delta !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12.5,
            color: positive ? 'var(--mint)' : 'var(--coral)',
            fontWeight: 600
          }}
        >
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(delta).toFixed(1)}% vs previous period
        </div>
      )}
    </div>
  )
}
