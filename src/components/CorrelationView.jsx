import { useState } from 'react'
import { BAND_META } from '../lib/tips.js'
import { DEFAULT_CONFIG } from '../lib/risk.js'
import { formatPressure, hPaToInHg } from '../lib/format.js'

// A3: overlay logged symptoms against actual pressure over time. Seeing your
// own pattern confirmed is the trust/retention payoff. Pressure line on top,
// felt-rating dots underneath, plus a plain-language insight.

const FELT_BAND = { good: 'green', meh: 'yellow', bad: 'red' }
const RANGES = [7, 14, 30]

// Build a continuous day axis (oldest -> newest) and attach any logged entry.
function buildAxis(history, days) {
  const byKey = new Map(history.map((h) => [h.dateKey, h]))
  const axis = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    axis.push({ date: d, entry: byKey.get(d.toDateString()) || null })
  }
  return axis
}

export default function CorrelationView({ history, unit }) {
  const [days, setDays] = useState(14)
  const loggedCount = history.filter((h) => h.felt || h.minPressure != null).length

  if (loggedCount < 2) {
    return (
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
        <div className="text-xs uppercase tracking-wide text-slate-300">Your pattern</div>
        <p className="mt-2 text-sm text-slate-400">
          As you log how you feel each day, this chart lays your symptoms over the actual
          pressure, so you can start to see your own pattern. Check back in a few days.
        </p>
      </div>
    )
  }

  const axis = buildAxis(history, days)
  const pts = axis.map((a, i) => ({ ...a, i }))
  const withP = pts.filter((p) => p.entry?.minPressure != null)

  const W = 320
  const H = 120
  const padX = 8
  const padTop = 10
  const lineBottom = 78 // pressure line area bottom
  const dotRow = 96 // felt dots y
  const x = (i) => padX + (i * (W - 2 * padX)) / Math.max(1, pts.length - 1)

  const values = withP.map((p) => p.entry.minPressure)
  const min = values.length ? Math.min(...values) : 1000
  const max = values.length ? Math.max(...values) : 1020
  const span = Math.max(1, max - min)
  const y = (v) => padTop + (1 - (v - min) / span) * (lineBottom - padTop)

  const path = withP
    .map((p, k) => `${k === 0 ? 'M' : 'L'} ${x(p.i).toFixed(1)} ${y(p.entry.minPressure).toFixed(1)}`)
    .join(' ')

  // Comfort zone clipped to domain.
  const { comfortableMin, comfortableMax } = DEFAULT_CONFIG.absolute
  const czLow = Math.max(min, comfortableMin)
  const czHigh = Math.min(max, comfortableMax)
  const showComfort = czHigh > czLow

  const insight = buildInsight(history, unit)

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-slate-300">Your pattern</div>
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-600 text-xs">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              aria-pressed={days === r}
              className={`px-2.5 py-1 ${days === r ? 'bg-sky-600 text-white' : 'text-slate-300'}`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Pressure versus logged symptoms over time">
        {showComfort && (
          <rect x={0} y={y(czHigh)} width={W} height={Math.max(0, y(czLow) - y(czHigh))} fill="#16a34a" opacity="0.10" />
        )}
        {/* pressure line + points */}
        {path && <path d={path} fill="none" stroke="#94a3b8" strokeWidth="1.5" />}
        {withP.map((p, k) => (
          <circle key={k} cx={x(p.i)} cy={y(p.entry.minPressure)} r="2.5" fill="#cbd5e1">
            <title>
              {p.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ·{' '}
              {formatPressure(p.entry.minPressure, unit)}
            </title>
          </circle>
        ))}
        {/* felt dots underneath */}
        {pts.map((p) => {
          const felt = p.entry?.felt
          if (!felt) return null
          return (
            <circle key={`f${p.i}`} cx={x(p.i)} cy={dotRow} r="3.5" fill={BAND_META[FELT_BAND[felt]].color}>
              <title>
                {p.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · felt {felt}
                {p.entry.pain != null ? ` · pain ${p.entry.pain}/10` : ''}
              </title>
            </circle>
          )
        })}
      </svg>

      <div className="flex justify-between text-[11px] text-slate-400">
        <span>pressure line · low {formatPressure(min, unit)}</span>
        <span>● symptoms below</span>
      </div>

      {insight && (
        <p className="mt-3 rounded-lg bg-slate-900/40 p-3 text-sm leading-relaxed text-slate-200">{insight}</p>
      )}
    </div>
  )
}

// Plain-language correlation: did lower-pressure days line up with worse days?
function buildInsight(history, unit) {
  const rows = history.filter((h) => h.minPressure != null && h.felt)
  if (rows.length < 4) {
    return 'Keep logging. In a few more days this will start to show whether low pressure lines up with your pain.'
  }
  const bad = rows.filter((r) => r.felt === 'bad')
  const good = rows.filter((r) => r.felt === 'good')
  if (!bad.length || !good.length) {
    return `Logged ${rows.length} days so far. Keep going. Once you've got a mix of good and painful days, the pattern will show up here.`
  }
  const avg = (xs) => xs.reduce((s, r) => s + r.minPressure, 0) / xs.length
  const badAvg = avg(bad)
  const goodAvg = avg(good)
  const fmt = (hPa) => (unit === 'inHg' ? `${hPaToInHg(hPa).toFixed(2)} inHg` : `${Math.round(hPa)} hPa`)
  const gap = goodAvg - badAvg
  if (gap >= 1) {
    return `Your pattern is coming through. Your painful days averaged ${fmt(badAvg)}, versus ${fmt(
      goodAvg,
    )} on the good ones. Lower pressure really has lined up with more pain, just like you'd expect.`
  }
  if (gap <= -1) {
    return `Here's something interesting. So far your painful days haven't been the lower-pressure ones (${fmt(
      badAvg,
    )} versus ${fmt(goodAvg)} on good days). Pressure might not be your main trigger, so keep logging.`
  }
  return `Across ${rows.length} logged days, the pressure on your good and painful days has been about the same, so there's no clear link yet. Keep logging.`
}
