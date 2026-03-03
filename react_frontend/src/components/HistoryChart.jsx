import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'

function formatINR(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

function safeDateLabel(d) {
  try {
    const dt = new Date(d)
    return dt.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' })
  } catch {
    return ''
  }
}

// PUBLIC_INTERFACE
export default function HistoryChart({ points, isLoading, error }) {
  /** Renders historical price graph for a query. */
  const data = useMemo(() => {
    if (!Array.isArray(points)) return []
    // Try to normalize common backend shapes:
    // [{date, price}] or [{timestamp, price}] etc.
    return points
      .map((p) => {
        const x = p.date ?? p.timestamp ?? p.created_at ?? p.time
        const y = p.price ?? p.min_price ?? p.value ?? p.amount
        return { x, y }
      })
      .filter((p) => p.x !== undefined && p.y !== undefined)
      .sort((a, b) => new Date(a.x) - new Date(b.x))
  }, [points])

  return (
    <section id="history" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Price history</h2>
          <p className="mt-1 text-xs text-slate-500">
            Historical points come from cached runs and stored results.
          </p>
        </div>
      </div>

      <div className="mt-4 h-56">
        {isLoading ? (
          <div className="grid h-full place-items-center text-sm text-slate-500">
            Loading history…
          </div>
        ) : error ? (
          <div className="grid h-full place-items-center text-sm text-red-600">{error}</div>
        ) : data.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-slate-500">
            No historical data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis
                dataKey="x"
                tickFormatter={safeDateLabel}
                stroke="#64748b"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                dataKey="y"
                tickFormatter={(v) => String(Math.round(Number(v)))}
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                width={52}
              />
              <Tooltip
                formatter={(v) => formatINR(v)}
                labelFormatter={(l) => safeDateLabel(l)}
                contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
