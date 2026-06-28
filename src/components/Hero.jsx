import { useState } from 'react'
import { bandClasses, trendArrow } from './bandStyles.js'
import { BAND_META } from '../lib/tips.js'
import { formatPressure, hPaToInHg, hourLabel } from '../lib/format.js'

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

const trendWord = { rising: 'Rising', falling: 'Falling', steady: 'Steady' }

function trend3hLabel(delta, unit) {
  if (delta == null) return null
  const sign = delta > 0 ? '+' : ''
  const v = unit === 'inHg' ? `${hPaToInHg(delta).toFixed(3)} inHg` : `${delta.toFixed(1)} hPa`
  return `${sign}${v} / 3h`
}

// What's coming next: the heads-up the user actually wants, at a glance.
function forwardLabel(forward) {
  if (!forward) return null
  if (forward.trend === 'dropping') {
    return forward.startHour ? `Dropping after ${hourLabel(forward.startHour)}` : 'Dropping ahead'
  }
  if (forward.trend === 'rising') return 'Rising ahead, usually a relief'
  return 'Holding steady ahead'
}

// Move 1: the "horizon" hero. The day's color is the first and biggest thing,
// with the plain-language verdict over it, the live pressure, and the one
// heads-up that matters most ("dropping after 2 PM"). The coaching detail lives
// in the card beneath it.
export default function Hero({ briefing, current, unit, dateLabel, encouragement }) {
  const [speaking, setSpeaking] = useState(false)
  if (!briefing) return null
  const c = bandClasses[briefing.band]
  const meta = BAND_META[briefing.band] || {}
  const label = meta.label || briefing.band.toUpperCase()
  const fwd = forwardLabel(current?.forward)
  const fwdAccent = current?.forward?.trend === 'dropping'

  function toggleSpeak() {
    const synth = window.speechSynthesis
    if (!synth) return
    if (synth.speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    const parts = [
      `Today, ${label}.`,
      briefing.headline,
      briefing.text,
      encouragement || '',
    ].filter(Boolean)
    const u = new SpeechSynthesisUtterance(parts.join(' '))
    u.rate = 0.95
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(u)
  }

  return (
    <section
      className={`rounded-3xl border ${c.heroBorder} ${c.hero} px-6 pb-6 pt-5`}
      aria-label={`Today: ${meta.title || label}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Today{dateLabel ? ` · ${dateLabel}` : ''}
        </div>
        <div
          className={`inline-flex items-center gap-1.5 rounded-full bg-surface/70 px-3 py-1 text-xs font-semibold ${c.text}`}
        >
          <span aria-hidden>{c.icon}</span>
          {label}
        </div>
      </div>

      <h2 className="mt-4 font-display text-[2rem] font-semibold leading-[1.15] text-text">
        {briefing.headline}
      </h2>

      {encouragement && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <span aria-hidden>☀️</span>
          {encouragement}
        </p>
      )}

      {current && (
        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-4xl font-semibold tabular-nums text-text">
            {formatPressure(current.hPa, unit)}
          </span>
          <span className={`text-sm ${c.text}`}>
            {trendArrow[current.trend]} {trendWord[current.trend]} now
            {current.trend3h != null && (
              <span className="text-muted"> · {trend3hLabel(current.trend3h, unit)}</span>
            )}
          </span>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {fwd && (
          <div
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm ${
              fwdAccent ? `bg-surface/70 ${c.text} font-medium` : 'bg-surface/60 text-muted'
            }`}
          >
            <span aria-hidden>{fwdAccent ? '↓' : '→'}</span>
            {fwd}
          </div>
        )}
        {canSpeak && (
          <button
            onClick={toggleSpeak}
            aria-pressed={speaking}
            className="ml-auto inline-flex min-h-touch items-center gap-1.5 rounded-lg bg-surface/70 px-3 text-sm text-text hover:bg-surface"
          >
            <span aria-hidden>{speaking ? '⏹' : '🔊'}</span>
            {speaking ? 'Stop' : 'Read aloud'}
          </button>
        )}
      </div>
    </section>
  )
}
