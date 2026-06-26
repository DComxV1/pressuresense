import { bandClasses } from './bandStyles.js'
import { BAND_META } from '../lib/tips.js'
import { dayLabel, hourLabel, formatPressure } from '../lib/format.js'

// Per-day risk rating for the next few days.
export default function ForecastStrip({ days, unit, onSelect, selectedKey }) {
  if (!days?.length) return null
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Next few days</div>
      <div className="grid grid-cols-3 gap-3">
        {days.map((d) => {
          const c = bandClasses[d.band]
          const meta = BAND_META[d.band]
          const isSel = d.key === selectedKey
          return (
            <button
              key={d.key}
              onClick={() => onSelect?.(d.key)}
              className={`rounded-xl border ${c.border} ${c.bg} p-3 text-left transition ${
                isSel ? 'ring-2 ring-slate-400/60' : 'hover:border-slate-500/60'
              }`}
            >
              <div className="text-sm font-medium text-slate-200">{dayLabel(d.date)}</div>
              <div className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${c.text}`}>
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                {meta.label}
              </div>
              <div className="mt-2 text-[11px] leading-tight text-slate-400">
                low {formatPressure(d.minPressure, unit)}
              </div>
              {d.band !== 'green' && d.steepestRate != null && d.steepestRate < -1.5 && (
                <div className="text-[11px] leading-tight text-slate-400">
                  drop ~{hourLabel(d.steepestRateHour)}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
