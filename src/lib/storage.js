// Local persistence (no backend in v1). Settings + a daily history log so the
// user can sanity-check the model against how they actually felt.

const SETTINGS_KEY = 'pressuresense.settings'
const HISTORY_KEY = 'pressuresense.history'

export const DEFAULT_SETTINGS = {
  unit: 'inHg', // 'inHg' | 'hPa'
  sensitivity: 50, // 0-100
  conditions: [], // selected condition keys (A1); [] => onboarding prompt
  onboarded: false, // dismissed the condition prompt at least once
  includeWeather: false, // fold temperature/humidity/temp-swing into the score (A7)
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

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Upsert today's prediction. minPressure (hPa) is stored so the correlation
// view (A3) can plot actual pressure against logged symptoms over time.
export function recordPrediction(dateKey, band, score, minPressure = null) {
  const history = loadHistory()
  const existing = history.find((h) => h.dateKey === dateKey)
  if (existing) {
    existing.predictedBand = band
    existing.score = score
    if (minPressure != null) existing.minPressure = minPressure
  } else {
    history.unshift({ dateKey, predictedBand: band, score, minPressure, felt: null })
  }
  const trimmed = history.slice(0, 60)
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
  } catch {
    /* ignore */
  }
  return trimmed
}

export function recordFelt(dateKey, felt) {
  return recordCheckIn(dateKey, { felt })
}

// Merge a check-in patch (felt, pain 1-10, joints[], symptoms[]) into a day.
// Creates the entry if today wasn't predicted yet. (A2)
export function recordCheckIn(dateKey, patch) {
  const history = loadHistory()
  let existing = history.find((h) => h.dateKey === dateKey)
  if (!existing) {
    existing = { dateKey, predictedBand: null, score: null, felt: null }
    history.unshift(existing)
  }
  Object.assign(existing, patch)
  return saveHistory(history)
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
    existing = { dateKey, predictedBand: null, score: null, felt: null }
    history.unshift(existing)
  }
  return existing
}

// Flare log (A5). Mark a rough day; optionally record what helped. The flare
// lives on the day's history entry as { note, helped: [] }.
export function markFlare(dateKey) {
  const history = loadHistory()
  const entry = ensureEntry(history, dateKey)
  if (!entry.flare) entry.flare = { note: '', helped: [] }
  if (entry.felt == null) entry.felt = 'bad' // a flare is, by definition, a bad day
  return saveHistory(history)
}

export function updateFlare(dateKey, patch) {
  const history = loadHistory()
  const entry = ensureEntry(history, dateKey)
  entry.flare = { note: '', helped: [], ...(entry.flare || {}), ...patch }
  return saveHistory(history)
}

export function unmarkFlare(dateKey) {
  const history = loadHistory()
  const entry = history.find((h) => h.dateKey === dateKey)
  if (entry) delete entry.flare
  return saveHistory(history)
}

// Toggle a remedy against the CURRENT stored state (not stale UI props), so
// rapid successive toggles can't clobber each other.
export function toggleFlareHelped(dateKey, remedy) {
  const history = loadHistory()
  const entry = ensureEntry(history, dateKey)
  entry.flare = { note: '', helped: [], ...(entry.flare || {}) }
  const set = new Set(entry.flare.helped)
  set.has(remedy) ? set.delete(remedy) : set.add(remedy)
  entry.flare.helped = [...set]
  return saveHistory(history)
}
