import React, { useMemo } from 'react'

// PUBLIC_INTERFACE
export default function SearchBar({
  query,
  onChangeQuery,
  onSubmit,
  isBusy,
  mode,
  onChangeMode
}) {
  /** Central search input with compare mode selector. */
  const helperText = useMemo(() => {
    if (mode === 'instant') return 'Runs a direct comparison (fastest).'
    return 'Creates a background job and polls for status (best for heavier scraping).'
  }, [mode])

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="q" className="block text-sm font-medium text-slate-700">
              Product
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/40">
              <span className="text-slate-400">⌕</span>
              <input
                id="q"
                value={query}
                onChange={(e) => onChangeQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="e.g., PlayStation 5, iPhone 15, RTX 4060..."
                autoComplete="off"
              />
            </div>
          </div>

          <div className="sm:w-56">
            <label htmlFor="mode" className="block text-sm font-medium text-slate-700">
              Mode
            </label>
            <select
              id="mode"
              value={mode}
              onChange={(e) => onChangeMode?.(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="instant">Instant compare</option>
              <option value="job">Background job</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isBusy || !query.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Searching…
              </>
            ) : (
              <>
                Compare
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">{helperText}</p>
      </div>
    </form>
  )
}
