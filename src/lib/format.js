// Unit conversion + display helpers.
// Pressure arrives from the weather API in hPa (hectopascals / millibars).

export const HPA_TO_INHG = 0.02953

export function hPaToInHg(hPa) {
  return hPa * HPA_TO_INHG
}

// Format a pressure value in the user's chosen unit.
export function formatPressure(hPa, unit) {
  if (hPa == null || Number.isNaN(hPa)) return '--'
  if (unit === 'inHg') return `${hPaToInHg(hPa).toFixed(2)} inHg`
  return `${Math.round(hPa)} hPa`
}

// Format a rate of change (hPa per 6h) in the chosen unit, with sign.
export function formatRate(hPaPer6h, unit) {
  if (hPaPer6h == null || Number.isNaN(hPaPer6h)) return '--'
  const sign = hPaPer6h > 0 ? '+' : ''
  if (unit === 'inHg') {
    return `${sign}${hPaToInHg(hPaPer6h).toFixed(3)} inHg/6h`
  }
  return `${sign}${hPaPer6h.toFixed(1)} hPa/6h`
}

// e.g. "Mon", "Tue"
export function dayLabel(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}

// e.g. "2 PM"
export function hourLabel(date) {
  return date.toLocaleTimeString(undefined, { hour: 'numeric' })
}

// e.g. "Mon 2 PM"
export function dayHourLabel(date) {
  return `${dayLabel(date)} ${hourLabel(date)}`
}
