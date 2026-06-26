import { useState } from 'react'
import { rankedArticles } from '../lib/education.js'

// A8: short, condition-keyed explainers in an accordion. Articles relevant to
// the user's conditions are surfaced first and flagged "For you".
export default function EducationLibrary({ conditions }) {
  const [openId, setOpenId] = useState(null)
  const articles = rankedArticles(conditions)

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
      <div className="mb-1 text-xs uppercase tracking-wide text-slate-300">Learn</div>
      <p className="mb-3 text-xs text-slate-400">Short, practical reads. General wellness, not medical advice.</p>
      <ul className="divide-y divide-slate-700/60 overflow-hidden rounded-lg border border-slate-700/60">
        {articles.map((a) => {
          const open = openId === a.id
          return (
            <li key={a.id}>
              <button
                onClick={() => setOpenId(open ? null : a.id)}
                aria-expanded={open}
                className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left hover:bg-slate-700/30"
              >
                <span>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-100">{a.title}</span>
                    {a.forYou && (
                      <span className="rounded-full bg-sky-600/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        For you
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">{a.summary}</span>
                </span>
                <span className="mt-0.5 shrink-0 text-slate-400" aria-hidden>
                  {open ? '−' : '+'}
                </span>
              </button>
              {open && (
                <div className="px-3 pb-4 pt-0">
                  <p className="text-sm leading-relaxed text-slate-300">{a.intro}</p>
                  <ul className="mt-2 space-y-1.5">
                    {a.tips.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-200">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  {a.note && (
                    <p className="mt-3 rounded-lg bg-slate-900/40 p-2.5 text-xs leading-relaxed text-slate-400">
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
