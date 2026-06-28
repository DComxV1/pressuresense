import { CONDITIONS } from '../lib/conditions.js'

// Pick one or more conditions; coaching is filtered to their mechanisms.
// Doubles as onboarding (prominent prompt) and an always-available editor.
export default function ConditionSelector({ selected, onToggle, onboarding, onDismiss }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        onboarding ? 'border-accent/50 bg-accent/10' : 'border-border/60 bg-surface'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-text">
            {onboarding ? 'Personalize your coaching' : 'Your conditions'}
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {onboarding
              ? 'Select all that apply, so tips match how pressure affects you. You can change this anytime.'
              : 'Tips are tailored to these. Select all that apply.'}
          </p>
        </div>
        {onboarding && (
          <button
            onClick={onDismiss}
            className="-mr-2 -mt-1 inline-flex min-h-touch shrink-0 items-center rounded-lg px-3 text-sm text-muted underline underline-offset-4 hover:text-text"
          >
            Skip
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {CONDITIONS.map((c) => {
          const on = selected.includes(c.key)
          return (
            <button
              key={c.key}
              onClick={() => onToggle(c.key)}
              aria-pressed={on}
              title={c.blurb}
              className={`inline-flex min-h-touch items-center rounded-full border px-4 text-sm transition ${
                on
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-transparent text-text hover:border-muted'
              }`}
            >
              {on ? '✓ ' : ''}
              {c.label}
            </button>
          )
        })}
      </div>

      {onboarding && (
        <button
          onClick={onDismiss}
          className="mt-4 min-h-touch w-full rounded-lg bg-accent px-4 text-sm font-medium text-white"
        >
          {selected.length ? `Done (${selected.length} selected)` : 'Done'}
        </button>
      )}
    </div>
  )
}
