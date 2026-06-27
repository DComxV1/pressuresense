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
  // Absolute pressure factor. Measured as how far the reading sits BELOW the
  // user's own rolling baseline (median of the last ~72h), not distance from a
  // fixed sea-level number. This recenters per location, so it works at any
  // elevation and adapts to a persistent local pressure regime (FIX 3).
  absolute: {
    baselineHours: 72, // window for the rolling baseline
    deviationStart: 2, // hPa below baseline before absolute risk begins
    deviationSevere: 14, // hPa below baseline -> full absolute risk
    comfortableMin: 1013, // kept only for the chart's comfort-zone shading
    comfortableMax: 1023,
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

  // Broader environmental load (A7). Optional, off by default. When enabled,
  // pressure weights are scaled down by the env total so the score stays in
  // [0,1], and temperature/humidity/temp-swing contribute the rest.
  env: {
    weights: { cold: 0.1, humidity: 0.07, tempSwing: 0.13 }, // total 0.30
    cold: { warmAbove: 15, coldAt: 0 }, // °C: >=warm -> 0, <=coldAt -> 1
    humidity: { lowAt: 60, highAt: 95 }, // % RH
    tempSwing: { coolStart: -2, coolSevere: -8, warmStart: 4, warmSevere: 12 }, // °C/6h
  },
}

const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x))

function median(values) {
  const v = values.filter((x) => typeof x === 'number' && !Number.isNaN(x)).sort((a, b) => a - b)
  if (!v.length) return null
  const mid = Math.floor(v.length / 2)
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2
}

// Rolling baseline = median of the trailing `hours` samples up to and including i.
function baselineAt(hourly, i, hours) {
  const start = Math.max(0, i - hours)
  return median(hourly.slice(start, i + 1).map((p) => p.hPa))
}

// How far the reading is BELOW the user's rolling baseline. 0 = at/above normal,
// 1 = far below. Elevation-proof: it's relative to the user's own normal.
export function absoluteFactor(hPa, baseline, cfg = DEFAULT_CONFIG) {
  if (baseline == null || hPa == null) return 0
  const { deviationStart, deviationSevere } = cfg.absolute
  const below = baseline - hPa // positive when below normal
  if (below <= deviationStart) return 0
  if (below >= deviationSevere) return 1
  return (below - deviationStart) / (deviationSevere - deviationStart)
}

export function rateFactor(rateHpaPer6h, cfg = DEFAULT_CONFIG) {
  const { meaningfulDrop, severeDrop } = cfg.rate
  if (rateHpaPer6h >= meaningfulDrop) return 0 // rising, flat, or only drifting
  if (rateHpaPer6h <= severeDrop) return 1
  return (meaningfulDrop - rateHpaPer6h) / (meaningfulDrop - severeDrop)
}

// Environmental factors (A7). Each returns 0 (benign) .. 1 (aggravating).
export function coldFactor(tempC, cfg = DEFAULT_CONFIG) {
  if (tempC == null) return 0
  const { warmAbove, coldAt } = cfg.env.cold
  if (tempC >= warmAbove) return 0
  if (tempC <= coldAt) return 1
  return (warmAbove - tempC) / (warmAbove - coldAt)
}

export function humidityFactor(rh, cfg = DEFAULT_CONFIG) {
  if (rh == null) return 0
  const { lowAt, highAt } = cfg.env.humidity
  if (rh <= lowAt) return 0
  if (rh >= highAt) return 1
  return (rh - lowAt) / (highAt - lowAt)
}

// Rapid temperature swing over 6h. A cold snap (cooling) is the classic
// trigger; rapid warming contributes mildly.
export function tempSwingFactor(rate6h, cfg = DEFAULT_CONFIG) {
  if (rate6h == null) return 0
  const { coolStart, coolSevere, warmStart, warmSevere } = cfg.env.tempSwing
  if (rate6h <= coolStart) {
    if (rate6h <= coolSevere) return 1
    return (coolStart - rate6h) / (coolStart - coolSevere)
  }
  if (rate6h >= warmStart) {
    if (rate6h >= warmSevere) return 0.5
    return ((rate6h - warmStart) / (warmSevere - warmStart)) * 0.5
  }
  return 0
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
function rate6hAt(hourly, i, field = 'hPa') {
  const j = i - 6
  if (j < 0) return null
  const a = hourly[i][field]
  const b = hourly[j][field]
  if (a == null || b == null) return null
  return a - b
}

// Annotate every hourly sample with its risk components. When includeEnv is
// true, temperature/humidity/temp-swing are folded in (A7); pressure weights
// are scaled down by the env total so the combined score stays in [0,1].
export function computeHourlyRisk(hourly, sensitivity = 50, cfg = DEFAULT_CONFIG, includeEnv = false) {
  const ew = cfg.env.weights
  const envTotal = ew.cold + ew.humidity + ew.tempSwing
  const pScale = includeEnv ? 1 - envTotal : 1

  return hourly.map((p, i) => {
    const rate6h = rate6hAt(hourly, i)
    const baseline = baselineAt(hourly, i, cfg.absolute.baselineHours)
    const absF = absoluteFactor(p.hPa, baseline, cfg)
    const rateF = rate6h == null ? 0 : rateFactor(rate6h, cfg)
    let score = pScale * (cfg.weights.absolute * absF + cfg.weights.rate * rateF)

    let env = null
    if (includeEnv) {
      const tempRate6h = rate6hAt(hourly, i, 'tempC')
      const coldF = coldFactor(p.tempC, cfg)
      const humF = humidityFactor(p.rh, cfg)
      const swingF = tempSwingFactor(tempRate6h, cfg)
      score += ew.cold * coldF + ew.humidity * humF + ew.tempSwing * swingF
      env = { coldF, humF, swingF, tempRate6h, driver: dominantEnvDriver(coldF, humF, swingF) }
    }

    score = clamp(score)
    return {
      ...p,
      rate6h,
      absFactor: absF,
      rateFactor: rateF,
      env,
      score,
      band: scoreToBand(score, sensitivity, cfg),
    }
  })
}

// The most aggravating env factor for this hour, if any is notable (>0.5).
function dominantEnvDriver(coldF, humF, swingF) {
  const ranked = [
    ['tempSwing', swingF],
    ['cold', coldF],
    ['humidity', humF],
  ].sort((a, b) => b[1] - a[1])
  return ranked[0][1] > 0.5 ? ranked[0][0] : null
}

const BAND_RANK = { green: 0, yellow: 1, red: 2 }

// Current conditions: the sample nearest to `now`, plus a short-term trend.
export function currentConditions(scored, now = new Date(), cfg = DEFAULT_CONFIG) {
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
  // 3h trend for the arrow (where pressure has just been).
  const prev = scored[nearest - 3]
  let trend = 'steady'
  let trend3h = null
  if (prev) {
    trend3h = cur.hPa - prev.hPa
    if (trend3h > 0.4) trend = 'rising'
    else if (trend3h < -0.4) trend = 'falling'
  }

  // Forward-looking outlook: scan the next ~12h for the onset of a notable
  // fall, so the UI can say "dropping after 3 PM" rather than only the past.
  const horizon = Math.min(scored.length - 1, nearest + 12)
  const ahead6h = scored[nearest + 6]
  const change6h = ahead6h ? ahead6h.hPa - cur.hPa : null
  let forward = { trend: 'steady', startHour: null, change6h }
  for (let k = nearest + 1; k <= horizon; k++) {
    const end = scored[Math.min(k + 6, horizon)]
    const window = end.hPa - scored[k].hPa
    if (window <= cfg.rate.meaningfulDrop) {
      forward = { trend: 'dropping', startHour: scored[k].time, change6h }
      break
    }
  }
  if (forward.trend === 'steady' && change6h != null) {
    if (change6h >= 1.5) forward.trend = 'rising'
    else if (change6h <= -1.5) forward.trend = 'dropping'
  }

  return { ...cur, index: nearest, trend, trend3h, forward }
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
      envDriver: worst.env?.driver || null,
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
