// A5 — Flare log. Mark a rough day and note what helped; over time this builds
// a personal "what works for me" list, ranked by how often each remedy helped.

export const REMEDIES = [
  'Hydration',
  'Compression socks',
  'Elevation',
  'Gentle movement',
  'Rest',
  'Heat / warmth',
  'Ice',
  'Anti-inflammatory',
  'Stretching',
  'Acted early',
  'Lighter day',
]

export default function FlareLog({ history, todayKey, onMark, onUpdate, onToggleHelped, onUnmark }) {
  const todayEntry = history.find((h) => h.dateKey === todayKey)
  const todayFlare = todayEntry?.flare || null
  const flares = history.filter((h) => h.flare)
  const works = rankRemedies(flares)

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-slate-300">Flare log</div>
        {todayFlare ? (
          <button onClick={onUnmark} className="text-xs text-slate-300 underline underline-offset-4 hover:text-slate-100">
            Unmark today
          </button>
        ) : (
          <button
            onClick={onMark}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-500"
          >
            Mark today as a flare
          </button>
        )}
      </div>

      {todayFlare && (
        <div className="mt-4 space-y-3">
          <div className="text-sm text-rose-300">Today is marked as a flare.</div>
          <div>
            <div className="text-sm text-slate-200">What’s helping?</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {REMEDIES.map((r) => {
                const on = (todayFlare.helped || []).includes(r)
                return (
                  <button
                    key={r}
                    onClick={() => onToggleHelped(r)}
                    aria-pressed={on}
                    className={`rounded-full border px-2.5 py-1 text-xs transition ${
                      on
                        ? 'border-emerald-400 bg-emerald-600 text-white'
                        : 'border-slate-600 bg-transparent text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {on ? '✓ ' : ''}
                    {r}
                  </button>
                )
              })}
            </div>
          </div>
          <textarea
            value={todayFlare.note || ''}
            onChange={(e) => onUpdate({ note: e.target.value })}
            placeholder="Notes — what triggered it, what you tried, how it went…"
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500"
          />
        </div>
      )}

      {works.length > 0 && (
        <div className="mt-5">
          <div className="text-sm font-medium text-slate-200">What works for you</div>
          <p className="text-xs text-slate-400">Across {flares.length} logged flares.</p>
          <ul className="mt-2 space-y-1.5">
            {works.slice(0, 5).map((w) => (
              <li key={w.remedy} className="flex items-center gap-2 text-sm text-slate-200">
                <span className="w-28 shrink-0">{w.remedy}</span>
                <span className="h-2 rounded-full bg-emerald-500" style={{ width: `${w.count * 16 + 8}px` }} />
                <span className="text-xs text-slate-400">{w.count}×</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {flares.length > 0 && (
        <div className="mt-5">
          <div className="text-sm font-medium text-slate-200">Past flares</div>
          <ul className="mt-2 space-y-2">
            {flares.slice(0, 8).map((f) => (
              <li key={f.dateKey} className="rounded-lg border border-slate-700/50 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-200">{formatDate(f.dateKey)}</span>
                  {f.pain != null && <span className="text-xs text-slate-400">pain {f.pain}/10</span>}
                </div>
                {f.flare.helped?.length > 0 && (
                  <div className="mt-1 text-xs text-emerald-300">helped: {f.flare.helped.join(', ')}</div>
                )}
                {f.flare.note && <div className="mt-1 text-xs text-slate-400">“{f.flare.note}”</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function rankRemedies(flares) {
  const tally = {}
  for (const f of flares) for (const r of f.flare.helped || []) tally[r] = (tally[r] || 0) + 1
  return Object.entries(tally)
    .map(([remedy, count]) => ({ remedy, count }))
    .sort((a, b) => b.count - a.count)
}

function formatDate(key) {
  const d = new Date(key)
  if (Number.isNaN(d.getTime())) return key
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
