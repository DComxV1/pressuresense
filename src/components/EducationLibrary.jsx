import { useState } from 'react'
import { rankedArticles } from '../lib/education.js'

// A8: short, condition-keyed explainers in an accordion. Articles relevant to
// the user's conditions are surfaced first and flagged "For you". Sized for easy
// reading and tapping (the core audience skews older).
export default function EducationLibrary({ conditions }) {
  const [openId, setOpenId] = useState(null)
  const articles = rankedArticles(conditions)

  return (
    <div className="px-1">
      <p className="mb-3 text-sm text-muted">Short, practical reads. General wellness, not medical advice.</p>
      <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-surface">
        {articles.map((a) => {
          const open = openId === a.id
          return (
            <li key={a.id}>
              <button
                onClick={() => setOpenId(open ? null : a.id)}
                aria-expanded={open}
                className="flex min-h-touch w-full items-center gap-3 px-3 py-4 text-left hover:bg-surface-2"
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {a.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-text">{a.title}</span>
                    {a.forYou && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-white">
                        For you
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{a.summary}</span>
                </span>
                <span className="shrink-0 text-2xl leading-none text-muted" aria-hidden>
                  {open ? '−' : '+'}
                </span>
              </button>
              {open && (
                <div className="px-3 pb-5 pl-12">
                  <p className="text-base leading-relaxed text-text">{a.intro}</p>
                  <ul className="mt-3 space-y-2">
                    {a.tips.map((t, i) => (
                      <li key={i} className="flex gap-2.5 text-base text-text">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  {a.note && (
                    <p className="mt-4 rounded-lg bg-surface-2 p-3 text-sm leading-relaxed text-muted">{a.note}</p>
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
