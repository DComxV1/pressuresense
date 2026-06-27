// Weather data layer.
//
// This is the ONLY file that talks to a weather provider. To swap providers
// (OpenWeather One Call, Tomorrow.io, Apple WeatherKit for the iOS port),
// replace fetchPressureSeries() so it still returns the normalized shape:
//
//   { provider, hourly: [{ time: Date, hPa: number }, ...] }
//
// Open-Meteo is used here because it's free, needs no API key, and returns
// hourly sea-level pressure (pressure_msl) in hPa.

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

// Fetch with a timeout so a stalled network call can't leave the UI spinning.
async function fetchWithTimeout(url, ms = 8000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}

// Look up candidate locations by name. Returns [{ name, country, admin1, latitude, longitude }]
export async function geocode(query) {
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  let res
  try {
    res = await fetchWithTimeout(url)
  } catch {
    throw new Error('Couldn’t search locations. Check your connection and try again.')
  }
  if (!res.ok) throw new Error(`Couldn’t search locations (${res.status}).`)
  const data = await res.json()
  return (data.results || []).map((r) => ({
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
    label: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
  }))
}

// Turn a coordinate into a place name (used after browser geolocation).
// Open-Meteo has no reverse geocode, so this uses BigDataCloud's free,
// keyless, CORS-enabled client endpoint. Falls back to coordinates on failure
// (including a network stall, via the timeout).
export async function reverseGeocode(lat, lon) {
  const coords = `${lat.toFixed(2)}, ${lon.toFixed(2)}`
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    const res = await fetchWithTimeout(url)
    if (!res.ok) return coords
    const d = await res.json()
    const place = d.city || d.locality || d.principalSubdivision
    const region = d.principalSubdivisionCode?.split('-')?.[1] || d.principalSubdivision
    const label = [place, region].filter(Boolean).join(', ')
    return label || coords
  } catch {
    return coords
  }
}

// Fetch hourly barometric pressure spanning ~1 day past to 3 days ahead.
// Past hours let us compute the current trend; future hours drive the forecast.
export async function fetchPressureSeries(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: 'pressure_msl,surface_pressure,temperature_2m,relative_humidity_2m',
    forecast_days: '4',
    // 3 past days so the rolling baseline (risk.js) has ~72h of history.
    past_days: '3',
    timezone: 'auto',
  })
  const res = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`, 12000)
  if (!res.ok) throw new Error(`Forecast fetch failed (${res.status})`)
  const data = await res.json()

  const times = data.hourly?.time || []
  const msl = data.hourly?.pressure_msl || []
  const surface = data.hourly?.surface_pressure || []
  const temps = data.hourly?.temperature_2m || []
  const humidity = data.hourly?.relative_humidity_2m || []

  const hourly = times
    .map((t, i) => ({
      // timezone=auto returns local wall-clock strings (no Z); parse as local.
      time: new Date(t),
      // hPa is sea-level pressure (what people see on weather reports). The
      // absolute risk factor is measured relative to a rolling baseline, so it
      // works at any elevation; surface pressure is kept available too.
      hPa: msl[i],
      surfaceHPa: surface[i],
      tempC: temps[i],
      rh: humidity[i],
    }))
    .filter((p) => typeof p.hPa === 'number' && !Number.isNaN(p.hPa))

  return {
    provider: 'open-meteo',
    timezone: data.timezone,
    hourly,
  }
}
