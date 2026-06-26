// A4: self-calibration UI. Suggests a sensitivity tuned to the user's own
// logged days, with one-tap apply. Shows progress before it's ready.

export default function CalibrationCard({ result, onApply }) {
  if (!result || result.count === 0) return null

  if (!result.ready) {
    const text =
      result.reason === 'variety'
        ? `You've logged ${result.count} days. To find your personal setting, it needs a mix of good and tough days, so keep logging through different weather.`
        : `Auto-calibration kicks in after ${result.need} days of check-ins. You're at ${result.count} of ${result.need}, so keep logging how you feel.`
    return (
      <div className="rounded-2xl border border-border/60 bg-surface p-5">
        <div className="text-sm font-medium text-text">Personal calibration</div>
        <p className="mt-1 text-sm text-muted">{text}</p>
        {result.reason !== 'variety' && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.min(100, (result.count / result.need) * 100)}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  const pct = (x) => `${Math.round(x * 100)}%`
  const improved = result.suggestedAccuracy > result.currentAccuracy + 0.001
  const same = result.suggested === result.current

  return (
    <div className="rounded-2xl border border-accent/40 bg-accent/10 p-5">
      <div className="text-sm font-medium text-text">Personal calibration</div>
      <p className="mt-1 text-sm text-muted">
        Based on your {result.count} logged days, your readings best match a sensitivity of{' '}
        <span className="font-semibold text-text">{result.suggested}</span>
        {!same && <> (currently {result.current}).</>}
        {same && <>, which is what you have now.</>}
      </p>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted">
        <span>
          Match now: <span className="font-semibold text-text">{pct(result.currentAccuracy)}</span>
        </span>
        <span aria-hidden>→</span>
        <span>
          Suggested:{' '}
          <span className={`font-semibold ${improved ? 'text-good-ink' : 'text-text'}`}>
            {pct(result.suggestedAccuracy)}
          </span>
        </span>
      </div>

      {same ? (
        <p className="mt-3 text-sm text-good-ink">You’re already well-calibrated to your logs.</p>
      ) : (
        <button
          onClick={() => onApply(result.suggested)}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent"
        >
          Use sensitivity {result.suggested}
        </button>
      )}
    </div>
  )
}
