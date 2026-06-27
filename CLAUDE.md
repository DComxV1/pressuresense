# CLAUDE.md — PressureSense

Project guide for Claude. Keep this concise; it loads every session.

## What it is
A barometric-pressure pain-forecasting webapp (Phase 1) heading toward a native iOS app. It forecasts joint-pain risk from pressure trends (GREEN/YELLOW/RED bands), gives a daily plain-language briefing + condition-aware mitigation coaching, and lets users log how each day felt to learn their personal pattern. Primary user: pressure-sensitive joint pain (founder's wife, ankle swelling). The differentiator is the **coaching + personal calibration**, not the chart.

- **Repo:** https://github.com/DComxV1/pressuresense (public)
- **Live:** https://dcomxv1.github.io/pressuresense/
- **Push worker:** https://pressuresense-push.delfin-cuevas.workers.dev

## Stack & commands
- React 18 + Vite 5 + Tailwind 3. No app backend; data is **device-local** (localStorage). Cloudflare Worker only for push.
- `npm install`; `npm run dev` (preview at :5173); `npm run build`.
- Worker: `cd worker && npx wrangler deploy` (auth: gh-style `wrangler login`, account delfin.cuevas@gmail.com).
- Frontend auto-deploys to GitHub Pages via `.github/workflows/deploy.yml` on push to `master`.

## Architecture / key files
- `src/lib/risk.js` — scoring engine + `DEFAULT_CONFIG`. Rate-of-change weighted ~2× absolute. **Absolute factor is now deviation from a rolling 72h median baseline** (elevation/regime-proof), not a fixed zone.
- `src/lib/weather.js` — the ONLY weather fetch layer (Open-Meteo, keyless). Has `fetchWithTimeout`. Returns `{ hourly: [{time,hPa,surfaceHPa,tempC,rh}] }` (hPa = MSL).
- `src/lib/tips.js` — `BAND_META`, briefing (`buildBriefing`), condition-aware tips (`tipsFor`), `buildExplanation`, `goodStreak`, `buildEncouragement`.
- `src/lib/conditions.js` — 10 conditions (OA, RA/inflammatory, fibro, gout, injury, migraine, sinus, back, lupus, neuropathy), each with band-keyed tips. Multi-select.
- `src/lib/daylog.js` — `DAY_TYPES`, `TYPE_BAND` (good→green/soso→yellow/rough→red), `FACTORS`, `PROMPTS`.
- `src/lib/calibrate.js` — self-calibration (suggests sensitivity from logged days vs predictions).
- `src/lib/storage.js` — localStorage, **entry migration**, day-log fns, backup/restore. History cap = 365.
- `src/lib/education.js` — Learn articles. `src/lib/pwa.js` + `pushConfig.js` — PWA + push.
- `src/components/*` — UI. `src/App.jsx` — root: layout, state, `SettingsDrawer` (slide-out menu).
- `worker/src/index.js` — push backend: `/subscribe /unsubscribe /test /selftest /health` + hourly `scheduled`. Web push via Web Crypto (RFC 8291 aes128gcm + VAPID). Mirrors a compact copy of the risk model.
- `public/` — `manifest.webmanifest`, `sw.js`, icons. `src/fonts/` — self-hosted Fraunces.

## Data model (important)
A history/day entry: `{ dateKey, predictedBand, score, minPressure, type: 'good'|'soso'|'rough', pain, factors: [], note }`. The old `felt`/`flare`/`joints`/`symptoms` shape is migrated on load (don't reintroduce it). Logging is intentionally free/ungated.

## Conventions
- **Design tokens:** CSS variables in `src/index.css`; semantic Tailwind classes only (`bg-surface`, `text-text`, `text-muted`, `border-border`, `bg-good/10`, `text-good-ink`, etc.) — never raw `slate/sky/emerald`. Light theme default; dark via `[data-theme="dark"]`.
- **Colorblind-safe bands:** teal / amber / red-orange, always color + text label + icon (✓/⚠/◆).
- **NO em-dashes in user-facing copy** (founder preference) — use periods/commas. Warm, plain, senior-friendly language.
- **Fraunces** display font for the brand, briefing headline, and big numbers only; body stays system-UI. 18px base, 44px tap targets, WCAG AA.
- Verify UI changes with the preview tools; `npm run build` before committing; end commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Gotchas (learned the hard way)
- **PowerShell pipes prepend a BOM** — broke a git commit and the VAPID secret. When piping values to a CLI (secrets, commit messages), use the **Bash tool** (heredoc) or `node -e "process.stdout.write(...)"`, never a PowerShell pipe.
- **Vite base** is `/pressuresense/` in prod, `/` in dev (conditional in `vite.config.js`). The SW derives base from its own location.
- **GitHub Pages** needs the repo public; deploy workflow uses `cancel-in-progress: true` (back-to-back pushes collided before).
- **Worker secret** `VAPID_PRIVATE_JWK` is set via wrangler (not in git). The matching public key is in `wrangler.toml` + `src/lib/pushConfig.js`.
- FIX 3 changed the absolute factor; pre-change stored `score`s used the old formula. Calibration recomputes from recent data, so it self-corrects.

## Memory
Durable project facts live in the auto-loaded memory dir (`MEMORY.md` index). `pressuresense-monetization.md` is **git-ignored** (private pricing strategy). See `HANDOFF.md` for current session state + roadmap status.
