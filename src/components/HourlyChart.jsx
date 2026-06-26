import { BAND_META } from '../lib/tips.js'
import { hourLabel, formatPressure } from '../lib/format.js'

// Simple SVG sparkline of the selected day's hourly pressure, dots colored by
// hourly risk band. No chart library — keeps the prototype dependency-free.
export default function HourlyChart({ day, unit }) {
  if (!day?.hours?.length) return null
  const hours = day.hours
  const W = 320
  const H = 90
  const pad = 8
  const xs = hours.map((_, i) => pad + (i * (W - 2 * pad)) / Math.max(1, hours.length - 1))
  const values = hours.map((h) => h.hPa)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(1, max - min)
  const y = (v) => pad + (1 - (v - min) / span) * (H - 2 * pad)
  const path = hours.map((h, i) => `${i === 0 ? 'M' : 'L'} ${xs[i].toFixed(1)} ${y(h.hPa).toFixed(1)}`).join(' ')

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
        <span>Hourly pressure</span>
        <span className="text-slate-500">
          {hourLabel(hours[0].time)} – {hourLabel(hours[hours.length - 1].time)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Hourly pressure trend">
        <path d={path} fill="none" stroke="#64748b" strokeWidth="1.5" />
        {hours.map((h, i) => (
          <circle key={i} cx={xs[i]} cy={y(h.hPa)} r="2.5" fill={BAND_META[h.band].color}>
            <title>
              {hourLabel(h.time)} · {formatPressure(h.hPa, unit)} · {BAND_META[h.band].label}
            </title>
          </circle>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-slate-500">
        <span>low {formatPressure(day.minPressure, unit)}</span>
        <span>peak risk ~{hourLabel(day.peakHour)}</span>
      </div>
    </div>
  )
}
