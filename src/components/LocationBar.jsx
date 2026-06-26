import { useState } from 'react'
import { geocode } from '../lib/weather.js'

// Pick a location by browser geolocation or city search.
export default function LocationBar({ location, onPick, onUseDevice, locating }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function search(e) {
    e.preventDefault()
    if (!query.trim()) return
    setBusy(true)
    setError(null)
    try {
      const r = await geocode(query.trim())
      setResults(r)
      if (r.length === 0) setError('No matching places found.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function pick(r) {
    onPick({ label: r.label, latitude: r.latitude, longitude: r.longitude })
    setResults([])
    setQuery('')
  }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-400">Location</div>
          <div className="truncate text-sm font-medium text-slate-200">
            {location?.label || 'Not set'}
          </div>
        </div>
        <button
          onClick={onUseDevice}
          disabled={locating}
          className="shrink-0 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700/50 disabled:opacity-50"
        >
          {locating ? 'Locating…' : 'Use my location'}
        </button>
      </div>

      <form onSubmit={search} className="mt-3 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a city…"
          className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {busy ? '…' : 'Search'}
        </button>
      </form>

      {error && <div className="mt-2 text-xs text-red-400">{error}</div>}

      {results.length > 0 && (
        <ul className="mt-2 divide-y divide-slate-700/60 overflow-hidden rounded-lg border border-slate-700/60">
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => pick(r)}
                className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700/50"
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
