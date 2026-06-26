import { useState } from 'react'
import { bandClasses } from './bandStyles.js'
import { TYPE_META } from '../lib/daylog.js'

// Past entries from the Day Log — date + day type (color + icon + label) + pain
// + factors/note, filterable by type.
const FILTERS = [
  ['all', 'All'],
  ['good', 'Good'],
  ['soso', 'So-so'],
  ['rough', 'Rough'],
]

export default function HistoryView({ history }) {
  const [filter, setFilter] = useState('all')
  const entries = history.filter((h) => h.type)
  const shown = filter === 'all' ? entries : entries.filter((h) => h.type === filter)

  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
        No entries yet. Tap how today went above, and your past entries will collect here.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wide text-muted">Past entries</div>
        <div className="inline-flex overflow-hidden rounded-lg border border-border text-xs" role="group" aria-label="Filter by day type">
          {FILTERS.map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              aria-pressed={filter === v}
              className={`px-2.5 py-1 ${filter === v ? 'bg-accent text-white' : 'text-muted'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {shown.map((h) => {
          const meta = TYPE_META[h.type]
          const c = bandClasses[meta.band]
          return (
            <li key={h.dateKey} className="rounded-lg border border-border px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className={c.text} aria-hidden>
                    {c.icon}
                  </span>
                  <span className="text-sm text-text">{formatDate(h.dateKey)}</span>
                  <span className={`text-xs ${c.text}`}>{meta.label}</span>
                </span>
                {h.pain != null && <span className="text-xs text-muted">pain {h.pain}/10</span>}
              </div>
              {h.factors?.length > 0 && <div className="mt-1 text-xs text-good-ink">{h.factors.join(', ')}</div>}
              {h.note && <div className="mt-1 text-xs text-muted">“{h.note}”</div>}
            </li>
          )
        })}
        {!shown.length && <li className="px-1 py-2 text-sm text-muted">No {filter} days logged yet.</li>}
      </ul>
    </div>
  )
}

function formatDate(key) {
  const d = new Date(key)
  if (Number.isNaN(d.getTime())) return key
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
