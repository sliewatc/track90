# 90-Day Body Recomposition Tracker (PWA)

A mobile-first, offline-capable static Progressive Web App (PWA) built from your 90-day body recomposition plan (`Nov 24, 2026 – Feb 22, 2027`).

## Features
- **Today Dashboard:** Lifting vs. Rest day calorie-cycling targets (including Tighter Hunger Swing and Week 7 Deload maintenance), 4-meal protein bolus check-in (180–185g/day), daily habit checklist (steps, sleep, water, fiber, creatine, caffeine cutoff), and Holiday Calorie Banking / 3-Plate Playbook.
- **Gym-Floor Workout Logger:**
  - All 5 workouts (`Upper A`, `Lower A`, `Upper B`, `Lower B`, `Optional 5th Aesthetic Day`).
  - **2-Min Shoulder Prehab** checklist on Upper days & **Left Arm First** unilateral badges.
  - **5-Min Compound Ramp-Up** auto-calculator (`Bar×10 → 50%×5 → 75%×3 → 90%×1`).
  - **Native Superset Grouping** (`A1/A2`, `B1/B2`) and **1-Tap Exercise Swap Picker** with busy-gym alternatives.
  - **Built-in Rest Timer** auto-configured per exercise with `-15s / +15s`, Web Audio chime, and haptic vibration.
  - **Double Progression Detector** flagging when all sets hit the top of the rep range (`+5 lbs` compounds / `+2.5 lbs` isolations).
  - **Phase Switcher** (`Phase 1` / `Week 7 Deload` / `Phase 2` + `Weeks 10–13 +1 Bonus Set`).
- **Progress & Analytics:** Morning scale weight log with automatic **7-day rolling average** SVG chart, biweekly waist & photo tracking, Biweekly Data-Driven Adjustment Engine (including Weeks 1–3 Creatine Caveat), and Big 3 strength progress bars.
- **Zero-Backend Persistence:** Stores everything in `localStorage` with 1-tap JSON backup export/import.

## Deploy to Cloudflare Pages (Recommended)
This is a 100% static site with **zero build step** (`Build command`: none, `Build output directory`: `/`).

- **Option A — Direct Upload (Fastest):**
  1. In the Cloudflare Dashboard, go to **Workers & Pages → Create → Pages → Upload assets**.
  2. Drag and drop the unzipped bundle folder (or `.zip` file) and deploy.
- **Option B — Wrangler CLI:**
  ```bash
  npx wrangler pages deploy . --project-name=recomp-tracker
  ```

## Deploy to GitHub Pages
1. Create a new GitHub repository (e.g., `recomp-tracker`).
2. Push the contents of this directory to the `main` branch:
   ```bash
   git init -b main
   git add .
   git commit -m "Initial 90-day recomp tracker PWA"
   git remote add origin https://github.com/<your-username>/recomp-tracker.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages → Source: Deploy from a branch (`main` / `/ (root)`)**.
4. Open `https://<your-username>.github.io/recomp-tracker/` on your phone and tap **Add to Home Screen** (iOS Safari Share menu or Android Chrome Install).
