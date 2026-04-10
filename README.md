# Arena Mala

Real malware detonation infrastructure with a modern glassmorphic React UI. Submit files, URLs, or hashes — Arena Mala runs local static analysis, detonates samples inside a CAPE Sandbox VM, and stores every result in Supabase.

> **Warning:** This tool is designed for security researchers operating on isolated lab networks. Never run it on production infrastructure or detonate unknown samples outside a controlled environment.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  React Frontend (Vite)                                   │
│  Glassmorphic UI · WebSocket live updates                │
└────────────┬─────────────────────────────────────────────┘
             │ HTTP + WS
┌────────────▼─────────────────────────────────────────────┐
│  Express API Server (server.js)                          │
│  Orchestrates the full analysis pipeline                 │
├──────────┬──────────────┬──────────────┬─────────────────┤
│ Static   │ CAPE Sandbox │  Supabase    │  WebSocket      │
│ Analysis │ REST Client  │  PostgreSQL  │  real-time      │
│ (local)  │ (external)   │  + Storage   │  updates        │
└──────────┴──────────────┴──────────────┴─────────────────┘
```

### Analysis Pipeline

1. **Upload** — file saved to disk + Supabase Storage
2. **Static analysis** — hashes (MD5/SHA1/SHA256), file type (magic bytes), entropy, string extraction, PE header parsing, suspicious indicator detection
3. **Sandbox detonation** — sample submitted to CAPE Sandbox VM for dynamic behavioral analysis
4. **Polling** — server polls CAPE, relays progress to frontend via WebSocket
5. **Report normalization** — CAPE report parsed into timeline events, network connections, and IOCs
6. **Scoring** — static + dynamic signals combined into a verdict (clean / suspicious / malicious) and a 0–100 threat score
7. **Persistence** — everything stored in Supabase (analyses, timeline, network, IOCs, threat families)

If CAPE is unreachable, the system degrades gracefully to **static-only** mode — you still get hashes, entropy, strings, PE info, and a static-based verdict.

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js     | 18+     | ES modules used throughout |
| CAPE Sandbox | 2.x    | External service — see setup below |
| Supabase project | —  | Free tier works for development |

---

## Setup

### 1. Clone & install

```bash
git clone <your-repo-url> arena-mala
cd arena-mala
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open the SQL editor and paste the contents of `supabase/schema.sql` — run it
3. Create a Storage bucket named `samples` (set to private)
4. Copy your project URL and service-role key

### 3. CAPE Sandbox

CAPE is a self-hosted malware analysis sandbox. Arena Mala integrates with it over its REST API — it is **not** bundled with this project.

**Minimum setup:**

- A Linux host with KVM (Ubuntu 22.04 recommended)
- One Windows 10 guest VM with the CAPE agent installed
- CAPE REST API enabled on port 8000

Full documentation: [capev2.readthedocs.io](https://capev2.readthedocs.io)

**Quick install (on your analysis host):**

```bash
wget https://raw.githubusercontent.com/kevoreilly/CAPEv2/master/installer/cape2.sh
chmod +x cape2.sh
sudo ./cape2.sh base
sudo ./cape2.sh cape
sudo ./cape2.sh kvm
```

Then configure your Windows VM guest and start the services.

### 4. Environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...your-service-role-key

# CAPE Sandbox
CAPE_API_URL=http://your-cape-host:8000
CAPE_API_KEY=              # optional, depends on your CAPE config

# Local
SAMPLE_STORAGE_DIR=./samples
PORT=4000
```

### 5. Run

```bash
# Start the API server
node server.js

# In another terminal, start the frontend
npm run dev
```

The frontend runs on `http://localhost:5173` (Vite default) and proxies API calls to port 4000.

### Production (single Node process)

After `npm run build`, the same server serves the Vite output from `dist/` plus `/api` and `/ws`:

```bash
npm run build
npm run start
# or: npm run build:start
```

Open `http://localhost:4000` (or whatever `PORT` is set to). Deep links such as `/analysis/<id>` are handled by the SPA fallback.

**Health check:** `GET /api/health` returns `{ ok, supabase, cape }` for load balancers.

### Reverse proxy (TLS + WebSockets)

Place nginx or Caddy in front of Node and forward **Upgrade** / **Connection** headers so `/ws` works. Allow large request bodies for file uploads (up to 100 MB matches multer in `server.js`).

**nginx** (illustrative):

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
}
```

**Caddy** (illustrative): `reverse_proxy localhost:4000` with default WebSocket support; set `request_body` limits as needed for your install.

### Docker

```bash
docker compose build
docker compose up -d
```

Mount-backed sample storage uses the `arena_samples` volume (`samples` persist across container restarts). Configure Supabase and CAPE via `.env` as in local setup.

---

## API Reference

All endpoints are prefixed with the API server URL (default `http://localhost:4000`).

### Submit a sample

```
POST /api/analysis/submit
Content-Type: multipart/form-data

Fields:
  file        — binary file to analyze
  url         — URL to analyze (alternative to file)
  hash        — SHA256 hash to look up (alternative to file)
  os          — target OS (default: "Windows 10 x64")
  network_mode — "simulated" | "real"
  privacy     — "public" | "unlisted"

Response: { "id": "a1b2c3d4" }
```

### Get analysis status

```
GET /api/analysis/:id/status

Response: { "state": "running", "progress": 45, "status": "Sandbox: running" }
```

### Get analysis summary

```
GET /api/analysis/:id

Response: {
  "id": "a1b2c3d4",
  "verdict": "malicious",
  "threat_score": 85,
  "malware_family": "Emotet",
  "file_type": "application/x-dosexec",
  ...
}
```

### Get full report

```
GET /api/analysis/:id/full

Response: {
  "verdict": "malicious",
  "threat_score": 85,
  "timeline": [...],
  "network": [...],
  "iocs": [...]
}
```

### Public feed

```
GET /api/samples/public?limit=50
```

### Recent analyses

```
GET /api/samples/recent?limit=8
```

### IOC search

```
GET /api/ioc/search?q=evil.com

Response: [{ "type": "domain", "value": "evil.com", "confidence": 70 }]
```

### Threat families

```
GET /api/ioc/threat-families

Response: [{ "name": "Emotet", "count": 12, "tags": [...] }]
```

### Statistics

```
GET /api/stats

Response: { "total_analyses": 142, "malicious_rate": 34, "today": 7 }
```

### Health

```
GET /api/health

Response: { "ok": true, "supabase": true, "cape": false }
```

### WebSocket

Connect to `ws://localhost:4000/ws` and send:

```json
{ "type": "subscribe", "analysisId": "a1b2c3d4" }
```

You will receive messages with `type` of `status`, `analysis`, or `report` as the pipeline progresses.

---

## Project Structure

```
arena-mala/
├── server.js                 # Express API + WebSocket + pipeline orchestrator
├── lib/
│   ├── supabase.js           # Supabase client + data access layer
│   ├── static-analysis.js    # Hashing, file-type, strings, entropy, PE parsing
│   ├── sandbox.js            # CAPE Sandbox REST API client + report normalizer
│   └── scoring.js            # Threat scoring engine
├── supabase/
│   └── schema.sql            # PostgreSQL schema for Supabase
├── samples/                  # Local sample storage (gitignored)
├── .env.example              # Environment variable template
├── index.html                # Frontend entry point
├── index.css                 # Global styles (glassmorphic theme)
├── App.js                    # React app shell
├── Header.js                 # Navigation header
├── Sidebar.js                # Icon sidebar
├── HomePage.js               # Dashboard
├── SubmitForm.js             # Sample submission form
├── AnalysisPage.js           # Analysis detail view
├── PublicFeedPage.js         # Public submissions feed
├── IOCSearchPage.js          # IOC search
├── ThreatIntelPage.js        # Threat intelligence view
├── UI.js                     # Reusable UI components
├── helpers.js                # Utility functions
└── package.json
```

---

## Security Considerations

- **Network isolation**: Run CAPE and this server on an isolated analysis network. Malware samples will attempt to communicate with C2 servers.
- **Storage encryption**: Supabase Storage should have server-side encryption enabled. Consider encrypting samples at rest locally as well.
- **Access control**: The API has no authentication by default. Add auth middleware before exposing to any network beyond localhost.
- **Legal compliance**: Ensure you have authorization to analyze any samples you submit. Handling malware may be regulated in your jurisdiction.
- **Sample retention**: Implement a retention policy. The `samples/` directory and Supabase Storage will grow over time.

---

## License

MIT
