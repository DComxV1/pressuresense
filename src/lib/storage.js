// Local persistence (no backend in v1). Settings + a daily history log so the
// user can sanity-check the model against how they actually felt.

const SETTINGS_KEY = 'pressuresense.settings'
const HISTORY_KEY = 'pressuresense.history'

export const DEFAULT_SETTINGS = {
  unit: 'inHg', // 'inHg' | 'hPa'
  sensitivity: 50, // 0-100
  conditions: [], // selected condition keys (A1); [] => onboarding prompt
  onboarded: false, // dismissed the condition prompt at least once
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

// Upsert today's predicted band; keep the user's self-reported "felt" rating.
export function recordPrediction(dateKey, band, score) {
  const history = loadHistory()
  const existing = history.find((h) => h.dateKey === dateKey)
  if (existing) {
    existing.predictedBand = band
    existing.score = score
  } else {
    history.unshift({ dateKey, predictedBand: band, score, felt: null })
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
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 60)))
  } catch {
    /* ignore */
  }
  return loadHistory()
}
