import React, { useMemo } from 'react'

function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

function hostnameFromUrl(url) {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

// PUBLIC_INTERFACE
export default function ResultCard({ item, isBest }) {
  /** Shows one store's price + link. */
  const storeName = useMemo(() => {
    return item?.store || item?.site || item?.source || hostnameFromUrl(item?.url) || 'Store'
  }, [item])

  const priceValue = item?.price ?? item?.current_price ?? item?.amount
  const title = item?.title || item?.product || item?.name || storeName

  return (
    <article
      className={[
        'rounded-2xl border bg-white p-4 shadow-sm',
        isBest ? 'border-cyan-300 ring-2 ring-cyan-200/60' : 'border-slate-200'
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{storeName}</div>
          <h3 className="mt-1 truncate text-sm font-semibold text-slate-900" title={title}>
            {title}
          </h3>
        </div>
        {isBest ? (
          <span className="shrink-0 rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700">
            Best
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">Price</div>
          <div className="text-lg font-bold text-slate-900">{formatPrice(priceValue)}</div>
        </div>

        {item?.url ? (
          <a
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            Visit <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="text-xs text-slate-400">No link</span>
        )}
      </div>

      {item?.availability ? (
        <div className="mt-3 text-xs text-slate-500">Availability: {String(item.availability)}</div>
      ) : null}
    </article>
  )
}
