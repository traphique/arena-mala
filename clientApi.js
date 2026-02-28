const API_BASE = '/api';

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Analysis
  submitFile: (formData) => fetch(API_BASE + '/analysis/submit', { method: 'POST', body: formData }).then(r => r.json()),
  submitUrl: (data) => apiFetch('/analysis/submit', { method: 'POST', body: JSON.stringify(data) }),
  submitHash: (hash) => apiFetch('/analysis/submit', { method: 'POST', body: JSON.stringify({ hash }) }),
  getAnalysis: (id) => apiFetch(`/analysis/${id}`),
  getFullAnalysis: (id) => apiFetch(`/analysis/${id}/full`),
  getStatus: (id) => apiFetch(`/analysis/${id}/status`),
  downloadReport: (id) => { window.open(API_BASE + `/analysis/${id}/report`, '_blank'); },

  // Samples
  getPublicSamples: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/samples/public${qs ? '?' + qs : ''}`);
  },
  getRecentSamples: (limit = 8) => apiFetch(`/samples/recent?limit=${limit}`),
  searchSamples: (q) => apiFetch(`/samples/search?q=${encodeURIComponent(q)}`),

  // IOC
  searchIOC: (q) => apiFetch(`/ioc/search?q=${encodeURIComponent(q)}`),
  getThreatFamilies: () => apiFetch('/ioc/threat-families'),

  // Stats
  getStats: () => apiFetch('/stats'),
};

// WebSocket
export function createWebSocket(analysisId, handlers = {}) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'subscribe', analysisId }));
    handlers.onOpen?.();
  };

  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data);
      handlers.onMessage?.(msg);
      handlers[msg.type]?.(msg.data, msg);
    } catch (e) {}
  };

  ws.onerror = (e) => { handlers.onError?.(e); };
  ws.onclose = () => { handlers.onClose?.(); };

  return ws;
}
