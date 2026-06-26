# PressureSense — Design Tokens & Accessibility Addendum

Color, type, and accessibility tokens tuned for the actual user base: older adults, often using the app on low-energy / high-pain days, with a meaningful share affected by red-green color blindness (~8% of men). **Guiding principle: high contrast, low saturation, never color alone.**

---

## 1. Theme strategy

Ship **both light and dark themes, default to LIGHT.** Most older adults read more comfortably with dark text on a light background; dark mode can make text edges "bloom" for cataracts/astigmatism. The dark navy theme is attractive — keep it as an option, just don't make it the only choice. Provide a simple, obvious theme toggle.

---

## 2. Color tokens

### Light theme (default)
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F7F9FB` | App background (soft off-white, not pure white — less glare) |
| `--surface` | `#FFFFFF` | Cards |
| `--border` | `#D9E1E8` | Card borders / dividers |
| `--text` | `#1A2A33` | Primary text (charcoal, not pure black — softer on the eye) |
| `--text-muted` | `#4A5A63` | Secondary text — must still clear AA (do NOT go lighter than this) |
| `--accent` | `#2D6A9F` | Trust/brand blue, buttons, links |

### Dark theme
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#101A24` | App background (deep desaturated navy) |
| `--surface` | `#18242F` | Cards |
| `--border` | `#2A3A47` | Card borders / dividers |
| `--text` | `#EAF0F4` | Primary text (off-white, not pure white) |
| `--text-muted` | `#A7B6C0` | Secondary text — bump brighter than the current build (current muted gray likely fails AA) |
| `--accent` | `#5B9BD5` | Trust/brand blue (lightened for dark bg) |

### Risk bands — blue → amber → red-orange (NOT green→red)
Shifting away from a pure green/red scale makes the bands distinguishable for red-green color-blind users. Each band gets a **color + text label + icon** — three redundant signals, never hue alone.

| Band | Light hex | Dark hex | Icon | Label |
|---|---|---|---|---|
| Good | `#2E8B7F` (teal-green) | `#3FB0A1` | ✓ check | "GOOD" / "GREEN" |
| Caution | `#E0A030` (warm amber) | `#F0B84A` | ⚠ triangle | "CAUTION" / "YELLOW" |
| High | `#D6543A` (red-orange) | `#E8694D` | ◆ alert | "HIGH" / "RED" |

> Note: amber `#E0A030` and red-orange `#D6543A` stay distinguishable for color-blind users in a way green/red does not. Keep the existing text labels everywhere — that discipline is already in the build, don't lose it.

---

## 3. Contrast requirements
- All text/background pairs must clear **WCAG AA (4.5:1)**; target **AAA (7:1)** for body text given the audience.
- The current build's muted gray labels (e.g. "low 30.09 inHg", the disclaimer) likely fail AA on dark navy — the `--text-muted` values above fix this.
- **Never communicate a risk band by color alone** — always pair with the text label and an icon/shape.
- Don't use pure black (`#000`) on pure white (`#FFF`) — the slightly softened charcoal/off-white pairing reduces glare and eye strain without losing contrast.

---

## 4. Typography
- **Base size 18px** (not 16px) given the audience — older eyes benefit, and nothing here is information-dense enough to need small text.
- Provide a **text-size control** (e.g. Default / Large / Extra-large) that scales the whole UI via `rem`.
- Line height ≥ 1.5 for body. Generous, not cramped.
- Body face: a highly legible humanist sans-serif (e.g. Inter, Source Sans, or system UI stack). Avoid thin/light weights — minimum 400, prefer 500 for body on dark backgrounds where thin strokes disappear.
- Numbers (the big pressure reading) can go large and bold — that's the one place to be expressive, and it aids scannability.

---

## 5. Touch targets & spacing
- Minimum tap target **44×44px** (Apple HIG); prefer 48px for this audience.
- Generous padding inside cards and between them — fatigued users and stiff hands need room to not mis-tap.
- The sensitivity slider needs a large thumb and a visible numeric/label state for screen readers (not just "Average").

---

## 6. "Low-energy mode" (optional but on-brand)
A toggle that strips the UI to just **today's band + one mitigation tip + the pressure number** — for flare days when reading the full dashboard is too much. Large type, maximum contrast, minimal interaction.

---

## 7. Quick application checklist
1. Add light theme + toggle, default to light.
2. Swap risk palette to teal / amber / red-orange and add an icon per band.
3. Fix muted-text contrast to the values above (re-check AA).
4. Bump base font to 18px; add a text-size control.
5. Audit every band indicator for color + label + icon redundancy.
6. Enlarge tap targets to ≥44px; add slider a11y state.
7. (Optional) Low-energy mode.
