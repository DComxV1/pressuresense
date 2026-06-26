// A9: positive reinforcement. A slim, warm banner for good days and good
// streaks, so the app celebrates the wins rather than only flagging bad days.
export default function Encouragement({ text }) {
  if (!text) return null
  return (
    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
      <span aria-hidden>☀️</span>
      <span>{text}</span>
    </div>
  )
}
