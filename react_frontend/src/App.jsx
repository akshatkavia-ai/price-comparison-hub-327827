import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import SearchBar from './components/SearchBar.jsx'
import ResultCard from './components/ResultCard.jsx'
import HistoryChart from './components/HistoryChart.jsx'
import Footer from './components/Footer.jsx'
import { apiRequest, getApiBaseUrl } from './lib/api.js'

function normalizeResults(payload) {
  // Accept multiple possible backend response shapes; keep UI resilient.
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.results)) return payload.results
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.data)) return payload.data
  return []
}

function pickBestIndex(items) {
  let bestIdx = -1
  let bestPrice = Infinity
  items.forEach((it, idx) => {
    const p = it?.price ?? it?.current_price ?? it?.amount
    const n = Number(p)
    if (!Number.isFinite(n)) return
    if (n < bestPrice) {
      bestPrice = n
      bestIdx = idx
    }
  })
  return bestIdx
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// PUBLIC_INTERFACE
export default function App() {
  /** Main Price-Pal application page. */
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('instant') // 'instant' | 'job'

  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')

  const [results, setResults] = useState([])
  const [meta, setMeta] = useState(null)

  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [historyPoints, setHistoryPoints] = useState([])

  const abortRef = useRef(null)

  const bestIndex = useMemo(() => pickBestIndex(results), [results])

  const loadHistory = useCallback(async (q) => {
    setHistoryError('')
    setHistoryLoading(true)
    try {
      const hist = await apiRequest('/price-history', { method: 'GET', query: { query: q } })
      const points = Array.isArray(hist) ? hist : hist?.points ?? hist?.data ?? hist?.history ?? []
      setHistoryPoints(Array.isArray(points) ? points : [])
    } catch (e) {
      setHistoryPoints([])
      setHistoryError(e?.message || 'Failed to load price history.')
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const runInstantCompare = useCallback(async (q, signal) => {
    const payload = await apiRequest('/compare-prices', {
      method: 'POST',
      body: { query: q },
      signal
    })
    setMeta(payload?.meta ?? null)
    setResults(normalizeResults(payload))
  }, [])

  const runJobFlow = useCallback(async (q, signal) => {
    const job = await apiRequest('/create-job', { method: 'POST', body: { query: q }, signal })
    const jobId = job?.job_id ?? job?.id ?? job?.jobId
    if (!jobId) throw new Error('Backend did not return a job id.')

    // Poll job status until done/failed/timeout
    const started = Date.now()
    const timeoutMs = 60_000
    const pollEveryMs = 1500

    while (true) {
      if (signal?.aborted) throw new Error('Request cancelled.')

      const statusPayload = await apiRequest('/job-status', {
        method: 'GET',
        query: { job_id: jobId },
        signal
      })

      const status = statusPayload?.status ?? statusPayload?.state ?? 'unknown'
      const maybeResults = normalizeResults(statusPayload)

      // Update UI progressively if backend streams partial results in status payload
      if (maybeResults.length > 0) setResults(maybeResults)

      if (status === 'completed' || status === 'done' || status === 'success') {
        setMeta(statusPayload?.meta ?? { job_id: jobId })
        setResults(maybeResults)
        return
      }

      if (status === 'failed' || status === 'error') {
        throw new Error(statusPayload?.error || 'Background job failed.')
      }

      if (Date.now() - started > timeoutMs) {
        throw new Error('Timed out waiting for background job.')
      }

      await sleep(pollEveryMs)
    }
  }, [])

  const onSubmit = useCallback(async () => {
    const q = query.trim()
    if (!q) return

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setError('')
    setIsBusy(true)
    setResults([])
    setMeta(null)

    try {
      if (!getApiBaseUrl()) {
        throw new Error(
          'Missing API base URL. Set VITE_API_BASE_URL for Vite (or REACT_APP_API_BASE for fallback).'
        )
      }

      if (mode === 'job') await runJobFlow(q, controller.signal)
      else await runInstantCompare(q, controller.signal)

      // History is independent; load after results
      await loadHistory(q)
    } catch (e) {
      setError(e?.message || 'Something went wrong.')
    } finally {
      setIsBusy(false)
    }
  }, [query, mode, runInstantCompare, runJobFlow, loadHistory])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  return (
    <div className="min-h-full">
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <section className="rounded-3xl bg-gradient-to-br from-blue-500/10 to-slate-50 p-6 sm:p-8">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Find the best price in seconds
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Compare across popular Indian stores. Results are cached and tracked so you can spot
                trends over time.
              </p>
            </div>

            <div className="mt-6">
              <SearchBar
                query={query}
                onChangeQuery={setQuery}
                onSubmit={onSubmit}
                isBusy={isBusy}
                mode={mode}
                onChangeMode={setMode}
              />
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="font-semibold">Error</div>
                <div className="mt-1">{error}</div>
              </div>
            ) : null}

            {meta?.job_id ? (
              <div className="mt-4 text-xs text-slate-500">Job: {String(meta.job_id)}</div>
            ) : null}
          </section>

          <section id="results" className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Results</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {isBusy
                    ? 'Fetching latest prices…'
                    : results.length > 0
                      ? `${results.length} store(s) found`
                      : 'Run a search to see prices.'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              {isBusy && results.length === 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="h-3 w-24 rounded bg-slate-100" />
                      <div className="mt-3 h-4 w-3/4 rounded bg-slate-100" />
                      <div className="mt-6 h-6 w-32 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                  No results yet.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((item, idx) => (
                    <ResultCard key={item?.url || idx} item={item} isBest={idx === bestIndex} />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="mt-8">
            <HistoryChart points={historyPoints} isLoading={historyLoading} error={historyError} />
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
            <div className="font-semibold text-slate-700">API</div>
            <div className="mt-1">
              Using backend at: <span className="font-mono">{getApiBaseUrl() || '(not set)'}</span>
            </div>
            <div className="mt-1">
              Endpoints: <span className="font-mono">/compare-prices</span>,{' '}
              <span className="font-mono">/create-job</span>,{' '}
              <span className="font-mono">/job-status</span>,{' '}
              <span className="font-mono">/price-history</span>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  )
}
