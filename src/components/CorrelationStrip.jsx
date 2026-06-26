import { BAND_META } from '../lib/tips.js'

// Maps a self-reported "felt" rating onto the same color scale as the
// predicted band, so alignment (or mismatch) reads at a glance — this is the
// whole point of the product: does the forecast match the body?
const FELT_BAND = { good: 'green', meh: 'yellow', bad: 'red' }
const FELT_LABEL = { good: 'Good', meh: 'So-so', bad: 'Painful' }

export default function CorrelationStrip({ history }) {
  if (!history?.length) return null
  // history is newest-first; take 7 and show oldest -> newest left to right.
  const days = history.slice(0, 7).slice().reverse()

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
      <div className="mb-3 text-xs uppercase tracking-wide text-slate-300">
        Last 7 days — predicted vs. felt
      </div>
      <div className="flex items-end justify-between gap-1">
        {days.map((d) => {
          const predColor = BAND_META[d.predictedBand]?.color || '#475569'
          const feltBand = d.felt ? FELT_BAND[d.felt] : null
          const feltColor = feltBand ? BAND_META[feltBand].color : null
          return (
            <div key={d.dateKey} className="flex flex-1 flex-col items-center gap-1">
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ background: predColor }}
                title={`Predicted ${BAND_META[d.predictedBand]?.label || ''}`}
              />
              <span
                className="h-3.5 w-3.5 rounded-full border border-slate-600"
                style={{ background: feltColor || 'transparent' }}
                title={d.felt ? `Felt ${FELT_LABEL[d.felt]}` : 'Not logged'}
              />
              <span className="mt-0.5 text-[10px] text-slate-400">{dayLetter(d.dateKey)}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-500" aria-hidden /> top: predicted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-slate-500" aria-hidden /> bottom: how you felt
        </span>
      </div>
    </div>
  )
}

function dayLetter(key) {
  const d = new Date(key)
  if (Number.isNaN(d.getTime())) return '?'
  return d.toLocaleDateString(undefined, { weekday: 'narrow' })
}
