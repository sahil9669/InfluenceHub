const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  let data = {}
  try { data = await response.json() } catch { /* Keep an empty response body. */ }
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`)
  return data
}
