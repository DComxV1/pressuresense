// Self-calibration (A4). After a couple of weeks of check-ins, find the
// sensitivity whose band predictions best match how the user actually felt,
// tuning the model to this person instead of the generic default.
//
// This works because each day's stored `score` is sensitivity-INDEPENDENT
// (sensitivity only shifts the band cutoffs). So we can replay every logged day
// at each candidate sensitivity and measure agreement with the felt rating.

import { scoreToBand, BAND_RANK, DEFAULT_CONFIG } from './risk.js'
import { TYPE_BAND } from './daylog.js'

export const MIN_CALIBRATION_DAYS = 10

// Logged days usable for calibration: have a model score and a logged day type.
export function calibrationRows(history) {
  return history
    .filter((h) => h.score != null && h.type && TYPE_BAND[h.type])
    .map((h) => ({ score: h.score, feltBand: TYPE_BAND[h.type] }))
}

// Ordinal distance between predicted and felt bands (green<yellow<red).
function totalDistance(rows, sensitivity, cfg) {
  let d = 0
  for (const r of rows) {
    const pred = scoreToBand(r.score, sensitivity, cfg)
    d += Math.abs(BAND_RANK[pred] - BAND_RANK[r.feltBand])
  }
  return d
}

// Share of days where the predicted band exactly matches the felt band.
export function accuracyAt(rows, sensitivity, cfg = DEFAULT_CONFIG) {
  if (!rows.length) return 0
  let hit = 0
  for (const r of rows) if (scoreToBand(r.score, sensitivity, cfg) === r.feltBand) hit++
  return hit / rows.length
}

// Suggest the best-fitting sensitivity. Needs enough days AND a mix of
// good/tough days, otherwise there's no signal to calibrate against.
export function suggestSensitivity(history, currentSensitivity = 50, cfg = DEFAULT_CONFIG) {
  const rows = calibrationRows(history)
  const distinct = new Set(rows.map((r) => r.feltBand)).size

  if (rows.length < MIN_CALIBRATION_DAYS) {
    return { ready: false, reason: 'count', count: rows.length, need: MIN_CALIBRATION_DAYS }
  }
  if (distinct < 2) {
    return { ready: false, reason: 'variety', count: rows.length }
  }

  let best = null
  for (let s = 0; s <= 100; s += 5) {
    const dist = totalDistance(rows, s, cfg)
    const tie = Math.abs(s - 50) // on ties, prefer the more neutral setting
    if (!best || dist < best.dist || (dist === best.dist && tie < best.tie)) {
      best = { s, dist, tie }
    }
  }

  return {
    ready: true,
    count: rows.length,
    suggested: best.s,
    current: currentSensitivity,
    currentAccuracy: accuracyAt(rows, currentSensitivity, cfg),
    suggestedAccuracy: accuracyAt(rows, best.s, cfg),
  }
}

// A simple, honest confidence state for how well we know this person's
// pressure-pain pattern. Drives plain-language framing across the app, and the
// doctor report summary. Deliberately cautious: weather-pain links are real but
// modest and individual, so we never overclaim.
//   none     -> not enough data yet
//   forming  -> a picture is starting to form
//   stronger -> rough days have leaned toward lower-pressure days
//   nolink   -> enough data, but pressure doesn't look like the main trigger
export function patternConfidence(history) {
  const typed = history.filter((h) => h.type)
  if (typed.length < 5) {
    return {
      level: 'none',
      label: 'Still learning',
      blurb: 'Keep logging how each day feels. We’re still learning your pattern.',
    }
  }

  const rows = history.filter((h) => h.type && h.minPressure != null)
  const good = rows.filter((r) => r.type === 'good')
  const rough = rows.filter((r) => r.type === 'rough')
  if (rows.length < 5 || !good.length || !rough.length) {
    return {
      level: 'forming',
      label: 'Pattern forming',
      blurb: 'A picture is starting to form. A few more logged days, with a mix of good and rough ones, will sharpen it.',
    }
  }

  const avg = (xs) => xs.reduce((s, r) => s + r.minPressure, 0) / xs.length
  const gap = avg(good) - avg(rough) // positive = rough days sit at lower pressure
  if (rows.length >= 8 && gap >= 1) {
    return {
      level: 'stronger',
      label: 'Stronger pattern',
      blurb: 'Your rough days have leaned toward lower-pressure days. This is your pattern, not a rule for everyone.',
    }
  }
  if (rows.length >= 8 && gap <= -1) {
    return {
      level: 'nolink',
      label: 'No clear pressure link yet',
      blurb: 'So far your rough days aren’t lining up with lower pressure. Pressure may not be your main trigger.',
    }
  }
  return {
    level: 'forming',
    label: 'Pattern forming',
    blurb: 'A picture is starting to form. A few more logged days will sharpen it.',
  }
}
