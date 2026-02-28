# Arena Mala (ANY.RUN-style MVP)

Arena Mala is a **fully runnable local MVP** that mirrors the core flow of an interactive malware analysis platform:

- submit file / URL / hash
- watch live analysis progress
- inspect timeline, network, and extracted IOCs
- browse public feed, IOC search, and threat intel pages

## Important scope note

This project is a **safe simulator**, not a real malware detonation infrastructure.
No real malware is executed; the backend generates realistic mock telemetry.

## Tech stack

- React + React Router (frontend)
- Vite (frontend dev server + API/WebSocket proxy)
- Express + WebSocket (backend simulator)
- In-memory datastore (no external DB required)

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start frontend + backend together:

```bash
npm run dev
```

3. Open:

- `http://localhost:5173`

The API runs on `http://localhost:4000` and is proxied automatically by Vite.

## How to use

1. Open the dashboard.
2. Submit a file, URL, or hash.
3. You will be redirected to `/analysis/:id`.
4. Watch the progress bar and live status updates.
5. Inspect:
   - **Timeline**
   - **Network**
   - **IOCs**
6. Visit:
   - **Public Feed** for completed public analyses
   - **IOC Search** to query extracted indicators
   - **Threat Intel** for family-level rollups

## API endpoints (simulated)

- `POST /api/analysis/submit`
- `GET /api/analysis/:id`
- `GET /api/analysis/:id/status`
- `GET /api/analysis/:id/full`
- `GET /api/samples/recent`
- `GET /api/samples/public`
- `GET /api/samples/search`
- `GET /api/ioc/search`
- `GET /api/ioc/threat-families`
- `GET /api/stats`
- `WS /ws` (subscribe with `{ "type": "subscribe", "analysisId": "<id>" }`)

## Production caveats

To become a true ANY.RUN-grade system, you still need:

- isolated VM orchestration and snapshot lifecycle
- hypervisor-level network controls and packet capture
- real dynamic instrumentation (process, memory, syscall, kernel hooks)
- secure sample storage and report persistence
- multi-tenant auth, billing, RBAC, and abuse prevention
