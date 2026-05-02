# Arena Mala — Malware Analysis Sandbox

## Overview

Arena Mala is a full-stack malware analysis sandbox web application. It allows users to submit files or URLs for analysis, detonating them in an isolated environment and reporting behavioral telemetry, network activity, IOCs (Indicators of Compromise), and threat intelligence.

## Design System — Warm Slate / Amber

The UI uses a warm dark theme graduated from a canvas mockup:
- **Background**: `#1c1917` warm stone-dark (not blue-grey)
- **Accent**: amber `#d97706` / `#b45309` — used for active nav, buttons, borders
- **Typography**: Playfair Display (serif) for all page headings; Inter for body; JetBrains Mono for code
- **Borders**: warm amber-tinted `rgba(217,119,6,0.12)`
- **Radius**: 4px (sharp, professional)
- **Sidebar**: labeled "OPERATIONS" section, amber left-bar active indicator
- **Header nav**: Analysis / Hunting / Intelligence (center-aligned)

## Architecture

- **Frontend**: React 18 + Vite, Tailwind CSS, React Router v6
- **Backend**: Express.js API server with WebSocket support
- **Database**: Supabase (PostgreSQL) for storing analyses, IOCs, network events, timeline events, and threat families
- **Sandbox**: CAPE Sandbox integration for dynamic malware detonation
- **Static Analysis**: Custom PE/file analysis via `lib/static-analysis.js`

## Project Structure

```
/
├── index.js              # React entry point
├── index.html            # HTML template
├── App.js                # React app shell + routing
├── server.js             # Express API + WebSocket server
├── vite.config.js        # Vite config (port 5000, proxy to :8000)
├── package.json
├── index.css             # Global styles (Tailwind + custom)
├── tailwind.config.js
├── postcss.config.js
│
├── lib/
│   ├── supabase.js       # Supabase client + DB helpers
│   ├── sandbox.js        # CAPE sandbox integration
│   ├── static-analysis.js# PE/file static analysis
│   ├── scoring.js        # Threat scoring / verdict logic
│   └── ui/               # Shared UI utilities
│
├── components/           # Shared React components
│
├── HomePage.js           # Dashboard / submit form page
├── AnalysisPage.js       # Live analysis results page
├── PublicFeedPage.js     # Public feed of analyses
├── IOCSearchPage.js      # IOC search page
├── ThreatIntelPage.js    # Threat intelligence page
├── Header.js             # App header
├── Sidebar.js            # Navigation sidebar
├── SubmitForm.js         # File/URL/Hash submission form
├── UI.js                 # Shared UI components
├── helpers.js            # Utility functions
├── clientApi.js          # Frontend API client
├── api.js                # API helpers
│
└── supabase/
    └── schema.sql        # Database schema
```

## Ports

- **Frontend (Vite dev)**: port 5000
- **Backend (Express API)**: port 8000

## Environment Variables

Configure in `.env` (see `.env.example`):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
CAPE_API_URL=http://your-cape-host:8000
CAPE_API_KEY=
SAMPLE_STORAGE_DIR=./samples
PORT=8000
```

## Workflows

- **Start application**: `npm run dev:web` — Starts Vite frontend on port 5000
- **Backend API**: `node server.js` — Starts Express API on port 8000

## Setup Notes

- Supabase must be configured for any data operations. Apply `supabase/schema.sql` to your Supabase project.
- CAPE sandbox integration is optional; without it, the app performs static-only analysis.
- In production, `npm run build` outputs to `dist/` which is served by the Express server on port 8000.

## Deployment

- **Target**: autoscale
- **Build**: `npm run build`
- **Run**: `node server.js` (serves both API and built frontend from `dist/`)
