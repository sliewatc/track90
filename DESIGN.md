# Design System — 90-Day Recomp Tracker

## Aesthetic Direction
**Rack Instrument** — a tactile, high-contrast gym-floor scoreboard and telemetry console inspired by competition rack timers and physical athletic hardware rather than generic fitness SaaS cards. Designed first for arm's-length legibility on mobile iOS Safari (`390×844` portrait PWA) across 8 curated themes (default **Black · Acid Lime** for dim gym lighting, plus Charcoal, Espresso, Daylight, Ice, Terracotta, Blush, and Pastel).

## Typography
- **Display / Scoreboard Numerals:** `'Barlow Condensed'` (`600, 700, 800`), `tabular-nums` — etched, competition-plate proportions for active Set #, Weight, Reps, Protein Fuel total, and Rest HUD countdown.
- **UI Body:** `'DM Sans'` (`400–700`), `16px` root (`>= 12px` floor for interactive copy), `text-wrap: balance` on headings.
- **Data / Telemetry Mono:** `'JetBrains Mono'` (`500–700`), `tabular-nums` for set histories, timestamps, macros, and charts.

## Semantic Color Roles (WCAG AA `>= 4.5:1` across all 8 themes)
- `--primary`: Active primary CTAs, live set badge, active focus ring, and active navigation tab.
- `--info`: Coaching targets, guardrails, protein highlights, chart trend/target bands, and chime-on state.
- `--success`: Completed meals/habits, stamped sets, done exercise cards, and saved session confirmations.
- `--amber`: Active rest timers, superset alerts, Phase 2 intensifiers, and 50m+ session cap warnings.
- `--danger`: Destructive reset/delete actions and validation errors.

## Signature Instruments
- **Rack Scoreboard & Vernier Caliper (`Train`):** Monumental 3-column live equation (`SET 01/03` | `135 LB` | `× 8 REPS`) above a Set Ticket Track, drag-to-scrub Weight Caliper with press-and-hold flanking paddles, single-row target rep blocks, and compact RIR effort rail.
- **4-Bolus Protein Fuel Tank (`Today`):** Architectural 2×2 protein fuel chambers feeding a live `g / 185g` tank gauge + inline Steps/Sleep meters.
- **90-Day Phase Matrix & Velocity Gauge (`Progress`):** Interactive 90-cell calendar grid spanning Phase 1 → Wk 7 Deload → Phase 2 + live weekly `lb/wk` recomp sweet-spot gauge.
- **Floor-Readable Morphing Rest HUD (`Global`):** Expands from the slim bottom dock into a full-viewport rest readout showing exact `UP NEXT` set telemetry and big thumb paddles.

## Craft Invariants
- Real `<button>` elements for every interactive row/chip (`>= 44px` touch ergonomics).
- Inline SVG icons (`2px` stroke) — no Unicode symbol stand-ins.
- Pure GPU-composited motion (`transform`, `opacity`, `clip-path`, WAAPI FLIP accordion, `scaleX()` bars).
- Zero barbell plate visual clutter — lifters compute plates mentally.
