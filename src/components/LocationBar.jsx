import { useState } from 'react'
import { geocode } from '../lib/weather.js'

// A slim location row (Move 1): collapsed to a single line by default so the
// hero leads. Tapping "Change" reveals device-location + city search.
export default function LocationBar({ location, onPick, onUseDevice, locating }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  // Open by default until a location is set, then stay tucked away.
  const [open, setOpen] = useState(!location)

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
    setOpen(false)
  }

  return (
    <div className="rounded-xl border border-border/60 bg-surface px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-muted" aria-hidden>
            📍
          </span>
          <span className="truncate text-sm font-medium text-text">
            {location?.label || 'No location set'}
          </span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-accent hover:bg-surface-2"
        >
          {open ? 'Close' : 'Change'}
        </button>
      </div>

      {open && (
        <div className="mt-3 border-t border-border/60 pt-3">
          <button
            onClick={onUseDevice}
            disabled={locating}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-surface-2 disabled:opacity-50"
          >
            {locating ? 'Locating…' : 'Use my location'}
          </button>

          <form onSubmit={search} className="mt-2 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Or search a city…"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-text placeholder-muted outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent disabled:opacity-50"
            >
              {busy ? '…' : 'Search'}
            </button>
          </form>

          {error && <div className="mt-2 text-xs text-high-ink">{error}</div>}

          {results.length > 0 && (
            <ul className="mt-2 divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60">
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    onClick={() => pick(r)}
                    className="block w-full px-3 py-2 text-left text-sm text-text hover:bg-surface-2"
                  >
                    {r.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
