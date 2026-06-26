import { bandClasses } from './bandStyles.js'
import { BAND_META } from '../lib/tips.js'

const FELT = [
  { key: 'good', label: 'Good' },
  { key: 'meh', label: 'So-so' },
  { key: 'bad', label: 'Painful' },
]

// Log of predicted bands vs. how the user actually felt. The validation loop
// that lets the model get tuned to a real person over a couple of weeks.
export default function HistoryView({ history, onFelt }) {
  if (!history?.length) {
    return (
      <div className="rounded-2xl border border-border/60 bg-surface p-5 text-sm text-muted">
        No history yet. Each day you open the app, today’s prediction is logged here.
        Tap how you actually felt to start calibrating the model.
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-4">
      <div className="mb-3 text-xs uppercase tracking-wide text-muted">
        Past days, and how you actually felt
      </div>
      <ul className="space-y-2">
        {history.map((h) => {
          const c = bandClasses[h.predictedBand] || bandClasses.green
          return (
            <li
              key={h.dateKey}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text">{formatDate(h.dateKey)}</span>
                    {h.predictedBand && (
                      <span className={`text-xs ${c.text}`}>{BAND_META[h.predictedBand]?.label}</span>
                    )}
                  </div>
                  {detailSummary(h) && (
                    <div className="text-[11px] text-muted">{detailSummary(h)}</div>
                  )}
                </div>
              </div>
              <div className="inline-flex overflow-hidden rounded-md border border-border">
                {FELT.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => onFelt(h.dateKey, f.key)}
                    className={`px-2 py-1 text-xs ${
                      h.felt === f.key
                        ? 'bg-accent text-white'
                        : 'bg-transparent text-muted hover:bg-surface-2'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function detailSummary(h) {
  const bits = []
  if (h.pain != null) bits.push(`pain ${h.pain}/10`)
  const tags = [...(h.joints || []), ...(h.symptoms || [])]
  if (tags.length) bits.push(tags.slice(0, 3).join(', ') + (tags.length > 3 ? '…' : ''))
  return bits.join(' · ')
}

function formatDate(key) {
  const d = new Date(key)
  if (Number.isNaN(d.getTime())) return key
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
