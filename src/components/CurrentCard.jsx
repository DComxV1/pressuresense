import { bandClasses, trendArrow } from './bandStyles.js'
import { formatPressure, hPaToInHg } from '../lib/format.js'
import { BAND_META } from '../lib/tips.js'

function trend3hLabel(delta, unit) {
  if (delta == null) return null
  const sign = delta > 0 ? '+' : ''
  const v = unit === 'inHg' ? `${hPaToInHg(delta).toFixed(3)} inHg` : `${delta.toFixed(1)} hPa`
  return `${sign}${v} over 3h`
}

const trendWord = { rising: 'Rising', falling: 'Falling', steady: 'Steady' }

export default function CurrentCard({ current, unit }) {
  if (!current) return null
  const c = bandClasses[current.band]
  const meta = BAND_META[current.band]
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Current pressure</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums text-slate-100">
              {formatPressure(current.hPa, unit)}
            </span>
          </div>
          <div className={`mt-1 text-sm ${c.text}`}>
            {trendArrow[current.trend]} {trendWord[current.trend]}
            {current.trend3h != null && (
              <span className="text-slate-400"> · {trend3hLabel(current.trend3h, unit)}</span>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-2 rounded-full ${c.bg} ${c.text} px-3 py-1 text-sm font-medium`}>
          <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
          {meta.label}
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-300">{meta.headline}</p>
    </div>
  )
}
