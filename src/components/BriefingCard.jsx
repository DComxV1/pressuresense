import { bandClasses } from './bandStyles.js'

// The lead element of the app: "what today will feel like + what to do."
export default function BriefingCard({ briefing, tips }) {
  if (!briefing) return null
  const c = bandClasses[briefing.band]
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
        <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
        Today’s briefing
      </div>
      <p className="mt-2 text-lg font-medium leading-snug text-slate-100">{briefing.text}</p>
      {tips?.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {tips.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-300">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
