# SubScribe Architecture Overview

## Monorepo Layout
SubScribe follows a two-tier monorepo architecture:
- `/backend`: Express.js REST API interacting with Supabase PostgreSQL via `@supabase/supabase-js`.
- `/frontend`: Mobile-first React Single Page Application (SPA) powered by Vite, Tailwind CSS, and `vite-plugin-pwa`.

## High-Level Diagram
```text
┌─────────────────────────────────┐
│     Client (React PWA)          │
│   Mobile & Desktop Viewport     │
│ Utilitarian Industrial UI (TE)  │
│  PWA / Android TWA / APK Ready  │
└───────────────┬─────────────────┘
                │ HTTP / JSON
                ▼
┌─────────────────────────────────┐
│     Server (Express.js)         │
│   MVC Architecture:             │
│   Routes -> Controllers -> Model│
└───────────────┬─────────────────┘
                │ Supabase JS SDK
                ▼
┌─────────────────────────────────┐
│   Database (Supabase Postgres)  │
│  categories, services, groups   │
└─────────────────────────────────┘
```

## Environments & Configuration
- Backend reads: `PORT`, `SUPABASE_URL`, `SUPABASE_KEY`
- Frontend reads: `VITE_API_URL` (defaulting to `http://localhost:3000`)



## UI & PWA Architecture
- **Aesthetic:** Utilitarian / Industrial (Technical Apparatus), inspired by hardware synthesizers (Teenage Engineering).
- **Color Tokens:** Matte carbon base (`#141517`), frame (`#0E0F11`), Safety Orange (`#FF4F00`), Acid Yellow (`#DFFF00`), LED Green (`#00E676`).
- **Typography:** ≥ 50% Monospace (`font-mono`, `tabular-nums`), uppercase wide tracking.
- **Dual-Form Adaptive Architecture:**
  - **Mobile (Handheld Field Terminal):** Compact edge-to-edge container, touch-first active responses (`active:scale-[0.98]`, suppression of sticky touch hovers via `@media (hover: none)`), and persistent bottom apparatus navigation rack (`BottomNav`).
  - **Desktop (Master Apparatus Console):** Widescreen workstation (`max-w-7xl` / `1400px`), dedicated hardware sidebar (`DesktopSidebar`) with station telemetry and hotkey routing (`1`, `2`, `3`), multi-column responsive command grids (`grid-cols-12` split consoles for catalog and detail inspectors), and mouse hover scanline physics.
- **PWA & Android APK Optimization:**
  - `viewport-fit=cover` with safe-area insets (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`).
  - Touch latency optimization (`touch-action: manipulation`, tap-highlight removal).
  - Offline asset caching and runtime API caching via Workbox in `vite-plugin-pwa`.
  - **Android TWA Packaging (Trusted Web Activity):** Bundled via `@bubblewrap/cli` with `twa-manifest.json` pointing to `https://subscribe-frontend-five.vercel.app`.
  - **Digital Asset Links:** `.well-known/assetlinks.json` configured in `frontend/public/` for automatic Chrome address bar suppression.
  - **Automated CI/CD:** GitHub Actions workflow (`.github/workflows/build-apk.yml`) building signed release `.apk` artifacts with Keystore fallback and telemetry summaries.
- **Data Resilience Layer:**
  - `dataService.js` coordinates client-side caching with graceful failover to Indonesian seed presets when backend connectivity is offline.
  - Live vs Cache telemetry status displayed in real time on the apparatus header.
