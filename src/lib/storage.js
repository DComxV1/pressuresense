// Local persistence (no backend in v1). Settings + a daily Day Log so the user
// can sanity-check the model against how they actually felt — and capture what
// they did, on good days as well as rough ones.

const SETTINGS_KEY = 'pressuresense.settings'
const HISTORY_KEY = 'pressuresense.history'

export const DEFAULT_SETTINGS = {
  unit: 'inHg', // 'inHg' | 'hPa'
  theme: 'light', // 'light' | 'dark' (light default per the a11y addendum)
  textSize: 'default', // 'default' | 'large' | 'xl'
  sensitivity: 50, // 0-100
  conditions: [], // selected condition keys (A1); [] => onboarding prompt
  onboarded: false, // dismissed the condition prompt at least once
  includeWeather: false, // fold temperature/humidity/temp-swing into the score (A7)
  morningHour: 7, // local hour for the good-day note (0-23)
  eveningHour: 19, // local hour for the tougher-day heads-up (0-23)
  // Seeded so the dashboard populates on first run; change via "Use my location"
  // or city search.
  location: { label: 'Nags Head, NC', latitude: 35.957, longitude: -75.624 },
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    /* ignore quota / private mode */
  }
}

// A day entry now uses a single unified shape:
//   { dateKey, predictedBand, score, minPressure,
//     type: 'good'|'soso'|'rough', pain, factors: [], note }
// Older entries used `felt`, a `flare` object, and joint/symptom tags; this
// migration folds them into the new shape so no logged data is lost. Idempotent.
function migrateEntry(h) {
  let type = h.type ?? null
  if (!type) {
    if (h.flare) type = 'rough'
    else if (h.felt === 'good') type = 'good'
    else if (h.felt === 'meh') type = 'soso'
    else if (h.felt === 'bad') type = 'rough'
  }
  const factors = h.factors ?? (h.flare?.helped ? [...h.flare.helped] : [])
  let note = h.note ?? h.flare?.note ?? ''
  const tags = [...(h.joints || []), ...(h.symptoms || [])]
  if (tags.length) note = (note ? note + ' ' : '') + `[${tags.join(', ')}]`
  const { felt, flare, joints, symptoms, ...rest } = h
  return { ...rest, type, factors, note }
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return arr.map(migrateEntry)
  } catch {
    return []
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 60)))
  } catch {
    /* ignore */
  }
  return loadHistory()
}

function ensureEntry(history, dateKey) {
  let existing = history.find((h) => h.dateKey === dateKey)
  if (!existing) {
    existing = { dateKey, predictedBand: null, score: null }
    history.unshift(existing)
  }
  return existing
}

// Upsert today's prediction. minPressure (hPa) is stored so the correlation
// view (A3) can plot actual pressure against the logged day type over time.
export function recordPrediction(dateKey, band, score, minPressure = null) {
  const history = loadHistory()
  const existing = history.find((h) => h.dateKey === dateKey)
  if (existing) {
    existing.predictedBand = band
    existing.score = score
    if (minPressure != null) existing.minPressure = minPressure
  } else {
    history.unshift({ dateKey, predictedBand: band, score, minPressure })
  }
  return saveHistory(history)
}

// ----- Day Log -----

// Set the day type ('good' | 'soso' | 'rough') for a day.
export function setDayType(dateKey, type) {
  const history = loadHistory()
  const entry = ensureEntry(history, dateKey)
  entry.type = type
  if (!entry.factors) entry.factors = []
  return saveHistory(history)
}

// Merge pain / note into a day entry.
export function updateDayLog(dateKey, patch) {
  const history = loadHistory()
  const entry = ensureEntry(history, dateKey)
  Object.assign(entry, patch)
  return saveHistory(history)
}

// Toggle a factor against the CURRENT stored state (not stale UI props).
export function toggleDayFactor(dateKey, factor) {
  const history = loadHistory()
  const entry = ensureEntry(history, dateKey)
  const set = new Set(entry.factors || [])
  set.has(factor) ? set.delete(factor) : set.add(factor)
  entry.factors = [...set]
  return saveHistory(history)
}

// Clear today's log (the day type and its detail), keeping the forecast.
export function clearDayLog(dateKey) {
  const history = loadHistory()
  const entry = history.find((h) => h.dateKey === dateKey)
  if (entry) {
    delete entry.type
    delete entry.pain
    delete entry.factors
    delete entry.note
  }
  return saveHistory(history)
}
