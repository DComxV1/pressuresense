import { DAY_TYPES, TYPE_META, FACTORS, PROMPTS } from '../lib/daylog.js'
import { bandClasses } from './bandStyles.js'

// One unified log: "How was today?" sets the day type; the same pain slider,
// factor chips, and note appear for every type — only the framing changes. Good
// days get captured too, so the app can learn what to repeat, not just avoid.
export default function DayLog({ entry, history, onSetType, onUpdate, onToggleFactor, onClear }) {
  const type = entry?.type || null
  const pain = entry?.pain ?? null
  const factors = entry?.factors || []
  const note = entry?.note || ''
  const prompt = type ? PROMPTS[type] : null
  const works = goodFactors(history)

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="text-xs uppercase tracking-wide text-muted">Day log</div>
      <p className="mt-0.5 text-sm font-medium text-text">How was today?</p>

      <div className="mt-3 flex gap-2">
        {DAY_TYPES.map((t) => {
          const meta = TYPE_META[t]
          const c = bandClasses[meta.band]
          const on = type === t
          return (
            <button
              key={t}
              onClick={() => onSetType(t)}
              aria-pressed={on}
              className={`min-h-touch flex-1 rounded-xl border px-3 text-sm font-medium transition ${
                on ? `${c.border} ${c.bg} ${c.text}` : 'border-border text-muted hover:bg-surface-2'
              }`}
            >
              <span aria-hidden>{c.icon}</span> {meta.label}
            </button>
          )
        })}
      </div>

      {type && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="daypain" className="text-sm text-text">
                Pain level
              </label>
              <span className="text-sm tabular-nums text-muted">{pain == null ? 'Not set' : `${pain}/10`}</span>
            </div>
            <input
              id="daypain"
              type="range"
              min="0"
              max="10"
              step="1"
              value={pain ?? 0}
              onChange={(e) => onUpdate({ pain: Number(e.target.value) })}
              aria-valuetext={pain == null ? 'not set' : `${pain} out of 10`}
              className="mt-2 h-3 w-full accent-accent"
            />
          </div>

          <div>
            <div className="text-sm text-text">{prompt.heading}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {FACTORS.map((f) => {
                const sel = factors.includes(f)
                return (
                  <button
                    key={f}
                    onClick={() => onToggleFactor(f)}
                    aria-pressed={sel}
                    className={`rounded-full border px-2.5 py-1 text-xs transition ${
                      sel ? 'border-good bg-good text-white' : 'border-border text-muted hover:border-muted'
                    }`}
                  >
                    {sel ? '✓ ' : ''}
                    {f}
                  </button>
                )
              })}
            </div>
          </div>

          <textarea
            value={note}
            onChange={(e) => onUpdate({ note: e.target.value })}
            placeholder={prompt.placeholder}
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder-muted outline-none focus:border-accent"
          />

          <button onClick={onClear} className="text-sm text-muted underline underline-offset-4">
            Clear today’s entry
          </button>
        </div>
      )}

      {works.length > 0 && (
        <div className="mt-5">
          <div className="text-sm font-medium text-text">What works on your good days</div>
          <p className="text-xs text-muted">Most common on the days you felt good.</p>
          <ul className="mt-2 space-y-1.5">
            {works.slice(0, 5).map((w) => (
              <li key={w.factor} className="flex items-center gap-2 text-sm text-text">
                <span className="w-28 shrink-0">{w.factor}</span>
                <span className="h-2 rounded-full bg-good" style={{ width: `${w.count * 16 + 8}px` }} />
                <span className="text-xs text-muted">{w.count}×</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Factors most common on good days — the repeatable wins.
function goodFactors(history) {
  const tally = {}
  for (const h of history) if (h.type === 'good') for (const f of h.factors || []) tally[f] = (tally[f] || 0) + 1
  return Object.entries(tally)
    .map(([factor, count]) => ({ factor, count }))
    .sort((a, b) => b.count - a.count)
}
