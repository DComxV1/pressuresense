import { useState } from 'react'
import { bandClasses } from './bandStyles.js'
import { BAND_META } from '../lib/tips.js'

// The lead element of the app: "what today will feel like + what to do."
export default function BriefingCard({ briefing, tips, explanation }) {
  const [showWhy, setShowWhy] = useState(false)
  if (!briefing) return null
  const c = bandClasses[briefing.band]
  const label = BAND_META[briefing.band]?.label || briefing.band.toUpperCase()
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
        <span className={`${c.text} not-italic`} aria-hidden>
          {c.icon}
        </span>
        Today’s briefing · {label}
      </div>
      <p className="mt-2 text-lg font-medium leading-snug text-text">{briefing.text}</p>
      {tips?.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {tips.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm text-text">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} aria-hidden />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
      {explanation && (
        <div className="mt-4">
          <button
            onClick={() => setShowWhy((v) => !v)}
            aria-expanded={showWhy}
            className="text-sm font-medium text-muted underline decoration-border underline-offset-4 hover:text-text"
          >
            {showWhy ? 'Hide reasoning' : `Why ${label.toLowerCase()}?`}
          </button>
          {showWhy && (
            <p className="mt-2 rounded-lg bg-surface-2 p-3 text-sm leading-relaxed text-muted">
              {explanation}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
