// Mitigation tip engine + plain-language briefing.
//
// The product IS the coaching, not the chart. Tips scale with the risk band
// and mirror the real mechanisms: calf-muscle pump for venous return (ankle
// swelling), staying ahead of inflammation rather than reacting to it.

import { hourLabel, hPaToInHg } from './format.js'

export const BAND_META = {
  green: {
    label: 'GREEN',
    title: 'Low risk',
    color: '#16a34a',
    headline: 'Good day. Pressure is stable and comfortable.',
  },
  yellow: {
    label: 'YELLOW',
    title: 'Moderate risk',
    color: '#d97706',
    headline: 'Some pressure movement today. Stay ahead of it.',
  },
  red: {
    label: 'RED',
    title: 'High risk',
    color: '#dc2626',
    headline: 'Significant pressure drop. Be proactive before a flare.',
  },
}

export const TIPS = {
  green: [
    'Good day to be active — keep your normal routine.',
    'A solid day to bank some movement: a longer walk pays off.',
    'Stay hydrated and keep the habits going.',
  ],
  yellow: [
    'Hydrate steadily through the day.',
    'Keep moving in short bursts — don’t sit for long stretches.',
    'Wear compression socks if sitting or standing a while.',
    'Do gentle stretching, especially ankles and calves.',
    'Take a short walk after meals to keep circulation moving.',
  ],
  red: [
    'Get ahead of inflammation early — don’t wait for the flare.',
    'Favor gentle movement over intense activity today.',
    'Elevate feet when resting to help ankle drainage.',
    'Apply warmth to stiff joints.',
    'Extra hydration throughout the day.',
    'Wear compression socks during the day.',
    'Plan a lighter day and pace yourself.',
  ],
}

// Build the plain-language morning briefing from today's forecast + now.
export function buildBriefing(today, current) {
  if (!today) {
    return {
      band: current?.band || 'green',
      text: 'Not enough forecast data yet for a full briefing.',
    }
  }
  const meta = BAND_META[today.band]
  const parts = [`Today looks like a ${meta.label} day.`]

  // Describe the pressure movement.
  if (today.band === 'green') {
    parts.push('Pressure stays in the comfortable, stable zone.')
  } else {
    const dropAt = today.steepestRate != null && today.steepestRate < -1.5
      ? ` around ${hourLabel(today.steepestRateHour)}`
      : ''
    const verb = today.band === 'red' ? 'a rapid drop' : 'pressure dropping'
    parts.push(`Expect ${verb}${dropAt}.`)
  }

  // Current direction context.
  if (current) {
    if (current.trend === 'falling') {
      parts.push('Pressure is already falling right now — start your measures now.')
    } else if (current.trend === 'rising') {
      parts.push('Pressure is rising at the moment, which usually brings relief.')
    }
  }

  // Lead action.
  parts.push(leadAction(today.band))

  return { band: today.band, text: parts.join(' ') }
}

function leadAction(band) {
  if (band === 'green') return 'Make the most of it — a good day to be active.'
  if (band === 'yellow')
    return 'Hydrate, keep moving in short bursts, and consider compression socks.'
  return 'Start anti-inflammatory measures early, elevate feet when resting, and plan a lighter day.'
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

// Plain-language "why this rating?" — explains the pressure reasoning so the
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
      } — a falling trend is the strongest pain trigger, which is why this weighs heaviest.`,
    )
  } else if (today.steepestRate != null && today.steepestRate > 0.5) {
    reasons.push('Pressure is holding or rising through the day, which tends to bring relief.')
  } else {
    reasons.push('Pressure stays fairly flat through the day — little movement to provoke a flare.')
  }

  // Absolute level.
  if (today.minPressure < 1009) {
    reasons.push(`It also dips to a low of ${fmt(today.minPressure)}, below the comfortable zone.`)
  } else if (today.minPressure >= 1013) {
    reasons.push(`The day's low stays at ${fmt(today.minPressure)}, inside the comfortable zone.`)
  }

  // Current direction.
  if (current?.forward?.trend === 'dropping' && current.forward.startHour) {
    reasons.push(`The drop begins after ${hourLabel(current.forward.startHour)} — act before then.`)
  }

  return reasons.join(' ')
}
