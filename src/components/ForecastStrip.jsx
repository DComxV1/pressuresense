import { bandClasses } from './bandStyles.js'
import { BAND_META } from '../lib/tips.js'
import { dayLabel, hPaToInHg } from '../lib/format.js'

// Tiny per-card sparkline of the day's pressure shape.
function MiniSpark({ hours, color }) {
  if (!hours?.length) return null
  const W = 72
  const H = 22
  const xs = hours.map((_, i) => (i * W) / Math.max(1, hours.length - 1))
  const vals = hours.map((h) => h.hPa)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = Math.max(1, max - min)
  const y = (v) => 2 + (1 - (v - min) / span) * (H - 4)
  const d = hours.map((h, i) => `${i === 0 ? 'M' : 'L'} ${xs[i].toFixed(1)} ${y(h.hPa).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function swingLabel(hours, unit) {
  if (!hours?.length) return null
  const vals = hours.map((h) => h.hPa)
  const swing = Math.max(...vals) - Math.min(...vals)
  const v = unit === 'inHg' ? `${hPaToInHg(swing).toFixed(2)} inHg` : `${swing.toFixed(0)} hPa`
  return `swing ${v}`
}

// Per-day risk rating. The day's swing matters more than its floor for pain.
export default function ForecastStrip({ days, unit, onSelect, selectedKey }) {
  if (!days?.length) return null
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-wide text-slate-300">Next few days</div>
      <div className="grid grid-cols-3 gap-3">
        {days.map((d) => {
          const c = bandClasses[d.band]
          const meta = BAND_META[d.band]
          const isSel = d.key === selectedKey
          return (
            <button
              key={d.key}
              onClick={() => onSelect?.(d.key)}
              aria-pressed={isSel}
              className={`rounded-xl border ${c.border} ${c.bg} p-3 text-left transition ${
                isSel ? 'ring-2 ring-slate-400/60' : 'hover:border-slate-500/60'
              }`}
            >
              <div className="text-sm font-medium text-slate-100">{dayLabel(d.date)}</div>
              <div className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${c.text}`}>
                <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden />
                {meta.label}
              </div>
              <MiniSpark hours={d.hours} color={meta.color} />
              <div className="mt-1 text-[11px] leading-tight text-slate-300">
                {swingLabel(d.hours, unit)}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
