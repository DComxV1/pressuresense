import { BAND_META } from '../lib/tips.js'
import { DEFAULT_CONFIG } from '../lib/risk.js'
import { hourLabel, formatPressure } from '../lib/format.js'

// SVG sparkline of the selected day's hourly pressure:
//  - dots colored by hourly risk band (with a text legend, never color-only)
//  - a shaded "comfort zone" band as a Y reference
//  - the peak-risk hour marked on the curve itself
export default function HourlyChart({ day, unit }) {
  if (!day?.hours?.length) return null
  const hours = day.hours
  const W = 320
  const H = 110
  const pad = 10
  const padTop = 16 // room for the peak label
  const xs = hours.map((_, i) => pad + (i * (W - 2 * pad)) / Math.max(1, hours.length - 1))
  const values = hours.map((h) => h.hPa)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(1, max - min)
  const y = (v) => padTop + (1 - (v - min) / span) * (H - padTop - pad)
  const path = hours
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${xs[i].toFixed(1)} ${y(h.hPa).toFixed(1)}`)
    .join(' ')

  // Comfort zone, clipped to the visible domain.
  const { comfortableMin, comfortableMax } = DEFAULT_CONFIG.absolute
  const czLow = Math.max(min, comfortableMin)
  const czHigh = Math.min(max, comfortableMax)
  const showComfort = czHigh > czLow

  // Peak-risk hour marker.
  const peakIdx = hours.reduce((bi, h, i) => (h.score > hours[bi].score ? i : bi), 0)
  const peak = hours[peakIdx]
  const showPeak = peak.band !== 'green'

  // Which bands actually appear today -> legend.
  const presentBands = [...new Set(hours.map((h) => h.band))]

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-slate-300">
        <span>Hourly pressure</span>
        <span className="text-slate-400">
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
              fill="#16a34a"
              opacity="0.10"
            />
            <text x={W - 4} y={y(czHigh) + 10} textAnchor="end" fontSize="8" fill="#34d399">
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
              y2={H - pad}
              stroke={BAND_META[peak.band].color}
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            <text
              x={xs[peakIdx]}
              y={padTop - 8}
              textAnchor="middle"
              fontSize="8"
              fill={BAND_META[peak.band].color}
            >
              peak {hourLabel(peak.time)}
            </text>
          </g>
        )}

        <path d={path} fill="none" stroke="#94a3b8" strokeWidth="1.5" />

        {hours.map((h, i) => (
          <circle
            key={i}
            cx={xs[i]}
            cy={y(h.hPa)}
            r={i === peakIdx && showPeak ? 4 : 2.5}
            fill={BAND_META[h.band].color}
            stroke={i === peakIdx && showPeak ? '#0f172a' : 'none'}
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
          <span key={b} className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: BAND_META[b].color }}
              aria-hidden
            />
            {BAND_META[b].label}
          </span>
        ))}
        <span className="ml-auto text-[11px] text-slate-400">low {formatPressure(day.minPressure, unit)}</span>
      </div>
    </div>
  )
}
