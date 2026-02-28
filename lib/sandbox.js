import axios from 'axios';
import fs from 'node:fs';
import FormData from 'form-data';

const CAPE_URL = () => (process.env.CAPE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const CAPE_KEY = () => process.env.CAPE_API_KEY || '';

function headers() {
  const h = { Accept: 'application/json' };
  if (CAPE_KEY()) h['Authorization'] = `Token ${CAPE_KEY()}`;
  return h;
}

/**
 * Check if the CAPE sandbox is reachable.
 */
export async function isAvailable() {
  try {
    const res = await axios.get(`${CAPE_URL()}/apiv2/cuckoo/status/`, {
      headers: headers(),
      timeout: 5000,
    });
    return res.status === 200;
  } catch (_) {
    return false;
  }
}

/**
 * Submit a file to CAPE for analysis.
 * @param {string} filePath - absolute path to the sample on disk
 * @param {object} options - { machine, timeout, priority, memory, enforce_timeout }
 * @returns {{ task_id: number }}
 */
export async function submitFile(filePath, options = {}) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  if (options.machine) form.append('machine', options.machine);
  if (options.timeout) form.append('timeout', String(options.timeout));
  if (options.priority) form.append('priority', String(options.priority));
  if (options.memory) form.append('memory', 'true');
  if (options.enforce_timeout) form.append('enforce_timeout', 'true');

  const res = await axios.post(`${CAPE_URL()}/apiv2/tasks/create/file/`, form, {
    headers: { ...headers(), ...form.getHeaders() },
    maxContentLength: 200 * 1024 * 1024,
    timeout: 60000,
  });

  const data = res.data?.data || res.data;
  const taskId = data?.task_ids?.[0] || data?.task_id;
  if (!taskId) throw new Error('CAPE did not return a task_id');
  return { task_id: taskId };
}

/**
 * Submit a URL to CAPE for analysis.
 */
export async function submitUrl(url, options = {}) {
  const form = new FormData();
  form.append('url', url);
  if (options.machine) form.append('machine', options.machine);
  if (options.timeout) form.append('timeout', String(options.timeout));

  const res = await axios.post(`${CAPE_URL()}/apiv2/tasks/create/url/`, form, {
    headers: { ...headers(), ...form.getHeaders() },
    timeout: 30000,
  });

  const data = res.data?.data || res.data;
  const taskId = data?.task_ids?.[0] || data?.task_id;
  if (!taskId) throw new Error('CAPE did not return a task_id');
  return { task_id: taskId };
}

/**
 * Get the current status of a CAPE task.
 */
export async function getTaskStatus(taskId) {
  const res = await axios.get(`${CAPE_URL()}/apiv2/tasks/view/${taskId}/`, {
    headers: headers(),
    timeout: 10000,
  });

  const task = res.data?.data || res.data?.task || res.data;
  const status = task?.status;

  let progress = 0;
  if (status === 'pending') progress = 5;
  else if (status === 'running') progress = 40;
  else if (status === 'completed') progress = 80;
  else if (status === 'reported') progress = 100;
  else if (status === 'failed_analysis' || status === 'failed_processing') progress = 100;

  return {
    status,
    progress,
    started_on: task?.started_on,
    completed_on: task?.completed_on,
    machine: task?.machine,
    errors: task?.errors || [],
  };
}

/**
 * Fetch the full report from CAPE once analysis is completed.
 */
export async function getReport(taskId) {
  const res = await axios.get(`${CAPE_URL()}/apiv2/tasks/report/${taskId}/`, {
    headers: headers(),
    timeout: 120000,
    maxContentLength: 500 * 1024 * 1024,
  });
  return res.data;
}

/**
 * Poll CAPE until the task reaches a terminal state.
 */
export async function pollUntilComplete(taskId, onProgress, intervalMs = 5000, maxAttempts = 360) {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await getTaskStatus(taskId);
    onProgress?.(status);

    if (['reported', 'failed_analysis', 'failed_processing'].includes(status.status)) {
      return status;
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`CAPE task ${taskId} did not complete within timeout`);
}

/**
 * Normalize a CAPE report into Arena Mala's schema.
 */
export function normalizeReport(capeReport) {
  const timeline = [];
  const networkEvents = [];
  const iocs = [];
  let verdict = 'clean';
  let threatScore = 0;
  let malwareFamily = null;
  const signatures = [];

  // --- Behavioral signatures ---
  const sigs = capeReport?.signatures || [];
  for (const sig of sigs) {
    signatures.push(sig.name || sig.description);
    timeline.push({
      timestamp: 0,
      title: sig.name || 'Signature Match',
      detail: sig.description || '',
      category: 'signature',
    });

    const severity = sig.severity || 0;
    if (severity >= 3) threatScore = Math.max(threatScore, 80);
    else if (severity >= 2) threatScore = Math.max(threatScore, 50);
    else if (severity >= 1) threatScore = Math.max(threatScore, 25);
  }

  // --- Process events ---
  const processes = capeReport?.behavior?.processes || [];
  for (const proc of processes) {
    timeline.push({
      timestamp: proc.first_seen ? parseFloat(proc.first_seen) : 0,
      title: `Process: ${proc.process_name || 'unknown'} (PID ${proc.process_id || '?'})`,
      detail: proc.command_line || '',
      category: 'process',
    });
  }

  // --- Network ---
  const dns = capeReport?.network?.dns || [];
  for (const d of dns) {
    networkEvents.push({
      timestamp: 0,
      protocol: 'DNS',
      dst_ip: d.answers?.[0]?.data || '',
      dst_port: 53,
      hostname: d.request || '',
    });
    if (d.request) {
      iocs.push({ type: 'domain', value: d.request, confidence: 70, threat_label: 'DNS query' });
    }
  }

  const httpReqs = capeReport?.network?.http || [];
  for (const h of httpReqs) {
    networkEvents.push({
      timestamp: 0,
      protocol: h.port === 443 ? 'HTTPS' : 'HTTP',
      dst_ip: h.host || '',
      dst_port: h.port || 80,
      hostname: h.host || '',
      request_data: `${h.method || 'GET'} ${h.uri || '/'}`,
    });
    if (h.uri) {
      iocs.push({ type: 'url', value: `http://${h.host}${h.uri}`, confidence: 75, threat_label: 'HTTP request' });
    }
  }

  const tcpConns = capeReport?.network?.tcp || [];
  for (const t of tcpConns) {
    networkEvents.push({
      timestamp: 0,
      protocol: 'TCP',
      src_ip: t.src,
      src_port: t.sport,
      dst_ip: t.dst,
      dst_port: t.dport,
    });
    if (t.dst && !t.dst.startsWith('10.') && !t.dst.startsWith('192.168.')) {
      iocs.push({ type: 'ip', value: t.dst, confidence: 60, threat_label: 'TCP connection' });
    }
  }

  const udpConns = capeReport?.network?.udp || [];
  for (const u of udpConns) {
    networkEvents.push({
      timestamp: 0,
      protocol: 'UDP',
      src_ip: u.src,
      src_port: u.sport,
      dst_ip: u.dst,
      dst_port: u.dport,
    });
  }

  // --- Dropped files ---
  const dropped = capeReport?.dropped || [];
  for (const d of dropped) {
    if (d.sha256) {
      iocs.push({ type: 'sha256', value: d.sha256, confidence: 80, threat_label: `Dropped: ${d.name || 'file'}` });
    }
    timeline.push({
      timestamp: 0,
      title: `Dropped file: ${d.name || 'unknown'}`,
      detail: `Size: ${d.size || 0} bytes, SHA256: ${d.sha256 || 'N/A'}`,
      category: 'file',
    });
  }

  // --- CAPE detections ---
  const detections = capeReport?.detections || capeReport?.malfamily_tag || null;
  if (typeof detections === 'string' && detections) {
    malwareFamily = detections;
  } else if (capeReport?.info?.custom) {
    malwareFamily = capeReport.info.custom;
  }

  // --- Malscore ---
  const malscore = capeReport?.malscore ?? capeReport?.info?.score ?? 0;
  threatScore = Math.max(threatScore, Math.min(100, Math.round(malscore * 10)));

  // --- Verdict ---
  if (threatScore >= 70) verdict = 'malicious';
  else if (threatScore >= 30) verdict = 'suspicious';
  else verdict = 'clean';

  // --- Duration ---
  const info = capeReport?.info || {};
  let durationSec = 0;
  if (info.ended && info.started) {
    const start = new Date(info.started).getTime();
    const end = new Date(info.ended).getTime();
    if (!isNaN(start) && !isNaN(end)) durationSec = Math.round((end - start) / 1000);
  }
  if (!durationSec && info.duration) durationSec = info.duration;

  // Deduplicate IOCs by value
  const seenValues = new Set();
  const uniqueIOCs = iocs.filter(i => {
    if (seenValues.has(i.value)) return false;
    seenValues.add(i.value);
    return true;
  });

  return {
    timeline,
    network: networkEvents,
    iocs: uniqueIOCs,
    verdict,
    threatScore,
    malwareFamily,
    signatures,
    durationSec,
  };
}
