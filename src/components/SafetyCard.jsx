import { URGENT_INTRO, URGENT_SIGNS, US_HELP } from '../lib/safety.js'

// "When to get help now." Always visible (never hidden behind a toggle), plain
// language, senior-first. Calm, not alarmist: a clear heading, a short list of
// signs, and the two US helplines as large tap targets. Given a DOM id so the
// briefing can link to it on rougher days.
export default function SafetyCard({ id = 'safety-help' }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-4 rounded-2xl border border-high/40 bg-high/5 p-5"
    >
      <h3 id={`${id}-title`} className="flex items-center gap-2 text-base font-semibold text-text">
        <span aria-hidden className="text-high-ink">
          ✚
        </span>
        When to get help now
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-text">{URGENT_INTRO}</p>

      <ul className="mt-3 space-y-2">
        {URGENT_SIGNS.map((sign, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-text">
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-high" />
            <span>{sign}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <a
          href={`tel:${US_HELP.emergency.number}`}
          className="flex min-h-touch items-center justify-center gap-2 rounded-xl bg-high px-4 text-base font-semibold text-white"
        >
          <span aria-hidden>📞</span>
          Call {US_HELP.emergency.number}
          <span className="font-normal">{US_HELP.emergency.label}</span>
        </a>
        <a
          href={`tel:${US_HELP.crisis.number}`}
          className="flex min-h-touch items-center justify-center gap-2 rounded-xl border border-high/50 px-4 text-base font-semibold text-high-ink"
        >
          <span aria-hidden>💬</span>
          Call {US_HELP.crisis.number}
          <span className="font-normal text-muted">{US_HELP.crisis.label}</span>
        </a>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        This list can’t cover everything. When in doubt, contact your clinician or local emergency
        number. Numbers shown are for the United States.
      </p>
    </section>
  )
}
