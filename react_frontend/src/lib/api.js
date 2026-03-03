/**
 * Centralized API client for Price-Pal.
 * Uses environment variables for backend base URL.
 */

const resolveApiBaseUrl = () => {
  // Vite exposes env via import.meta.env.* (must be prefixed with VITE_)
  const viteBase = import.meta?.env?.VITE_API_BASE_URL

  // Backward compatibility: existing container already has REACT_APP_API_BASE in .env
  // In Vite this will NOT be injected automatically; keep as a fallback for local dev
  // where a proxy or injected global might exist.
  const craBase = typeof process !== 'undefined' ? process?.env?.REACT_APP_API_BASE : undefined

  return (viteBase || craBase || '').replace(/\/+$/, '')
}

const API_BASE_URL = resolveApiBaseUrl()

async function readJsonOrText(response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()
  return response.text()
}

// PUBLIC_INTERFACE
export async function apiRequest(path, { method = 'GET', query, body, signal } = {}) {
  /** Perform a JSON API request with good error messages and timeouts handled by caller. */
  const url = new URL(API_BASE_URL + path)

  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      url.searchParams.set(k, String(v))
    })
  }

  const headers = { Accept: 'application/json' }
  const init = { method, headers, signal }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  const resp = await fetch(url.toString(), init)
  if (!resp.ok) {
    const payload = await readJsonOrText(resp).catch(() => null)
    const details =
      payload && typeof payload === 'object'
        ? JSON.stringify(payload)
        : payload
          ? String(payload)
          : 'No response body'
    throw new Error(`Request failed (${resp.status} ${resp.statusText}): ${details}`)
  }

  return readJsonOrText(resp)
}

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the resolved API base URL for diagnostics. */
  return API_BASE_URL
}
