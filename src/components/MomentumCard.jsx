import { goodStreak } from '../lib/tips.js'

// A small, encouraging "this month" card — momentum without pressure. Celebrates
// good days and the top good-day factor; never scolds a broken streak.
export default function MomentumCard({ history }) {
  const now = new Date()
  const month = history.filter((h) => h.type && sameMonth(parseKey(h.dateKey), now))
  if (month.length < 3) return null

  const good = month.filter((h) => h.type === 'good').length
  const streak = goodStreak(history)
  const topFactor = topGoodFactor(history)

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="text-xs uppercase tracking-wide text-muted">This month</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-text">{good}</span>
        <span className="text-sm text-muted">good {good === 1 ? 'day' : 'days'} logged</span>
      </div>
      <div className="mt-2 space-y-1 text-sm text-text">
        {streak >= 2 && <p>You’re on a {streak}-day good run right now. Lovely.</p>}
        {topFactor && (
          <p>
            <span className="font-medium">{topFactor}</span> shows up most on your good days.
          </p>
        )}
        {streak < 2 && !topFactor && <p>Keep logging your good days — the wins add up.</p>}
      </div>
    </div>
  )
}

function parseKey(key) {
  const d = new Date(key)
  return Number.isNaN(d.getTime()) ? null : d
}
function sameMonth(d, ref) {
  return d && d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}
function topGoodFactor(history) {
  const tally = {}
  for (const h of history) if (h.type === 'good') for (const f of h.factors || []) tally[f] = (tally[f] || 0) + 1
  const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1])
  return ranked.length ? ranked[0][0] : null
}
