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

// Look up candidate locations by name. Returns [{ name, country, admin1, latitude, longitude }]
export async function geocode(query) {
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)
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

// Reverse-friendly label for a coordinate (used after browser geolocation).
export async function describeCoords(lat, lon) {
  // Open-Meteo has no reverse geocode; just present coordinates.
  return `${lat.toFixed(2)}, ${lon.toFixed(2)}`
}

// Fetch hourly barometric pressure spanning ~1 day past to 3 days ahead.
// Past hours let us compute the current trend; future hours drive the forecast.
export async function fetchPressureSeries(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: 'pressure_msl,surface_pressure,temperature_2m',
    forecast_days: '4',
    past_days: '1',
    timezone: 'auto',
  })
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`)
  if (!res.ok) throw new Error(`Forecast fetch failed (${res.status})`)
  const data = await res.json()

  const times = data.hourly?.time || []
  const msl = data.hourly?.pressure_msl || []
  const temps = data.hourly?.temperature_2m || []

  const hourly = times
    .map((t, i) => ({
      // timezone=auto returns local wall-clock strings (no Z); parse as local.
      time: new Date(t),
      hPa: msl[i],
      tempC: temps[i],
    }))
    .filter((p) => typeof p.hPa === 'number' && !Number.isNaN(p.hPa))

  return {
    provider: 'open-meteo',
    timezone: data.timezone,
    hourly,
  }
}
