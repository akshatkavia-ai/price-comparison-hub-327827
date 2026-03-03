import React from 'react'

// PUBLIC_INTERFACE
export default function Footer() {
  /** Sticky footer disclaimer for compliance. */
  return (
    <footer
      id="disclaimer"
      className="border-t border-slate-200 bg-white"
      aria-label="Disclaimer footer"
    >
      <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500">
        <p className="font-medium text-slate-600">Disclaimer</p>
        <p className="mt-1">
          Prices are fetched from third-party websites and may change without notice. Price‑Pal is
          for informational purposes only and is not affiliated with any retailer.
        </p>
      </div>
    </footer>
  )
}
