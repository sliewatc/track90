# Design System — 90-Day Recomp Tracker

## Aesthetic Direction
High-contrast **Gym-Floor Slate** (default dark for dim gym lighting, with one-tap **Daylight Paper** light theme). Restrained, utilitarian precision: crisp 1px hairlines, elevated neutral surfaces, and semantic accents reserved strictly for active state and progression cues.

## Tokens
- **Typography:** `'Inter'`, system sans fallback, `16px` root (`>= 12px` strict floor everywhere), `tabular-nums` for all weights, reps, timers, and calories.
- **Spacing Scale (4px/8px grid):** `4px`, `8px`, `12px`, `16px`, `24px`, `32px`.
- **Radius Scale:** `8px` (inputs, chips, bars), `12px` (buttons, tiles), `16px` (cards, modals).
- **Color Roles:**
  - `--primary` (`#10b981` dark / `#059669` light): completion, primary CTAs, double-progression cues.
  - `--amber` (`#f59e0b` dark / `#d97706` light): active rest timer, Phase 2 intensifiers, 50m+ session cap alert.
  - `--sky` (`#38bdf8` dark / `#0284c7` light): Week 7 Deload, Left-Arm-First & shoulder prehab reminders.
  - `--danger` (`#ef4444` dark / `#dc2626` light): destructive actions / validation errors.

## Craft Invariants
- Real `<button>` elements for every interactive row/chip (full keyboard & touch accessibility).
- Inline SVG icons (`2px` stroke) — no Unicode symbol stand-ins.
- GPU-only progress bar motion (`transform: scaleX()`).
- Zero glassmorphism blur, zero thick side-stripe borders, zero over-rounded containers.
