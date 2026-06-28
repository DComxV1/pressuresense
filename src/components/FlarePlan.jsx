import { useState } from 'react'
import { PLAN_ACTIONS, PLAN_SHOW_LIMIT, resolvePlan } from '../lib/plan.js'
import { CLINICIAN_CHECK } from '../lib/safety.js'

// Today's Plan / My Flare Plan. The senior-first heart of the app: the user
// keeps a short personal plan of safe actions; this shows it back for today and
// lets them tick what they tried. Each tick toggles the matching Day Log factor,
// so "what helped" flows straight into the pattern view.
const INTRO = {
  green: 'A calm day. Keep things gentle, and tick anything you do.',
  yellow: 'A few small steps may help today. Tick what you try.',
  red: 'Let’s plan around today. Tick what you try, and mark what helps.',
}

export default function FlarePlan({ band = 'green', planKeys = [], factors = [], onToggleFactor, onChangePlan }) {
  const [editing, setEditing] = useState(false)
  const chosen = resolvePlan(planKeys)
  const shown = chosen.slice(0, PLAN_SHOW_LIMIT)
  const extra = chosen.length - shown.length

  function togglePlan(key) {
    const set = new Set(planKeys)
    set.has(key) ? set.delete(key) : set.add(key)
    onChangePlan([...set])
  }

  return (
    <section aria-labelledby="plan-title" className="rounded-2xl border border-border/60 bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="plan-title" className="text-base font-semibold text-text">
          Today’s plan
        </h2>
        <button
          onClick={() => setEditing((v) => !v)}
          aria-expanded={editing}
          className="min-h-touch rounded-lg px-3 text-sm font-medium text-accent hover:bg-surface-2"
        >
          {editing ? 'Done' : chosen.length ? 'Edit plan' : 'Build plan'}
        </button>
      </div>

      {editing ? (
        <div className="mt-3">
          <p className="text-sm text-muted">
            Choose the safe actions that work for you. These are the ones you’ll see on tougher days.
          </p>
          <ul className="mt-3 space-y-2">
            {PLAN_ACTIONS.map((a) => {
              const on = planKeys.includes(a.key)
              return (
                <li key={a.key}>
                  <button
                    onClick={() => togglePlan(a.key)}
                    aria-pressed={on}
                    className={`flex min-h-touch w-full items-start gap-3 rounded-xl border px-3 py-2 text-left transition ${
                      on ? 'border-accent bg-accent/10' : 'border-border hover:bg-surface-2'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm ${
                        on ? 'border-accent bg-accent text-white' : 'border-border text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-text">{a.label}</span>
                      <span className="block text-xs leading-relaxed text-muted">{a.hint}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : chosen.length === 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          You don’t have a plan yet. Tap <span className="font-medium text-text">Build plan</span> to choose a
          few safe actions that work for you. They’ll show up here on tougher days.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">{INTRO[band] || INTRO.green}</p>
          <ul className="mt-3 space-y-2">
            {shown.map((a) => {
              const done = factors.includes(a.factor)
              return (
                <li key={a.key}>
                  <button
                    onClick={() => onToggleFactor(a.factor)}
                    aria-pressed={done}
                    aria-label={`${a.label}${done ? ', marked as done' : ''}`}
                    className={`flex min-h-touch w-full items-start gap-3 rounded-xl border px-3 py-2 text-left transition ${
                      done ? 'border-good/50 bg-good/10' : 'border-border hover:bg-surface-2'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm ${
                        done ? 'border-good bg-good text-white' : 'border-border text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm font-medium ${done ? 'text-good-ink' : 'text-text'}`}>
                        {a.label}
                      </span>
                      <span className="block text-xs leading-relaxed text-muted">{a.hint}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {extra > 0 && (
            <p className="mt-2 text-xs text-muted">{extra} more in your plan. Tap Edit plan to see them.</p>
          )}
        </>
      )}

      <p className="mt-3 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted">{CLINICIAN_CHECK}</p>
    </section>
  )
}
