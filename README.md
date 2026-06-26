# PressureSense — Barometric Pressure Pain Forecast

A personal webapp that forecasts joint-pain risk from barometric pressure trends and
delivers a daily *"how today will feel + what to do about it"* briefing.

This is the **Phase 1 webapp** from [`pressure-pain-app-spec.md`](./pressure-pain-app-spec.md) —
built to nail the core logic before an eventual iOS port.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## What it does

- **Today's briefing** — plain-language summary of the day's risk band + the top mitigation tips, with a **"Why this rating?"** explainer that shows the pressure reasoning.
- **Current pressure** — numbers + a *now* trend and a **forward-looking** outlook ("dropping after 3 PM"), with an inHg ⇄ hPa toggle.
- **3-day forecast strip** — each day rated GREEN / YELLOW / RED, with a mini sparkline and the day's pressure **swing** (the change matters more than the floor).
- **Hourly chart** for the selected day: dots colored by hourly risk (with a text legend), a shaded **comfort-zone** band, and the **peak-risk hour** marked on the curve.
- **Sensitivity slider** — calibrates when the model tips into YELLOW/RED (pressure sensitivity is individual).
- **Self-calibration** — after ~2 weeks of check-ins, suggests the sensitivity that best fits *your own* logged days (replaying each day's sensitivity-independent score against how you felt) and applies it in one tap. This is the core differentiator vs. generic barometer apps.
- **Condition selector** — pick conditions (osteoarthritis, rheumatoid/inflammatory, fibromyalgia, gout, old injury); the tip engine swaps in mechanism-specific coaching for each.
- **Daily check-in** — a quick Good / So-so / Painful, with optional detail: a 1–10 pain level plus joint-location and symptom tags (swelling, stiffness, fatigue, brain fog…).
- **Correlation view ("Your pattern")** — a 7/14/30-day chart overlaying actual pressure against your logged symptoms, with a plain-language insight (e.g. "painful days averaged 29.54 inHg vs 30.08 on good days") so you can see your own pattern confirmed.
- **History log** — records each day's prediction and check-in detail so you can validate the model over time.
- **Location** — city search or device geolocation (reverse-geocoded to a place name).

## How the risk model works

> Key principle from the brief: **rate of change matters more than the absolute reading.**
> A rapid drop provokes pain more than a steady low.

For each hour, two factors are combined:

```
risk_score = 0.35 * absolute_pressure_factor + 0.65 * rate_of_change_factor
```

- **Absolute factor** — 0 in the comfortable zone (≥ 1013 hPa / 29.92 inHg), ramping to 1 at ~996 hPa.
- **Rate factor** — 0 when pressure is rising/stable, ramping to 1 at a fall of ~8 hPa over 6 hours. A drop beginning at ~2 hPa/6h is where risk starts.
- Rate is weighted ~2× the absolute factor. Rising pressure after a low scores as relief.

Score maps to a 3-band rating; the **sensitivity slider** shifts the band cutoffs per user.

All thresholds and weights live in `DEFAULT_CONFIG` in
[`src/lib/risk.js`](./src/lib/risk.js) — tune them against real days.

## Data source

Pressure comes from [Open-Meteo](https://open-meteo.com/) (`pressure_msl`, hourly, in hPa) —
**free, no API key required**. All provider code is isolated in
[`src/lib/weather.js`](./src/lib/weather.js); swap that one file to move to OpenWeather,
Tomorrow.io, or Apple WeatherKit (recommended for the iOS port) without touching the rest.

The spec named OpenWeather One Call, but that now requires an account + card on file even
for the free tier — Open-Meteo removes that friction for the prototype.

## Project structure

```
src/
  lib/
    weather.js   # provider layer (Open-Meteo) — the only file that fetches
    risk.js      # scoring engine + DEFAULT_CONFIG (the tunable core)
    tips.js      # mitigation tip engine + briefing generator
    storage.js   # localStorage settings + history log
    format.js    # hPa/inHg conversion + display helpers
  components/     # CurrentCard, BriefingCard, ForecastStrip, HourlyChart, Controls, LocationBar, HistoryView
  App.jsx         # wiring
```

## Not medical advice

The pressure–pain link is real for many people but individual. This app gives general
wellness guidance, not a diagnosis. Persistent or recurrent swelling and pain — ankle
swelling in particular — can have causes unrelated to weather and is worth a clinician's check.

## Next (Phase 2 — iOS)

WeatherKit for forecast pressure, CoreMotion (`CMAltimeter`) for the live device barometer,
and push notifications for the "heads-up before the drop" alert and morning briefing.
The risk model in `risk.js` ports directly.
