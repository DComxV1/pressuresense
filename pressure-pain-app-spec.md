# Build Brief: Barometric Pressure Pain-Forecasting App

## One-line summary
A personal app that forecasts joint-pain risk from barometric pressure trends and delivers a daily "how today will feel + what to do about it" briefing, with push alerts when pressure starts dropping.

---

## Goal & scope

Build a **webapp first** to nail the core logic (pressure thresholds, risk scoring, mitigation tips), then port to **iOS** where push notifications and the device barometer make it shine.

Primary user: someone with pressure-sensitive joint pain and ankle swelling. The differentiator vs. existing barometer apps is **actionable mitigation coaching**, not just data display.

---

## Phase 1 — Webapp (build this first)

### Tech stack
- Frontend: React + Tailwind (single-page is fine to start)
- No backend required for v1 — call the weather API directly from the client, store user settings in app state
- If persistence is needed later: lightweight backend (or local-only for the webapp prototype)

### Data source (the make-or-break dependency)
- **Primary: a forecast API** that returns hourly barometric pressure. This is what enables the "heads up for your day" feature.
  - Options: OpenWeather (One Call API, includes `pressure` in hPa), Tomorrow.io, or Apple WeatherKit (best for the iOS port).
  - For the webapp prototype, OpenWeather One Call is the fastest to wire up.
- Pull **hourly pressure for the next 24–72 hours** plus current conditions.
- Pressure comes in hPa from most APIs. Convert to inHg for display if preferred: `inHg = hPa * 0.02953`.

### Core risk-scoring logic

The model should weight **rate of change more heavily than the absolute value** — the drop provokes pain more than the low reading itself.

Reference thresholds (make these user-adjustable later):
- **Absolute pressure**
  - Below ~1009 hPa (29.80 inHg): elevated risk
  - 1012–1023 hPa (29.90–30.20 inHg): comfortable/stable zone
- **Rate of change** (this is the important one)
  - Falling > ~2–3 hPa over 6 hours: meaningful drop → elevated risk
  - Rapid fall over 6–12 hr is worse than a sustained low
  - Rising pressure after a low → relief, score downward

Suggested scoring approach:
```
risk_score = w1 * absolute_pressure_factor + w2 * rate_of_change_factor
```
- Start with rate-of-change weighted ~2x the absolute factor (e.g., w1=0.35, w2=0.65). Tune against real days.
- Map score → 3-band rating:
  - GREEN (low): stable pressure in comfort zone
  - YELLOW (moderate): some drop or borderline low
  - RED (high): rapid drop and/or well below threshold

### Features (v1)
1. **Current pressure** display with trend arrow (rising / falling / stable) and inHg/hPa toggle
2. **24–72 hr forecast** with per-day (or per-block) pain-risk rating (green/yellow/red)
3. **Morning briefing** — plain-language summary: "Today looks like a YELLOW day — pressure is dropping this afternoon. Here's what to do."
4. **Mitigation tip engine** — tips scale with severity (see below)
5. **Personalized threshold** — a sensitivity slider so the user can calibrate when alerts trigger
6. **History view** (nice-to-have for v1) — log of past days + risk so the user can sanity-check the model against how they actually felt

### Mitigation tip engine

Tips keyed to risk band. Keep them short and actionable. Examples to seed it:

- **GREEN**: "Good day to be active. Normal routine."
- **YELLOW**: "Pressure dropping this afternoon. Stay ahead of it: hydrate, keep moving in short bursts, wear compression socks, do gentle stretching. Don't sit for long stretches."
- **RED**: "Rapid pressure drop incoming. Be proactive *before* the flare: anti-inflammatory measures early, prioritize gentle movement over intense activity, elevate feet when resting, warmth on stiff joints, extra hydration. Plan a lighter day."

(These mirror the circulation/swelling mechanisms — calf-muscle pump for venous return, staying ahead of inflammation rather than reacting.)

---

## Phase 2 — iOS port

Once the webapp logic is validated:

- **WeatherKit** for forecast pressure (free up to a generous limit with an Apple Developer account; solid pressure data)
- **CoreMotion (CMAltimeter)** to read the **device barometer** for real-time *local* pressure — supplements the forecast with what's actually happening right now
- **Push notifications**: trigger when forecasted pressure starts crossing the user's threshold / begins a rapid fall — the core "heads up" feature
- **Morning briefing as a notification** — daily push with the day's color rating + top mitigation tip

Architecture note: forecast API is the backbone; the phone sensor is a real-time supplement, not the primary source (the sensor can't forecast).

---

## Monetization (for later, not v1)
- Free tier: basic current pressure + alerts
- Premium (~$3–5/mo): multi-day forecasting, mitigation coaching, personalization, history tracking
- Possible expansion: condition-specific modules (arthritis, fibromyalgia, migraines — all pressure-sensitive)

Market context: arthritis alone affects ~58M US adults; a large share are pressure-sensitive. Existing apps (e.g. Weather Pain Pro) are bare-bones on the coaching side — that's the open lane.

---

## Build sequence (suggested)
1. Wire up the forecast API, get hourly pressure flowing in
2. Implement risk-scoring (start with the weights above, expose them so they're easy to tune)
3. Build the 3-band UI: current + trend, forecast strip, morning briefing card
4. Add the mitigation tip engine keyed to band
5. Add the sensitivity slider (personal threshold)
6. Validate the risk model against several real days before polishing
7. Port to iOS for sensor + push notifications

---

## Key design principles
- **Rate of change > absolute value** in the scoring — don't bury this.
- The product is the **coaching**, not the chart. Lead with "what to do today."
- Keep thresholds **user-adjustable** — sensitivity is individual.
- Plain language in the briefing. No jargon, no raw numbers unless the user wants them.

## Medical disclaimer (include in the app)
The pressure–pain correlation is real for many people but individual and not a diagnosis. The app gives general wellness guidance, not medical advice. Users with persistent swelling or pain should consult a clinician — recurrent ankle swelling in particular can have causes unrelated to weather and is worth a real medical check.
