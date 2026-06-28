// Mitigation tip engine + plain-language briefing.
//
// The product IS the coaching, not the chart. Tips scale with the risk band
// and mirror the real mechanisms: calf-muscle pump for venous return (ankle
// swelling), staying ahead of inflammation rather than reacting to it.

import { hourLabel, hPaToInHg } from './format.js'

// `color` resolves a CSS token, so charts recolor automatically when the theme
// changes. `icon` is the redundant shape signal that rides alongside the label.
export const BAND_META = {
  green: { label: 'GREEN', title: 'Low risk', icon: '✓', color: 'rgb(var(--good))' },
  yellow: { label: 'YELLOW', title: 'Moderate risk', icon: '⚠', color: 'rgb(var(--caution))' },
  red: { label: 'RED', title: 'High risk', icon: '◆', color: 'rgb(var(--high))' },
}

export const TIPS = {
  green: [
    'A good day to be active. Keep your normal routine.',
    'A solid day to bank some gentle movement, like a longer walk if that suits you.',
    'Drink fluids steadily, unless your clinician has told you to limit them.',
  ],
  yellow: [
    'Drink fluids steadily through the day, unless your clinician has told you to limit them.',
    'Keep moving in short bursts, and try not to sit for too long.',
    'Gentle stretching or range-of-motion, especially ankles and calves.',
    'Take a short walk after meals if you are up to it.',
    'If a clinician has said compression is safe for you, it can help during long spells of sitting or standing.',
  ],
  red: [
    'Follow your clinician-approved pain or anti-inflammatory plan as directed.',
    'Favor gentle movement over intense activity today.',
    'Put your feet up when you rest.',
    'Try gentle warmth on stiff joints.',
    'Keep fluids steady through the day, unless your clinician has told you to limit them.',
    'Plan a lighter day and pace yourself.',
    'Use compression only if a clinician has told you it is safe for you.',
  ],
}

// Build the plain-language morning briefing from today's forecast + now.
// Returns `{ band, headline, text }`: the headline is the short, human verdict
// that rides over the hero color; the text is the coaching body beneath it.
export function buildBriefing(today, current) {
  if (!today) {
    return {
      band: current?.band || 'green',
      headline: 'Reading today’s pressure.',
      text: 'Not enough forecast data yet for a full briefing.',
    }
  }
  // Tone discipline (A9): describe the day in plain, non-dread language and
  // always pair any warning with agency. The GREEN/YELLOW/RED label still shows
  // in the card header for at-a-glance clarity; the narrative stays gentle.
  const descriptor = { green: 'a good day', yellow: 'a moderate day', red: 'a tougher day' }[
    today.band
  ]
  const headline = `Today looks like ${descriptor}.`
  const parts = []

  // Describe the pressure movement.
  if (today.band === 'green') {
    parts.push('Pressure stays comfortable and steady.')
  } else {
    const dropAt =
      today.steepestRate != null && today.steepestRate < -1.5
        ? ` around ${hourLabel(today.steepestRateHour)}`
        : ''
    const verb = today.band === 'red' ? 'A sharp pressure drop is coming' : 'Pressure eases down'
    parts.push(`${verb}${dropAt}.`)
  }

  // Current direction context, only on tougher days, so a trivial dip never
  // injects "start your measures" urgency into an otherwise good day (A9).
  if (current && today.band !== 'green') {
    if (current.trend === 'falling') {
      parts.push('It’s already easing now, so it may help to start your usual steps early.')
    } else if (current.trend === 'rising') {
      parts.push('Pressure is rising now, which often brings relief.')
    }
  }

  // Lead action. Every briefing ends with something to *do*.
  parts.push(leadAction(today.band))

  return { band: today.band, headline, text: parts.join(' ') }
}

function leadAction(band) {
  if (band === 'green') return 'Make the most of it. It’s a good day to be active.'
  if (band === 'yellow')
    return 'A few small, gentle steps may help: drink fluids steadily (unless your clinician has limited them), keep moving in short bursts, and rest when you need to.'
  return 'A good day to keep things gentle. Follow your clinician-approved pain plan as directed, put your feet up when you rest, and drink fluids steadily unless your clinician has limited them.'
}

// Consecutive recent good days (felt good, else predicted green), counted from
// the most recent entry back. Used for positive reinforcement (A9).
export function goodStreak(history) {
  let n = 0
  for (const h of history) {
    const good = h.type ? h.type === 'good' : h.predictedBand === 'green'
    if (good) n++
    else break
  }
  return n
}

// A short, warm note for good days and good streaks. Returns null on tougher
// days; we never fake positivity, the briefing carries the agency there.
export function buildEncouragement(today, streak) {
  if (streak >= 3) return `${streak} good days in a row. The weather’s been kind to you lately. Lovely run.`
  if (today?.band === 'green') return 'A calm, steady day. A good one to move a little and feel good.'
  return null
}

// Pick a deterministic-ish rotating subset so the card isn't overwhelming.
export function tipsForBand(band, count = 4) {
  const all = TIPS[band] || TIPS.green
  return all.slice(0, count)
}

// Condition-aware tips (A1). When the user has picked conditions, lead with one
// general tip then prioritize the mechanism-specific coaching for those
// conditions; otherwise fall back to the generic band tips.
export function tipsFor(band, conditions = [], count = 5) {
  if (!conditions?.length) return tipsForBand(band, count)
  const out = [(TIPS[band] || TIPS.green)[0]] // one general lead tip
  // Round-robin across conditions so multiple selections each get a voice.
  const lists = conditions.map((c) => (c.tips?.[band] || []).slice())
  let added = true
  while (out.length < count && added) {
    added = false
    for (const list of lists) {
      if (list.length) {
        const tip = list.shift()
        if (!out.includes(tip)) out.push(tip)
        added = true
        if (out.length >= count) break
      }
    }
  }
  return out
}

// Plain-language "why this rating?" that explains the pressure reasoning so the
// user learns their own pattern and trusts the forecast.
export function buildExplanation(today, current, unit = 'inHg') {
  if (!today) return 'Not enough forecast data to explain the rating yet.'
  const fmt = (hPa) =>
    unit === 'inHg' ? `${hPaToInHg(hPa).toFixed(2)} inHg` : `${Math.round(hPa)} hPa`
  const reasons = []

  // Rate of change is the headline driver.
  if (today.steepestRate != null && today.steepestRate <= -1.5) {
    reasons.push(
      `Pressure falls about ${Math.abs(today.steepestRate).toFixed(1)} hPa over 6 hours${
        today.steepestRateHour ? ` around ${hourLabel(today.steepestRateHour)}` : ''
      }. For many people a falling trend tracks with pain more than a steady low, so it counts for the most here.`,
    )
  } else if (today.steepestRate != null && today.steepestRate > 0.5) {
    reasons.push('Pressure is holding or rising through the day, which tends to bring relief.')
  } else {
    reasons.push('Pressure stays fairly flat through the day, so there’s little movement to set off a flare.')
  }

  // Absolute level.
  if (today.minPressure < 1009) {
    reasons.push(`It also dips to a low of ${fmt(today.minPressure)}, below the comfortable zone.`)
  } else if (today.minPressure >= 1013) {
    reasons.push(`The day's low stays at ${fmt(today.minPressure)}, inside the comfortable zone.`)
  }

  // Current direction.
  if (current?.forward?.trend === 'dropping' && current.forward.startHour) {
    reasons.push(`The drop starts after ${hourLabel(current.forward.startHour)}, so it’s worth getting ahead of it before then.`)
  }

  // Secondary environmental driver (A7), when weather factors are enabled.
  const envNote = {
    cold: 'Cold temperatures are adding to the stiffness risk today.',
    humidity: 'High humidity may be adding to it.',
    tempSwing: 'A sharp temperature swing is adding to the risk.',
  }[today.envDriver]
  if (envNote) reasons.push(envNote)

  return reasons.join(' ')
}
