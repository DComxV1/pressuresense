# PressureSense — Day Log Refactor Brief

## What's changing and why
The current build has a **Flare Log** (captures bad days only) plus a separate **daily check-in** (Good / So-so / Painful). These are really the same feature, and the flare-only framing misses the most useful data: **what someone did on a GOOD day.** Good days are where the repeatable wins are ("slept well, walked after dinner, wore compression — felt great"). Right now there's nowhere to record that.

**Refactor: replace the flare-only concept with a single, unified "Day Log" keyed on a day type.**

---

## 1. Reframe the feature
- Rename **"Flare Log" → "Day Log"** (or "Daily Log").
- Lead with a warm, non-clinical prompt: **"How was today?"**
- Three day-type options (reuse the existing Good/So-so/Painful language, just renamed for warmth):
  - **Good**
  - **So-so**
  - **Rough** (this replaces "flare" — friendlier, doesn't make someone self-label a "flare" on a merely-okay day)
- The day type is the core selection that everything else keys off.

---

## 2. Unified data model
Replace the separate `flares[]` array (and merge with the check-in data) with ONE array of day entries:

```js
dayLogs: [
  {
    date,                              // ISO date
    type: "good" | "soso" | "rough",   // the "How was today?" selection
    painLevel,                         // 0–10, optional (from existing check-in slider)
    factors: ["hydration", "compression", "gentle_movement", ...], // shared chip list
    note                               // free text, optional
  }
]
```

This single structure replaces both the flare log and the daily check-in — they were always the same thing. The old "Past flares" list becomes **"Past entries,"** filterable by type.

---

## 3. Shared chip list, conditional prompt
The "what's helping" chips are the **same regardless of day type** — hydration, compression socks, elevation, gentle movement, rest, heat/warmth, ice, anti-inflammatory, stretching, acted early, lighter day all apply to good and rough days alike. Don't duplicate them.

What changes by type is the **prompt wording and framing**:

| Day type | Section heading | Free-text placeholder |
|---|---|---|
| Good | "What worked / what did you do differently?" | "What went well, what was different today…" |
| So-so | "What helped take the edge off?" | "What you did, how it went…" |
| Rough | "What are you trying?" | "What set it off, what you tried, how it went…" |

Same chips under all three; only the labels above them change.

---

## 4. UI flow
1. User taps the day type under "How was today?" (Good / So-so / Rough).
2. The heading + placeholder swap to match the selected type (table above).
3. Pain slider (0–10), chip multi-select, and optional note appear the same for all types.
4. Entry saves to `dayLogs[]`. "Past entries" list shows date + type (color + label + icon, per the design tokens) + pain level.
5. Allow editing/unmarking today's entry (the existing "Unmark today" affordance generalizes to "change today's entry").

---

## 5. Why this is better
- **Good days stop being invisible** — the app can now learn what to repeat, not just what to avoid.
- **Richer self-calibration** — the engine can correlate good days with positive factors, not only bad days with low pressure. Feed `type` and `factors` into the calibration model alongside pressure.
- **One mental model** — users just "log the day" instead of deciding whether something counts as a flare.
- **Simpler code** — one array, one component with a conditional prompt, instead of two parallel logging systems.

---

## 6. Migration note
If any existing flare entries are stored, map them to `{ type: "rough", ...}` so no logged data is lost in the refactor.
