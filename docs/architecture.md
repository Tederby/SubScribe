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
- **PWA & Android APK Optimization:**
  - `viewport-fit=cover` with safe-area insets (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`).
  - Touch latency optimization (`touch-action: manipulation`, tap-highlight removal).
  - Offline asset caching and runtime API caching via Workbox in `vite-plugin-pwa`.
