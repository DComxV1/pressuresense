# PressureSense — Feature & UX Addendum (v2)

Builds on the original spec. Two sections: **(A) Condition-aware features & content** and **(B) UI/UX improvements** based on the current build.

---

## A. Condition-aware features & content

### A1. Condition selector (onboarding)
Let the user pick one or more conditions; filter the tip library accordingly. Each condition responds to pressure through a different mechanism, so coaching should differ.

- **Osteoarthritis** — stiffness on pressure drops. Tips: gentle range-of-motion before activity, warmth on the joint, avoid high-impact on red days, keep moving in short bursts (stillness stiffens OA fast).
- **Rheumatoid / inflammatory arthritis** — inflammation-driven. Tips: stay ahead with an anti-inflammatory routine, don't overexert on flare days, balance rest with gentle motion, hydrate.
- **Fibromyalgia** — pain amplification + fatigue + "fibro fog." Drops hit energy as hard as pain. Tips: pacing (don't burn all your energy on a green day and crash), gentle stretching, protect sleep, stress regulation.
- **Gout** — pressure/temperature shifts can precede flares. Tips: hydration, watch dietary triggers, elevate.
- **Old injury / post-surgical** — localized sensitivity. Tips: targeted warmth, support/bracing on bad days.

### A2. Daily symptom check-in (expand current history feature)
The "Good / So-so / Painful" toggle already exists — extend it:
- Optional 1–10 pain slider
- Optional joint location tags (knees, ankles, hands, back…)
- Symptom tags beyond pain: **swelling, stiffness, fatigue, brain fog, sleep quality**
- Keep it two-taps-minimum; never force the extra detail.

### A3. Correlation view (high value)
Overlay logged symptoms against actual pressure over time. Seeing their *own* pattern confirmed is the feature that builds trust and retention. A 7–30 day chart: pressure line + felt-rating dots underneath.

### A4. Self-calibration (premium hook)
After ~2–4 weeks of check-ins, auto-tune the personal threshold from the user's real data instead of the generic default. This is the core differentiator vs. bare-bones barometer apps.

### A5. Flare log
Mark a bad day, optionally note what helped. Builds a personal "what works for me" library over time.

### A6. Proactive timing features
- **"Window of opportunity" alerts** — "Pressure stable and good for the next 6 hours — good time for that walk or PT session." Helping people *use* good days matters as much as warning about bad ones.
- **Pre-flare lead time** — notify the evening before a red day so they can prep (meds on hand, lighter schedule, prep meals).
- **Medication timing nudges** — for scheduled anti-inflammatories, an optional reminder to take them *before* a predicted drop. Frame clearly as "not medical advice — follow your doctor's plan."

### A7. Broader environmental load (beyond pressure)
Pull from the same weather API and combine into one score (premium feature, more accurate than pressure alone):
- **Temperature & cold snaps** — cold stiffens joints; many are as cold-sensitive as pressure-sensitive.
- **Humidity** — high humidity worsens some people's pain.
- **Rapid temperature swings** — like pressure, the *change* matters more than the level.

### A8. Education library (short, condition-keyed)
- Calf-pump / venous-return explainer for swelling (compression, elevation, movement after sitting)
- Gentle mobility routines (chair stretches, ankle pumps, range-of-motion) — short, doable during a flare
- Anti-inflammatory nutrition basics (omega-3s, hydration)
- Sleep hygiene (pain ↔ poor sleep feed each other)
- Heat vs. ice guidance (heat for stiffness, ice for acute inflammation — commonly confused)

### A9. Tone discipline (design rule, not a feature)
A pain-forecasting app can accidentally make people dread days. Counter deliberately:
- Always pair a warning with agency — "here's what helps," never just "tomorrow will hurt."
- Celebrate green days and good streaks.
- "Plan a gentler day" beats "high pain warning."

---

## B. UI/UX improvements (based on current build)

### B1. Hourly pressure chart (weakest panel — fix first)
- **Color the dots by risk band**, not all-green. The line clearly dips mid-day; the dots should show it so the shape *means* something at a glance.
- **Mark the "peak risk" point** on the curve itself (ring, label, or vertical line) instead of only noting it in the corner.
- **Add a shaded "comfort zone" band** behind the line as a Y reference, so a curve heading out of the zone reads instantly without parsing numbers.

### B2. Merge the duplicate messaging
"Today's Briefing" and "Current Pressure" currently say the same thing twice (green, stable, good to be active). Let the briefing carry the narrative; make the current card purely numbers + trend. Drop the redundant "Good day. Pressure is stable and comfortable." line.

### B3. Make the trend indicator forward-looking
"→ Steady · -0.006 inHg over 3h" describes the past. Add what's coming: e.g. "Steady now · dropping after 3 PM." People want the heads-up, not the history.

### B4. Reverse-geocode the location
Show a place name ("Nags Head, NC"), not raw coordinates (36.10, -75.71). Coordinates feel unfinished for this audience.

### B5. Forecast cards: show trend, not just "low"
The day's *swing/trend* matters more than its floor for a pain app. Add the day's range or a tiny sparkline per card — a day that drops 0.3 inHg matters more than its low value.

### B6. Accessibility (this is the core user base)
- **Never rely on color alone** — keep the text band labels everywhere, especially the chart dots.
- **Contrast check** — muted gray body text (the "low 30.09 inHg" labels, disclaimer) may fail WCAG AA on the dark navy. Bump those.
- **Slider a11y** — expose a numeric/label state for screen readers, not just "Average."
- Large tap targets, big readable type, dark mode (already good), and a possible **"low-energy mode"** that strips the UI to just today's rating + one tip for flare days.

### B7. History → 7-day correlation strip
The single-day "Good / So-so / Painful" toggle is great. Extend it to a 7-day strip of colored dots with the felt-rating beneath, so the predicted-vs-felt correlation is visible *in the app* — which is the whole point of the product.

### B8. "Why this rating?" affordance
A tappable "why green?" on the briefing that explains the pressure reasoning. Helps users learn their own pattern and builds trust in the forecast.

---

## Suggested priority order
1. **B1 + B2 + B6** — chart legibility, de-duplication, accessibility (cheap, high-impact polish on what exists)
2. **A1 condition selector + A2 expanded check-in** — makes coaching feel tailored
3. **A3 correlation view + B7 7-day strip** — the retention/trust engine
4. **A4 self-calibration** — the premium differentiator
5. **A6 proactive alerts** — the "heads up" promise, strongest after the iOS port
