import React from 'react'

// PUBLIC_INTERFACE
export default function Navbar() {
  /** Top navigation for Price-Pal. */
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold">
            P
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Price-Pal</div>
            <div className="text-xs text-slate-500">Compare prices across Indian stores</div>
          </div>
        </div>

        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <a className="text-slate-600 hover:text-slate-900" href="#results">
            Results
          </a>
          <a className="text-slate-600 hover:text-slate-900" href="#history">
            History
          </a>
          <a className="text-slate-600 hover:text-slate-900" href="#disclaimer">
            Disclaimer
          </a>
        </nav>
      </div>
    </header>
  )
}
