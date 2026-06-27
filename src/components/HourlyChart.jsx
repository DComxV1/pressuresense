import { BAND_META } from '../lib/tips.js'
import { DEFAULT_CONFIG, BAND_RANK } from '../lib/risk.js'
import { hourLabel, formatPressure } from '../lib/format.js'

// Move 3: the day's pressure shape, promoted. The line itself is the signal —
// each segment is stroked in its hour's risk band, so the curve visibly
// "heads into trouble" as it slopes toward a drop. Comfort-zone shading stays
// as the only Y reference; no axes, no gridlines.
export default function HourlyChart({ day, unit }) {
  if (!day?.hours?.length) return null
  const hours = day.hours
  const W = 320
  const H = 168
  const pad = 12
  const padTop = 22 // room for the peak label
  const padBottom = 14
  const xs = hours.map((_, i) => pad + (i * (W - 2 * pad)) / Math.max(1, hours.length - 1))
  const values = hours.map((h) => h.hPa)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(1, max - min)
  const y = (v) => padTop + (1 - (v - min) / span) * (H - padTop - padBottom)

  // Comfort zone, clipped to the visible domain.
  const { comfortableMin, comfortableMax } = DEFAULT_CONFIG.absolute
  const czLow = Math.max(min, comfortableMin)
  const czHigh = Math.min(max, comfortableMax)
  const showComfort = czHigh > czLow

  // Each segment takes the worse of its two endpoints' bands, so the line warns
  // on the way *into* a tougher hour, not only once it arrives.
  const segments = hours.slice(1).map((h, i) => {
    const a = hours[i]
    const b = h
    const band = BAND_RANK[b.band] >= BAND_RANK[a.band] ? b.band : a.band
    return { x1: xs[i], y1: y(a.hPa), x2: xs[i + 1], y2: y(b.hPa), band }
  })

  // Peak-risk hour marker.
  const peakIdx = hours.reduce((bi, h, i) => (h.score > hours[bi].score ? i : bi), 0)
  const peak = hours[peakIdx]
  const showPeak = peak.band !== 'green'

  // Which bands actually appear today -> legend.
  const presentBands = [...new Set(hours.map((h) => h.band))]

  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-4">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-muted">
        <span>Today’s pressure shape</span>
        <span className="text-muted">
          {hourLabel(hours[0].time)} – {hourLabel(hours[hours.length - 1].time)}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Hourly pressure for ${day.date.toDateString()}, peak risk near ${hourLabel(
          peak.time,
        )}, rated ${BAND_META[day.band].label}.`}
      >
        {showComfort && (
          <g>
            <rect
              x={0}
              y={y(czHigh)}
              width={W}
              height={Math.max(0, y(czLow) - y(czHigh))}
              fill="rgb(var(--good))"
              opacity="0.10"
            />
            <text x={W - 4} y={y(czHigh) + 11} textAnchor="end" fontSize="9" fill="rgb(var(--good-ink))">
              comfort zone
            </text>
          </g>
        )}

        {showPeak && (
          <g>
            <line
              x1={xs[peakIdx]}
              y1={padTop - 6}
              x2={xs[peakIdx]}
              y2={H - padBottom}
              stroke={BAND_META[peak.band].color}
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            <text
              x={xs[peakIdx]}
              y={padTop - 9}
              textAnchor="middle"
              fontSize="9"
              fill={BAND_META[peak.band].color}
            >
              peak {hourLabel(peak.time)}
            </text>
          </g>
        )}

        {segments.map((s, i) => (
          <line
            key={i}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke={BAND_META[s.band].color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {hours.map((h, i) => (
          <circle
            key={i}
            cx={xs[i]}
            cy={y(h.hPa)}
            r={i === peakIdx && showPeak ? 4.5 : 2.5}
            fill={BAND_META[h.band].color}
            stroke={i === peakIdx && showPeak ? 'rgb(var(--surface))' : 'none'}
            strokeWidth="1.5"
          >
            <title>
              {hourLabel(h.time)} · {formatPressure(h.hPa, unit)} · {BAND_META[h.band].label}
            </title>
          </circle>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {presentBands.map((b) => (
          <span key={b} className="flex items-center gap-1.5 text-[11px] text-muted">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: BAND_META[b].color }}
              aria-hidden
            />
            {BAND_META[b].label}
          </span>
        ))}
        <span className="ml-auto text-[11px] text-muted">low {formatPressure(day.minPressure, unit)}</span>
      </div>
    </div>
  )
}
