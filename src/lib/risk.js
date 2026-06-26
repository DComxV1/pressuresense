// Risk-scoring engine.
//
// Design principle (from the brief): RATE OF CHANGE matters more than the
// absolute pressure. A rapid drop provokes pain more than a steady low reading.
// So rate is weighted ~2x the absolute factor.
//
// All thresholds live in DEFAULT_CONFIG so they're easy to tune against real
// days. The sensitivity slider (0-100) shifts the band cutoffs: a more
// sensitive user crosses into YELLOW/RED at a lower score.

export const DEFAULT_CONFIG = {
  weights: {
    absolute: 0.35, // w1
    rate: 0.65, // w2  (rate weighted ~2x absolute)
  },
  // Absolute pressure factor (hPa). 0 = comfortable, 1 = bad.
  absolute: {
    comfortableMin: 1013, // at/above this -> 0 risk (comfort zone 1013-1023)
    severeLow: 996, // at/below this -> full absolute risk
  },
  // Rate-of-change factor: pressure change over a trailing 6h window (hPa/6h).
  rate: {
    meaningfulDrop: -2, // falling slower than this -> 0; this is where risk begins
    severeDrop: -8, // falling this fast (or faster) -> full rate risk
  },
  // Base score cutoffs (before sensitivity adjustment).
  bands: {
    yellow: 0.3,
    red: 0.6,
  },
  wakingHours: { start: 7, end: 22 }, // hours considered for a day's rating
}

const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x))

export function absoluteFactor(hPa, cfg = DEFAULT_CONFIG) {
  const { comfortableMin, severeLow } = cfg.absolute
  if (hPa >= comfortableMin) return 0
  if (hPa <= severeLow) return 1
  return (comfortableMin - hPa) / (comfortableMin - severeLow)
}

export function rateFactor(rateHpaPer6h, cfg = DEFAULT_CONFIG) {
  const { meaningfulDrop, severeDrop } = cfg.rate
  if (rateHpaPer6h >= meaningfulDrop) return 0 // rising, flat, or only drifting
  if (rateHpaPer6h <= severeDrop) return 1
  return (meaningfulDrop - rateHpaPer6h) / (meaningfulDrop - severeDrop)
}

// Sensitivity 0-100 -> multiplier on cutoffs. 50 is neutral (x1).
// Higher sensitivity lowers the cutoffs so flares trigger earlier.
function effectiveCutoffs(sensitivity, cfg) {
  const s = clamp(sensitivity / 50, 0.4, 2) // 0->0.4, 50->1, 100->2
  return {
    yellow: clamp(cfg.bands.yellow / s, 0.05, 0.95),
    red: clamp(cfg.bands.red / s, 0.1, 0.97),
  }
}

export function scoreToBand(score, sensitivity = 50, cfg = DEFAULT_CONFIG) {
  const cut = effectiveCutoffs(sensitivity, cfg)
  if (score >= cut.red) return 'red'
  if (score >= cut.yellow) return 'yellow'
  return 'green'
}

// Trailing 6h rate for index i. Hourly samples are 1h apart.
function rate6hAt(hourly, i) {
  const j = i - 6
  if (j < 0) return null
  return hourly[i].hPa - hourly[j].hPa
}

// Annotate every hourly sample with its risk components.
export function computeHourlyRisk(hourly, sensitivity = 50, cfg = DEFAULT_CONFIG) {
  return hourly.map((p, i) => {
    const rate6h = rate6hAt(hourly, i)
    const absF = absoluteFactor(p.hPa, cfg)
    const rateF = rate6h == null ? 0 : rateFactor(rate6h, cfg)
    const score = clamp(cfg.weights.absolute * absF + cfg.weights.rate * rateF)
    return {
      ...p,
      rate6h,
      absFactor: absF,
      rateFactor: rateF,
      score,
      band: scoreToBand(score, sensitivity, cfg),
    }
  })
}

const BAND_RANK = { green: 0, yellow: 1, red: 2 }

// Current conditions: the sample nearest to `now`, plus a short-term trend.
export function currentConditions(scored, now = new Date()) {
  if (!scored.length) return null
  let nearest = 0
  let best = Infinity
  scored.forEach((p, i) => {
    const d = Math.abs(p.time.getTime() - now.getTime())
    if (d < best) {
      best = d
      nearest = i
    }
  })
  const cur = scored[nearest]
  // 3h trend for the arrow.
  const prev = scored[nearest - 3]
  let trend = 'steady'
  let trend3h = null
  if (prev) {
    trend3h = cur.hPa - prev.hPa
    if (trend3h > 0.4) trend = 'rising'
    else if (trend3h < -0.4) trend = 'falling'
  }
  return { ...cur, index: nearest, trend, trend3h }
}

// Group future hours into per-day summaries with a worst-case rating.
export function dailyForecast(scored, now = new Date(), days = 3, cfg = DEFAULT_CONFIG) {
  const byDay = new Map()
  for (const p of scored) {
    // Only look forward from the current hour onward.
    if (p.time.getTime() < now.getTime() - 60 * 60 * 1000) continue
    const hour = p.time.getHours()
    if (hour < cfg.wakingHours.start || hour > cfg.wakingHours.end) continue
    const key = p.time.toDateString()
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key).push(p)
  }

  const out = []
  for (const [key, hours] of byDay) {
    const worst = hours.reduce((a, b) => (b.score > a.score ? b : a), hours[0])
    const minPressure = hours.reduce((a, b) => (b.hPa < a.hPa ? b : a), hours[0])
    const steepestDrop = hours.reduce(
      (a, b) => (b.rate6h != null && b.rate6h < (a.rate6h ?? 0) ? b : a),
      hours[0],
    )
    out.push({
      key,
      date: new Date(key),
      band: worst.band,
      score: worst.score,
      peakHour: worst.time,
      minPressure: minPressure.hPa,
      minPressureHour: minPressure.time,
      steepestRate: steepestDrop.rate6h,
      steepestRateHour: steepestDrop.time,
      hours,
    })
  }
  out.sort((a, b) => a.date - b.date)
  return out.slice(0, days)
}

export { BAND_RANK }
