# HANDOFF — PressureSense (as of 2026-06-26)

Snapshot for picking up in a fresh chat. Read `CLAUDE.md` first for the durable
project guide; this file is the current state + the v1.1 briefs' status + what's
next.

## Where it stands
A **fully working, deployed webapp**. Live at https://dcomxv1.github.io/pressuresense/,
repo https://github.com/DComxV1/pressuresense (public), push worker at
https://pressuresense-push.delfin-cuevas.workers.dev. Latest commit: **`2362cd4`**.
The founder's wife is testing it on an iPhone (installed PWA + push verified
working end to end).

Built so far (pre-v1.1): the risk engine + briefing + condition coaching, the
unified **Day Log** (good/so-so/rough + pain + factors + note), correlation view,
self-calibration, optional temp/humidity factors, education library on the front
page, **light/dark colorblind-safe token design**, installable PWA with
**timezone-aware, user-scheduled push** (Cloudflare Worker), backup/restore
(365-day history, paginated), a **slide-out menu** for setup + a How-it-works FAQ,
and 10 selectable conditions.

## The three v1.1 briefs (were in "updates v1.1.zip", now extracted to scratch)

### 1. Fixes brief — ✅ DONE (`7d33ec7`, worker redeployed)
- **FIX 1** notification reliability: slot selection is now "at-or-past the chosen
  local hour and not already sent today" (was an exact hour match), tolerant of
  coarse/late cron. Verified.
- **FIX 2** geocode timeouts: `fetchWithTimeout` on all weather fetches; friendly
  geocode error / fast coordinate fallback. Verified.
- **FIX 3** elevation-proof scoring: absolute factor now measures deviation below a
  rolling **72h median baseline** (not a fixed sea-level zone), mirrored in the
  worker; widened fetch to `past_days=3`. Verified (persistent-low-stable → green;
  sharp drop → red). Note: it slightly changes scoring; calibration self-corrects
  from recent data.

### 2. Roadmap brief — PARTIAL
- **#1 correlation headline** ✅ (`3b3ace1`): "Your pattern" leads with the moat
  stat ("Every rough day you've logged has fallen on a lower-pressure day", or
  "N× as often"), gated behind enough data.
- **#3 momentum card** ✅ (`3b3ace1`): encouraging "this month" (good days, current
  run, top good-day factor), no streak-scolding.
- **#2 migraine** — largely already shipped earlier (condition + coaching +
  education article). REMAINING: per-condition rate-weighting for migraine users +
  migraine-specific log factors (aura/rescue-med/dark-room/caffeine).
- **#4 wearables (Apple Health/Watch)** — NOT started; correctly deferred to the
  iOS port (needs native HealthKit).

### 3. UI direction brief — PARTIAL
- **Move 2 (typeface)** ✅ (`2362cd4`): self-hosted **Fraunces** on the brand,
  briefing headline, and big numbers; body stays system-UI. + global
  reduced-motion. Verified live; looks great.
- **Move 1 (the "horizon" hero)** — NOT started. The signature piece: make the
  day's color the first/biggest thing (a calm band in today's band color with the
  headline over it), demote the location bar to a slim row. Big top-of-app layout
  change; held for the founder's eyes.
- **Move 3 (promote the hourly chart)** — NOT started. Make `HourlyChart.jsx`
  larger/higher; segment the line stroke by each hour's band so the shape reads as
  "heading into trouble". Keep comfort-zone shading; no axis clutter.
- **Move 4 (quiet polish)** — partial (reduced-motion done). Remaining: spacing
  rhythm between sections, fewer borders (let some content sit on the bg), keep
  band color = meaning vs accent = interactive.

## Suggested next steps (in order)
1. **UI Move 1 (hero)** then **Move 3 (chart)** — the remaining headline visual
   work. Build, screenshot, get founder feedback, iterate. (This is where we
   paused; founder was asked "build the hero + chart next?")
2. **Move 4 polish** — last and lightly.
3. **Migraine finish** (#2 remainder) — small.
4. Then the bigger arcs: **iOS port** (the real Phase 2) and **monetization**
   (see git-ignored `pressuresense-monetization.md`: freemium not ads, free
   tier = today/tomorrow + 1 tip + full Day Log; paid = forecast horizon +
   pattern + calibration + history + alerts; data-proves-value paywall after ~2
   weeks; $4.99/mo, $39.99/yr, $69.99 lifetime; doctor-report + Apple Health +
   migraine are top new bets. Open forks: subscription+lifetime? migraine-first
   expansion?).

## How to work here
- `npm run dev` to preview; verify with the preview tools; `npm run build` before
  committing. Worker changes: `cd worker && npx wrangler deploy`.
- **Don't pipe values via PowerShell** (BOM bug) — use the Bash tool.
- Keep the conventions in `CLAUDE.md` (tokens, no em-dashes, day-log model, Fraunces).
