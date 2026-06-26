import { bandClasses, trendArrow } from './bandStyles.js'
import { formatPressure, hPaToInHg } from '../lib/format.js'
import { hourLabel } from '../lib/format.js'

const trendWord = { rising: 'Rising', falling: 'Falling', steady: 'Steady' }

function trend3hLabel(delta, unit) {
  if (delta == null) return null
  const sign = delta > 0 ? '+' : ''
  const v = unit === 'inHg' ? `${hPaToInHg(delta).toFixed(3)} inHg` : `${delta.toFixed(1)} hPa`
  return `${sign}${v} over 3h`
}

// What's coming next: the heads-up the user actually wants.
function forwardLabel(forward) {
  if (!forward) return null
  if (forward.trend === 'dropping') {
    return forward.startHour ? `Dropping after ${hourLabel(forward.startHour)}` : 'Dropping ahead'
  }
  if (forward.trend === 'rising') return 'Rising ahead, usually a relief'
  return 'Holding steady ahead'
}

// Numbers + trend only. The briefing carries the narrative (no duplicate headline).
export default function CurrentCard({ current, unit }) {
  if (!current) return null
  const c = bandClasses[current.band]
  const fwd = forwardLabel(current.forward)
  const fwdAccent = current.forward?.trend === 'dropping'
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-300">Current pressure</div>
          <div className="mt-1 text-4xl font-semibold tabular-nums text-slate-100">
            {formatPressure(current.hPa, unit)}
          </div>
          <div className={`mt-1 text-sm ${c.text}`}>
            {trendArrow[current.trend]} {trendWord[current.trend]} now
            {current.trend3h != null && (
              <span className="text-slate-300"> · {trend3hLabel(current.trend3h, unit)}</span>
            )}
          </div>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full ${c.bg} ${c.text} px-3 py-1 text-sm font-medium`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
          {current.band.toUpperCase()}
        </div>
      </div>
      {fwd && (
        <div
          className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm ${
            fwdAccent ? `${c.bg} ${c.text}` : 'bg-slate-700/40 text-slate-300'
          }`}
        >
          <span aria-hidden>{fwdAccent ? '↓' : '→'}</span>
          {fwd}
        </div>
      )}
    </div>
  )
}
