import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createServer } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  insertAnalysis, updateAnalysis,
  getAnalysisByShortId, getAnalysisBySha256,
  getPublicAnalyses, getRecentAnalyses, getStats,
  insertTimelineEvents, getTimelineEvents,
  insertNetworkEvents, getNetworkEvents,
  insertIOCs, searchIOCs,
  upsertThreatFamily, getThreatFamilies,
  uploadSample,
} from './lib/supabase.js';

import { analyzeStatic } from './lib/static-analysis.js';

import {
  isAvailable as isSandboxAvailable,
  submitFile as sandboxSubmitFile,
  submitUrl as sandboxSubmitUrl,
  pollUntilComplete,
  getReport as sandboxGetReport,
  normalizeReport,
} from './lib/sandbox.js';

import { computeVerdict } from './lib/scoring.js';

// ─── Express + WebSocket setup ───────────────

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

const SAMPLE_DIR = process.env.SAMPLE_STORAGE_DIR || './samples';
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const HAS_DIST = fs.existsSync(path.join(DIST_DIR, 'index.html'));
fs.mkdirSync(SAMPLE_DIR, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ─── WebSocket subscriptions ─────────────────

const subscriptions = new Map();

function emit(shortId, type, data) {
  const clients = subscriptions.get(shortId);
  if (!clients) return;
  const payload = JSON.stringify({ type, data });
  for (const socket of clients) {
    if (socket.readyState === WebSocket.OPEN) socket.send(payload);
  }
}

server.on('upgrade', (request, socket, head) => {
  try {
    const pathname = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;
    if (pathname !== '/ws') return socket.destroy();
  } catch {
    return socket.destroy();
  }
  wss.handleUpgrade(request, socket, head, ws => wss.emit('connection', ws, request));
});

wss.on('connection', ws => {
  ws.on('message', raw => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type !== 'subscribe' || !msg.analysisId) return;
      if (!subscriptions.has(msg.analysisId)) subscriptions.set(msg.analysisId, new Set());
      subscriptions.get(msg.analysisId).add(ws);
    } catch (_) {}
  });
  ws.on('close', () => {
    for (const set of subscriptions.values()) set.delete(ws);
  });
});

// ─── Helpers ─────────────────────────────────

function shortId() {
  return crypto.randomUUID().slice(0, 8);
}

function publicView(a) {
  return {
    id: a.short_id,
    created_at: a.created_at ? Math.floor(new Date(a.created_at).getTime() / 1000) : 0,
    original_filename: a.original_filename,
    file_type: a.file_type,
    file_size: a.file_size,
    verdict: a.verdict,
    threat_score: a.threat_score,
    malware_family: a.malware_family,
    os: a.os,
    network_mode: a.network_mode,
    duration_sec: a.duration_sec,
  };
}

// ─── Analysis pipeline ──────────────────────

async function runPipeline(analysis, fileBuffer, filePath) {
  const sid = analysis.short_id;
  const dbId = analysis.id;

  try {
    // Phase 1: Static analysis
    emit(sid, 'status', { state: 'running', progress: 10, status: 'Static analysis...' });

    let staticReport = null;
    if (fileBuffer) {
      staticReport = await analyzeStatic(fileBuffer);
      await updateAnalysis(dbId, {
        md5: staticReport.hashes.md5,
        sha1: staticReport.hashes.sha1,
        sha256: staticReport.hashes.sha256,
        file_type: staticReport.fileType?.mime || analysis.file_type,
        static_report: staticReport,
        progress: 20,
      });

      const hashIOCs = [
        { type: 'md5', value: staticReport.hashes.md5, confidence: 100, threat_label: 'Sample hash' },
        { type: 'sha1', value: staticReport.hashes.sha1, confidence: 100, threat_label: 'Sample hash' },
        { type: 'sha256', value: staticReport.hashes.sha256, confidence: 100, threat_label: 'Sample hash' },
      ];
      for (const ind of staticReport.indicators) {
        if (ind.type === 'embedded_url') hashIOCs.push({ type: 'url', value: ind.value, confidence: 65, threat_label: 'Embedded URL' });
        if (ind.type === 'embedded_ip') hashIOCs.push({ type: 'ip', value: ind.value, confidence: 55, threat_label: 'Embedded IP' });
      }
      await insertIOCs(dbId, hashIOCs);
    }

    emit(sid, 'status', { state: 'running', progress: 25, status: 'Static analysis complete' });

    // Phase 2: Sandbox detonation
    const sandboxUp = await isSandboxAvailable();

    if (!sandboxUp) {
      console.warn(`[${sid}] CAPE sandbox not available — finishing with static-only results`);
      const staticVerdict = computeVerdict(staticReport, null);
      await updateAnalysis(dbId, {
        status: 'static-only',
        progress: 100,
        verdict: staticVerdict.verdict,
        threat_score: staticVerdict.threat_score,
        malware_family: staticVerdict.malware_family,
        signatures: staticVerdict.signatures,
        duration_sec: Math.round((Date.now() - new Date(analysis.created_at).getTime()) / 1000),
      });

      const updated = await getAnalysisByShortId(sid);
      emit(sid, 'status', { state: 'static-only', progress: 100, status: 'Completed (static only)' });
      emit(sid, 'analysis', publicView(updated));
      emit(sid, 'report', {
        verdict: staticVerdict.verdict,
        threat_score: staticVerdict.threat_score,
        malware_family: staticVerdict.malware_family,
        sha256: staticReport?.hashes?.sha256,
        timeline: [],
        network: [],
        iocs: await searchIOCs(staticReport?.hashes?.sha256 || '', 200),
      });
      return;
    }

    // Submit to CAPE
    emit(sid, 'status', { state: 'running', progress: 30, status: 'Submitting to sandbox...' });

    let capeResult;
    if (analysis.input_type === 'url') {
      capeResult = await sandboxSubmitUrl(analysis.original_filename, {
        timeout: 120,
      });
    } else if (filePath) {
      capeResult = await sandboxSubmitFile(filePath, {
        timeout: 120,
      });
    } else {
      throw new Error('No file or URL to submit to sandbox');
    }

    await updateAnalysis(dbId, {
      sandbox_task_id: String(capeResult.task_id),
      progress: 35,
    });

    emit(sid, 'status', { state: 'running', progress: 35, status: 'Queued in sandbox' });

    // Phase 3: Poll sandbox
    await pollUntilComplete(capeResult.task_id, (taskStatus) => {
      const mappedProgress = 35 + Math.round((taskStatus.progress / 100) * 50);
      emit(sid, 'status', {
        state: 'running',
        progress: Math.min(85, mappedProgress),
        status: `Sandbox: ${taskStatus.status}`,
      });
      updateAnalysis(dbId, { progress: Math.min(85, mappedProgress) }).catch(() => {});
    });

    // Phase 4: Fetch & normalize report
    emit(sid, 'status', { state: 'running', progress: 88, status: 'Processing report...' });

    const capeReport = await sandboxGetReport(capeResult.task_id);
    const normalized = normalizeReport(capeReport);

    // Phase 5: Score & persist
    emit(sid, 'status', { state: 'running', progress: 92, status: 'Scoring...' });

    const finalVerdict = computeVerdict(staticReport, normalized);

    await insertTimelineEvents(dbId, normalized.timeline);
    await insertNetworkEvents(dbId, normalized.network);
    await insertIOCs(dbId, normalized.iocs);

    if (finalVerdict.malware_family) {
      await upsertThreatFamily(finalVerdict.malware_family, finalVerdict.signatures.slice(0, 10));
    }

    await updateAnalysis(dbId, {
      status: 'completed',
      progress: 100,
      verdict: finalVerdict.verdict,
      threat_score: finalVerdict.threat_score,
      malware_family: finalVerdict.malware_family,
      signatures: finalVerdict.signatures,
      duration_sec: normalized.durationSec || Math.round((Date.now() - new Date(analysis.created_at).getTime()) / 1000),
    });

    // Phase 6: Emit final results
    const updated = await getAnalysisByShortId(sid);
    const timelineEvts = await getTimelineEvents(dbId);
    const networkEvts = await getNetworkEvents(dbId);
    const allIOCs = await searchIOCs(staticReport?.hashes?.sha256 || sid, 500);

    emit(sid, 'status', { state: 'completed', progress: 100, status: 'Completed' });
    emit(sid, 'analysis', publicView(updated));
    emit(sid, 'report', {
      verdict: finalVerdict.verdict,
      threat_score: finalVerdict.threat_score,
      malware_family: finalVerdict.malware_family,
      sha256: staticReport?.hashes?.sha256 || updated.sha256,
      timeline: timelineEvts.map(e => ({ timestamp: e.timestamp_sec, title: e.title, detail: e.detail })),
      network: networkEvts.map(e => ({
        timestamp: e.timestamp_sec, protocol: e.protocol,
        dst_ip: e.dst_ip, dst_port: e.dst_port, hostname: e.hostname,
      })),
      iocs: allIOCs.map(i => ({ type: i.type, value: i.value, confidence: i.confidence })),
    });

  } catch (err) {
    console.error(`[${sid}] Pipeline error:`, err.message);

    const staticReport = (await getAnalysisByShortId(sid))?.static_report;
    const fallback = computeVerdict(staticReport, null);

    await updateAnalysis(dbId, {
      status: 'failed',
      progress: 100,
      verdict: fallback.verdict,
      threat_score: fallback.threat_score,
      signatures: fallback.signatures,
    }).catch(() => {});

    emit(sid, 'status', { state: 'failed', progress: 100, status: `Failed: ${err.message}` });
  }
}

// ─── API Routes ──────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY),
    cape: Boolean(process.env.CAPE_API_URL),
  });
});

app.get('/api/stats', safe(async (_req, res) => {
  const stats = await getStats();
  res.json(stats);
}));

app.post('/api/analysis/submit', upload.single('file'), async (req, res) => {
  try {
    const body = req.body || {};
    const inputType = req.file ? 'file' : body.url ? 'url' : body.hash ? 'hash' : 'file';
    const sid = shortId();

    // Hash lookup — return existing analysis if we've seen this hash before
    if (inputType === 'hash' && body.hash) {
      const existing = await getAnalysisBySha256(body.hash.toLowerCase());
      if (existing) return res.json({ id: existing.short_id });
    }

    let fileBuffer = null;
    let filePath = null;

    if (req.file) {
      fileBuffer = req.file.buffer;
      filePath = path.join(SAMPLE_DIR, `${sid}_${req.file.originalname}`);
      fs.writeFileSync(filePath, fileBuffer);

      // Upload to Supabase Storage (non-blocking)
      uploadSample(req.file.originalname, fileBuffer).catch(e =>
        console.error('Storage upload failed:', e.message)
      );
    }

    const analysis = await insertAnalysis({
      short_id: sid,
      status: 'queued',
      progress: 0,
      input_type: inputType,
      original_filename: req.file?.originalname || body.url || body.hash || 'sample.bin',
      file_type: req.file?.mimetype || (inputType === 'url' ? 'url' : 'unknown'),
      file_size: req.file?.size || 0,
      os: body.os || 'Windows 10 x64',
      network_mode: body.network_mode || 'simulated',
      privacy: body.privacy || 'public',
      verdict: 'pending',
      threat_score: 0,
      storage_path: filePath || null,
    });

    res.json({ id: sid });

    // Run the pipeline asynchronously
    runPipeline(analysis, fileBuffer, filePath).catch(err =>
      console.error(`[${sid}] Unhandled pipeline error:`, err.message)
    );

  } catch (err) {
    console.error('Submit error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

function safe(fn) {
  return (req, res, next) => fn(req, res, next).catch(err => {
    console.error(`API error [${req.method} ${req.path}]:`, err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  });
}

app.get('/api/analysis/:id/status', safe(async (req, res) => {
  const analysis = await getAnalysisByShortId(req.params.id);
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
  res.json({
    state: analysis.status,
    progress: analysis.progress,
    status: analysis.status === 'completed' ? 'Completed' : analysis.status === 'static-only' ? 'Completed (static only)' : 'Running',
  });
}));

app.get('/api/analysis/:id', safe(async (req, res) => {
  const analysis = await getAnalysisByShortId(req.params.id);
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
  res.json(publicView(analysis));
}));

app.get('/api/analysis/:id/full', safe(async (req, res) => {
  const analysis = await getAnalysisByShortId(req.params.id);
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });

  const timeline = await getTimelineEvents(analysis.id);
  const network = await getNetworkEvents(analysis.id);

  const { supabase } = await import('./lib/supabase.js');
  const { data: iocs } = await supabase()
    .from('iocs')
    .select()
    .eq('analysis_id', analysis.id);

  res.json({
    verdict: analysis.verdict,
    threat_score: analysis.threat_score,
    malware_family: analysis.malware_family,
    sha256: analysis.sha256,
    timeline: (timeline || []).map(e => ({ timestamp: e.timestamp_sec, title: e.title, detail: e.detail })),
    network: (network || []).map(e => ({
      timestamp: e.timestamp_sec, protocol: e.protocol,
      dst_ip: e.dst_ip, dst_port: e.dst_port, hostname: e.hostname,
    })),
    iocs: (iocs || []).map(i => ({ type: i.type, value: i.value, confidence: i.confidence })),
    file_ops: [],
    registry_ops: [],
  });
}));

app.get('/api/samples/public', safe(async (req, res) => {
  const limit = Number(req.query.limit || 50);
  const rows = await getPublicAnalyses(limit);
  res.json(rows.map(publicView));
}));

app.get('/api/samples/recent', safe(async (req, res) => {
  const limit = Number(req.query.limit || 8);
  const rows = await getRecentAnalyses(limit);
  res.json(rows.map(publicView));
}));

app.get('/api/samples/search', safe(async (req, res) => {
  const q = String(req.query.q || '');
  if (!q) return res.json([]);
  const { supabase } = await import('./lib/supabase.js');
  const { data } = await supabase()
    .from('analyses')
    .select()
    .ilike('original_filename', `%${q}%`)
    .limit(50);
  res.json((data || []).map(publicView));
}));

app.get('/api/ioc/search', safe(async (req, res) => {
  const q = String(req.query.q || '');
  if (!q) return res.json([]);
  const results = await searchIOCs(q, 100);
  res.json(results.map(i => ({ type: i.type, value: i.value, confidence: i.confidence })));
}));

app.get('/api/ioc/threat-families', safe(async (_req, res) => {
  const families = await getThreatFamilies();
  res.json(families.map(f => ({
    name: f.name,
    count: f.count,
    summary: f.summary || '',
    tags: f.tags || [],
  })));
}));

// ─── Production: Vite build (same origin) ────

if (HAS_DIST) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.status(404).send('Not found');
});

// ─── Start ───────────────────────────────────

const PORT = Number(process.env.PORT || 8000);
server.listen(PORT, () => {
  console.log(`Arena Mala API listening on http://localhost:${PORT}`);
  console.log(`  Supabase: ${process.env.SUPABASE_URL ? 'configured' : 'NOT configured'}`);
  console.log(`  CAPE:     ${process.env.CAPE_API_URL || 'NOT configured'}`);
  console.log(`  Samples:  ${path.resolve(SAMPLE_DIR)}`);
  console.log(`  Web UI:   ${HAS_DIST ? `serving ${DIST_DIR}` : 'not built (run npm run build)'}`);
});
