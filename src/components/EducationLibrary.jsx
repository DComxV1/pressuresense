import { useState } from 'react'
import { rankedArticles } from '../lib/education.js'

// A8: short, condition-keyed explainers in an accordion. Articles relevant to
// the user's conditions are surfaced first and flagged "For you".
export default function EducationLibrary({ conditions }) {
  const [openId, setOpenId] = useState(null)
  const articles = rankedArticles(conditions)

  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-4">
      <div className="mb-1 text-xs uppercase tracking-wide text-muted">Learn</div>
      <p className="mb-3 text-xs text-muted">Short, practical reads. General wellness, not medical advice.</p>
      <ul className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60">
        {articles.map((a) => {
          const open = openId === a.id
          return (
            <li key={a.id}>
              <button
                onClick={() => setOpenId(open ? null : a.id)}
                aria-expanded={open}
                className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left hover:bg-surface-2"
              >
                <span>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text">{a.title}</span>
                    {a.forYou && (
                      <span className="rounded-full bg-accent/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        For you
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">{a.summary}</span>
                </span>
                <span className="mt-0.5 shrink-0 text-muted" aria-hidden>
                  {open ? '−' : '+'}
                </span>
              </button>
              {open && (
                <div className="px-3 pb-4 pt-0">
                  <p className="text-sm leading-relaxed text-muted">{a.intro}</p>
                  <ul className="mt-2 space-y-1.5">
                    {a.tips.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm text-text">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  {a.note && (
                    <p className="mt-3 rounded-lg bg-surface-2 p-2.5 text-xs leading-relaxed text-muted">
                      {a.note}
                    </p>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
