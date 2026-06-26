import { useState } from 'react'

export const JOINTS = ['Knees', 'Ankles', 'Feet', 'Hands', 'Wrists', 'Hips', 'Shoulders', 'Back', 'Neck']
export const SYMPTOMS = ['Swelling', 'Stiffness', 'Fatigue', 'Brain fog', 'Poor sleep', 'Headache']

const FELT = [
  { key: 'good', label: 'Good' },
  { key: 'meh', label: 'So-so' },
  { key: 'bad', label: 'Painful' },
]

// Today's check-in. Quick two-tap felt rating is primary; the richer detail
// (pain 1-10, joint + symptom tags) is optional behind a disclosure, never forced.
export default function CheckInCard({ entry, onChange }) {
  const [open, setOpen] = useState(false)
  const felt = entry?.felt ?? null
  const pain = entry?.pain ?? null
  const joints = entry?.joints ?? []
  const symptoms = entry?.symptoms ?? []

  const toggleTag = (field, list, value) =>
    onChange({ [field]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] })

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
      <div className="text-xs uppercase tracking-wide text-slate-300">Today’s check-in</div>
      <p className="mt-0.5 text-sm text-slate-300">How are you feeling today?</p>

      <div className="mt-3 inline-flex overflow-hidden rounded-lg border border-slate-600">
        {FELT.map((f) => (
          <button
            key={f.key}
            onClick={() => onChange({ felt: f.key })}
            aria-pressed={felt === f.key}
            className={`px-4 py-1.5 text-sm ${
              felt === f.key ? 'bg-slate-200 text-slate-900' : 'bg-transparent text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="ml-3 text-sm text-slate-300 underline decoration-slate-600 underline-offset-4 hover:text-slate-100"
      >
        {open ? 'Hide detail' : 'Add detail'}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="pain" className="text-sm text-slate-200">
                Pain level
              </label>
              <span className="text-sm tabular-nums text-slate-300">{pain == null ? 'Not set' : `${pain}/10`}</span>
            </div>
            <input
              id="pain"
              type="range"
              min="0"
              max="10"
              step="1"
              value={pain ?? 0}
              onChange={(e) => onChange({ pain: Number(e.target.value) })}
              aria-valuetext={pain == null ? 'not set' : `${pain} out of 10`}
              className="mt-2 w-full accent-rose-500"
            />
          </div>

          <TagGroup label="Where" tags={JOINTS} active={joints} onToggle={(v) => toggleTag('joints', joints, v)} />
          <TagGroup
            label="Symptoms"
            tags={SYMPTOMS}
            active={symptoms}
            onToggle={(v) => toggleTag('symptoms', symptoms, v)}
          />
        </div>
      )}
    </div>
  )
}

function TagGroup({ label, tags, active, onToggle }) {
  return (
    <div>
      <div className="text-sm text-slate-200">{label}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((t) => {
          const on = active.includes(t)
          return (
            <button
              key={t}
              onClick={() => onToggle(t)}
              aria-pressed={on}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                on
                  ? 'border-sky-400 bg-sky-600 text-white'
                  : 'border-slate-600 bg-transparent text-slate-300 hover:border-slate-400'
              }`}
            >
              {t}
            </button>
          )
        })}
      </div>
    </div>
  )
}
