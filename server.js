import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import crypto from 'node:crypto';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

const analyses = new Map();
const subscriptions = new Map();

function nowTs() {
  return Math.floor(Date.now() / 1000);
}

function makeBaseAnalysis(input) {
  const id = crypto.randomUUID().slice(0, 8);
  const hash = crypto.createHash('sha256').update((input.original_filename || id) + Date.now()).digest('hex');
  return {
    id,
    created_at: nowTs(),
    updated_at: nowTs(),
    status: 'queued',
    progress: 0,
    duration_sec: 0,
    os: input.os || 'Windows 10 x64',
    network_mode: input.network_mode || 'simulated',
    privacy: input.privacy || 'public',
    input_type: input.input_type,
    original_filename: input.original_filename || input.url || input.hash || 'sample.bin',
    file_type: input.file_type || 'unknown',
    file_size: input.file_size || 0,
    verdict: 'pending',
    threat_score: 0,
    malware_family: null,
    report: {
      verdict: 'pending',
      threat_score: 0,
      malware_family: null,
      sha256: hash,
      timeline: [],
      network: [],
      iocs: [
        { type: 'sha256', value: hash, confidence: 100, threat_label: 'Sample hash' },
      ],
      file_ops: [],
      registry_ops: [],
    },
  };
}

function publicSampleView(a) {
  return {
    id: a.id,
    created_at: a.created_at,
    original_filename: a.original_filename,
    file_type: a.file_type,
    file_size: a.file_size,
    verdict: a.verdict,
    threat_score: a.threat_score,
    malware_family: a.malware_family,
  };
}

function emit(analysisId, type, data) {
  const clients = subscriptions.get(analysisId);
  if (!clients) return;
  const payload = JSON.stringify({ type, data });
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) ws.send(payload);
  }
}

function runAnalysis(analysis) {
  const checkpoints = [
    { t: 1500, progress: 14, status: 'Booting VM', state: 'running' },
    { t: 3500, progress: 38, status: 'Executing sample', state: 'running' },
    { t: 6000, progress: 62, status: 'Collecting behavior', state: 'running' },
    { t: 8500, progress: 86, status: 'Scoring threats', state: 'running' },
    { t: 10500, progress: 100, status: 'Completed', state: 'completed' },
  ];

  checkpoints.forEach((step) => {
    setTimeout(() => {
      const current = analyses.get(analysis.id);
      if (!current) return;

      current.progress = step.progress;
      current.status = step.state;
      current.updated_at = nowTs();
      current.duration_sec = Math.max(1, current.updated_at - current.created_at);

      if (step.state === 'completed') {
        current.verdict = 'clean';
        current.report.verdict = 'clean';
      }

      emit(current.id, 'status', { state: current.status, progress: current.progress, status: step.status });
      emit(current.id, 'analysis', publicSampleView(current));
      if (step.state === 'completed') emit(current.id, 'report', current.report);
    }, step.t);
  });
}

app.get('/api/stats', (_req, res) => {
  const all = [...analyses.values()];
  const completed = all.filter((a) => a.status === 'completed');
  const malicious = completed.filter((a) => a.verdict === 'malicious').length;
  const todayTs = nowTs() - 86400;
  const today = all.filter((a) => a.created_at >= todayTs).length;
  res.json({
    total_analyses: all.length,
    malicious_rate: completed.length ? Math.round((malicious / completed.length) * 100) : 0,
    today,
  });
});

app.post('/api/analysis/submit', upload.single('file'), (req, res) => {
  const body = req.body || {};
  const inputType = req.file ? 'file' : body.url ? 'url' : body.hash ? 'hash' : 'file';
  const analysis = makeBaseAnalysis({
    input_type: inputType,
    original_filename: req.file?.originalname || body.url || body.hash || 'sample.bin',
    file_type: req.file?.mimetype || (inputType === 'url' ? 'url' : 'PE32 executable'),
    file_size: req.file?.size || 0,
    os: body.os,
    network_mode: body.network_mode,
    privacy: body.privacy || 'public',
    url: body.url,
    hash: body.hash,
  });

  analyses.set(analysis.id, analysis);
  runAnalysis(analysis);
  res.json({ id: analysis.id });
});

app.get('/api/analysis/:id/status', (req, res) => {
  const analysis = analyses.get(req.params.id);
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
  return res.json({
    state: analysis.status,
    progress: analysis.progress,
    status: analysis.status === 'completed' ? 'Completed' : 'Running',
  });
});

app.get('/api/analysis/:id', (req, res) => {
  const analysis = analyses.get(req.params.id);
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
  return res.json(publicSampleView(analysis));
});

app.get('/api/analysis/:id/full', (req, res) => {
  const analysis = analyses.get(req.params.id);
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
  return res.json(analysis.report);
});

app.get('/api/samples/public', (req, res) => {
  const limit = Number(req.query.limit || 50);
  const rows = [...analyses.values()]
    .filter((a) => a.privacy === 'public' && a.status === 'completed')
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, limit)
    .map(publicSampleView);
  res.json(rows);
});

app.get('/api/samples/recent', (req, res) => {
  const limit = Number(req.query.limit || 8);
  const rows = [...analyses.values()]
    .filter((a) => a.status === 'completed')
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, limit)
    .map(publicSampleView);
  res.json(rows);
});

app.get('/api/samples/search', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const rows = [...analyses.values()]
    .filter((a) => a.original_filename.toLowerCase().includes(q))
    .slice(0, 50)
    .map(publicSampleView);
  res.json(rows);
});

app.get('/api/ioc/search', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const out = [];
  for (const analysis of analyses.values()) {
    for (const ioc of analysis.report.iocs) {
      if (ioc.value.toLowerCase().includes(q)) out.push(ioc);
    }
  }
  res.json(out.slice(0, 100));
});

app.get('/api/ioc/threat-families', (_req, res) => {
  const counts = {};
  for (const analysis of analyses.values()) {
    if (!analysis.malware_family) continue;
    counts[analysis.malware_family] = (counts[analysis.malware_family] || 0) + 1;
  }
  const rows = Object.entries(counts).map(([name, count]) => ({
    name,
    count,
    summary: '',
    tags: [],
  }));
  res.json(rows);
});

server.on('upgrade', (request, socket, head) => {
  if (request.url !== '/ws') return socket.destroy();
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type !== 'subscribe' || !msg.analysisId) return;
      if (!subscriptions.has(msg.analysisId)) subscriptions.set(msg.analysisId, new Set());
      subscriptions.get(msg.analysisId).add(ws);
    } catch (_err) {
      // Ignore malformed messages.
    }
  });

  ws.on('close', () => {
    for (const set of subscriptions.values()) set.delete(ws);
  });
});

const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Arena Mala API listening on http://localhost:${PORT}`);
});
