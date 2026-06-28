# HANDOFF — PressureSense (as of 2026-06-26)

Snapshot for picking up in a fresh chat. Read `CLAUDE.md` first for the durable
project guide; this file is the current state + the v1.1 briefs' status + what's
next.

## Where it stands
A **fully working, deployed webapp**. Live at https://dcomxv1.github.io/pressuresense/,
repo https://github.com/DComxV1/pressuresense (public), push worker at
https://pressuresense-push.delfin-cuevas.workers.dev. Latest work: a **safety +
senior-first pass** on top of the completed UI brief (Moves 1-4). The founder's
wife is testing it on an iPhone (installed PWA + push verified working end to end).

### Safety + senior pass (most recent)
- **Clinician-safe copy** everywhere (tips, conditions, education, and the push
  worker): no "hydrate aggressively / start your anti-inflammatory routine /
  wear compression socks / 15-20 mmHg". Shared voice in `src/lib/safety.js`.
- **"When to get help now"** card (`SafetyCard.jsx`) in Learn + a rough-day link
  from the briefing; 911 / 988.
- **Today's Plan / My Flare Plan** (`FlarePlan.jsx` + `src/lib/plan.js`,
  `settings.planActions`): pick safe actions; on yellow/red show up to 5; ticking
  one marks "helped" and writes the matching Day Log factor.
- **Pattern confidence** state (`patternConfidence()` in calibrate.js): Still
  learning / Pattern forming / Stronger pattern / No clear pressure link yet.
  Softened universal causal claims to personal framing.
- **Doctor/caregiver report** (`ReportCard.jsx` + `src/lib/report.js`): CSV +
  printable PDF, with a "not a diagnosis" disclaimer.
- **Accessibility**: all tap targets >=44px; drawer focus trap + Escape + restore
  focus to the menu button; optional Read-aloud briefing (Web Speech).
- **Privacy + honesty**: NotificationsCard discloses what's sent on enabling;
  the seeded Nags Head location is flagged as sample data (banner) until the user
  sets their own (`settings.locationIsDemo`).

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
- **Move 1 (the "horizon" hero)** ✅ (`beb4b31`): new `Hero.jsx` leads the app
  with a calm wash of today's band color, the plain-language verdict over it, the
  live pressure + trend, and the one heads-up that matters (`↓ Dropping after…`).
  `buildBriefing` now splits a short `headline` from the coaching `text`; the
  location bar is a slim collapsible row; `BriefingCard` became the "What helps
  today" card. Dropped the redundant Encouragement banner + `CurrentCard` (folded
  into the hero; `CurrentCard.jsx` deleted). Verified light/dark + all 3 bands.
- **Move 3 (promote the hourly chart)** ✅ (`HourlyChart.jsx`): taller frame
  (168 vs 110), the line stroke is now segmented by each hour's band (worse of the
  two endpoints) so the curve reads as "heading into trouble"; kept comfort-zone
  shading, peak marker, legend; no axis clutter. Header renamed "Today's pressure
  shape". Verified with a synthetic green→yellow→red dip.
- **Move 4 (quiet polish)** ✅: section rhythm (more space before each section
  header), let reflective readouts sit on the page (the "This month" momentum
  note and the Learn intro lost their cards; dropped the duplicate "Learn" label
  and a redundant card-around-a-card in the education list), softened the last
  full-strength card borders to the shared hairline `border-border/60`. Band
  color = meaning vs accent = interactive verified intact. (Reduced-motion was
  already done in Move 2.) **The whole UI direction brief is now complete.**

## Suggested next steps (in order)
1. **Migraine finish** (roadmap #2 remainder) — small: per-condition
   rate-weighting for migraine users + migraine-specific log factors
   (aura/rescue-med/dark-room/caffeine).
2. Then the bigger arcs: **iOS port** (the real Phase 2) and **monetization**
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
