import { useState } from 'react'
import { BAND_META } from '../lib/tips.js'
import { DEFAULT_CONFIG } from '../lib/risk.js'
import { TYPE_BAND } from '../lib/daylog.js'
import { formatPressure, hPaToInHg } from '../lib/format.js'

// A3: overlay the logged day type against actual pressure over time. Seeing your
// own pattern confirmed is the trust/retention payoff. Pressure line on top,
// day-type dots underneath, plus a plain-language insight.

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
  const loggedCount = history.filter((h) => h.type || h.minPressure != null).length

  if (loggedCount < 2) {
    return (
      <div className="rounded-2xl border border-border/60 bg-surface p-5">
        <div className="text-xs uppercase tracking-wide text-muted">Your pattern</div>
        <p className="mt-2 text-sm text-muted">
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
  const headline = buildHeadline(history)

  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-muted">Your pattern</div>
        <div className="inline-flex overflow-hidden rounded-lg border border-border text-xs">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              aria-pressed={days === r}
              className={`px-2.5 py-1 ${days === r ? 'bg-accent text-white' : 'text-muted'}`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {headline && (
        <div className="mb-3 rounded-xl bg-accent/10 p-4">
          <div className="text-3xl font-bold tracking-tight text-text">{headline.big}</div>
          <p className="mt-1 text-sm leading-relaxed text-text">{headline.text}</p>
          <p className="mt-1 text-xs text-muted">{headline.note}</p>
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Pressure versus logged symptoms over time">
        {showComfort && (
          <rect x={0} y={y(czHigh)} width={W} height={Math.max(0, y(czLow) - y(czHigh))} fill="rgb(var(--good))" opacity="0.10" />
        )}
        {/* pressure line + points */}
        {path && <path d={path} fill="none" stroke="rgb(var(--muted))" strokeWidth="1.5" />}
        {withP.map((p, k) => (
          <circle key={k} cx={x(p.i)} cy={y(p.entry.minPressure)} r="2.5" fill="rgb(var(--muted))">
            <title>
              {p.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ·{' '}
              {formatPressure(p.entry.minPressure, unit)}
            </title>
          </circle>
        ))}
        {/* day-type dots underneath */}
        {pts.map((p) => {
          const type = p.entry?.type
          if (!type) return null
          return (
            <circle key={`f${p.i}`} cx={x(p.i)} cy={dotRow} r="3.5" fill={BAND_META[TYPE_BAND[type]].color}>
              <title>
                {p.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {type}
                {p.entry.pain != null ? ` · pain ${p.entry.pain}/10` : ''}
              </title>
            </circle>
          )
        })}
      </svg>

      <div className="flex justify-between text-[11px] text-muted">
        <span>pressure line · low {formatPressure(min, unit)}</span>
        <span>● symptoms below</span>
      </div>

      {insight && (
        <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm leading-relaxed text-text">{insight}</p>
      )}
    </div>
  )
}

function median(values) {
  const v = values.filter((x) => typeof x === 'number').sort((a, b) => a - b)
  if (!v.length) return null
  const mid = Math.floor(v.length / 2)
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2
}

// The moat: one headline stat, proven from the user's own data — how much more
// often rough days land on lower-pressure days. Gated behind enough data and
// both groups present (mirrors the calibration readiness pattern).
function buildHeadline(history) {
  const rows = history.filter((h) => h.type && h.minPressure != null)
  if (rows.length < 8) return null
  const med = median(rows.map((r) => r.minPressure))
  const low = rows.filter((r) => r.minPressure < med)
  const steady = rows.filter((r) => r.minPressure >= med)
  if (low.length < 2 || steady.length < 2) return null
  const totalRough = rows.filter((r) => r.type === 'rough').length
  if (totalRough < 2) return null

  const roughRate = (g) => g.filter((r) => r.type === 'rough').length / g.length
  const lowR = roughRate(low)
  const steadyR = roughRate(steady)
  const note = `Based on ${rows.length} logged days.`

  if (steadyR === 0 && lowR > 0) {
    return {
      big: 'Every rough day',
      text: 'you’ve logged has fallen on a lower-pressure day. Lower pressure clearly tracks with your rough days.',
      note,
    }
  }
  if (steadyR === 0) return null
  const ratio = lowR / steadyR
  if (ratio >= 1.3) {
    return {
      big: `${ratio.toFixed(1)}× as often`,
      text: 'On your lower-pressure days, you’ve logged a rough day this much more often than on steadier days.',
      note,
    }
  }
  if (ratio <= 0.77) {
    return {
      big: 'No clear link yet',
      text: 'So far your rough days aren’t landing on the lower-pressure days. Pressure may not be your main driver.',
      note,
    }
  }
  return {
    big: 'About the same',
    text: 'So far, rough days are about as common on lower- and higher-pressure days. Keep logging.',
    note,
  }
}

// Plain-language correlation: did lower-pressure days line up with worse days?
function buildInsight(history, unit) {
  const rows = history.filter((h) => h.minPressure != null && h.type)
  if (rows.length < 4) {
    return 'Keep logging. In a few more days this will start to show whether low pressure lines up with your pain.'
  }
  const bad = rows.filter((r) => r.type === 'rough')
  const good = rows.filter((r) => r.type === 'good')
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
