import { createClient } from '@supabase/supabase-js';

let _client = null;

function sb() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file.'
    );
  }
  _client = createClient(url, key);
  return _client;
}

export { sb as supabase };

// ─── Analyses ────────────────────────────────

export async function insertAnalysis(row) {
  const { data, error } = await sb()
    .from('analyses')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAnalysis(id, patch) {
  const { data, error } = await sb()
    .from('analyses')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAnalysisById(id) {
  const { data, error } = await sb()
    .from('analyses')
    .select()
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function getAnalysisByShortId(shortId) {
  const { data, error } = await sb()
    .from('analyses')
    .select()
    .eq('short_id', shortId)
    .single();
  if (error) return null;
  return data;
}

export async function getAnalysisBySha256(sha256) {
  const { data, error } = await sb()
    .from('analyses')
    .select()
    .eq('sha256', sha256)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getPublicAnalyses(limit = 50) {
  const { data, error } = await sb()
    .from('analyses')
    .select()
    .eq('privacy', 'public')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data;
}

export async function getRecentAnalyses(limit = 8) {
  const { data, error } = await sb()
    .from('analyses')
    .select()
    .in('status', ['completed', 'static-only'])
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data;
}

export async function getStats() {
  const { count: total } = await sb()
    .from('analyses')
    .select('*', { count: 'exact', head: true });

  const { count: malicious } = await sb()
    .from('analyses')
    .select('*', { count: 'exact', head: true })
    .eq('verdict', 'malicious');

  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const { count: today } = await sb()
    .from('analyses')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday);

  const completed = total || 1;
  return {
    total_analyses: total || 0,
    malicious_rate: Math.round(((malicious || 0) / completed) * 100),
    today: today || 0,
  };
}

// ─── Timeline Events ─────────────────────────

export async function insertTimelineEvents(analysisId, events) {
  if (!events?.length) return;
  const rows = events.map(e => ({
    analysis_id: analysisId,
    timestamp_sec: e.timestamp ?? e.timestamp_sec ?? 0,
    title: e.title || e.description || '',
    detail: e.detail || e.data || '',
    category: e.category || 'behavior',
  }));
  const { error } = await sb().from('timeline_events').insert(rows);
  if (error) console.error('insertTimelineEvents:', error.message);
}

export async function getTimelineEvents(analysisId) {
  const { data } = await sb()
    .from('timeline_events')
    .select()
    .eq('analysis_id', analysisId)
    .order('timestamp_sec', { ascending: true });
  return data || [];
}

// ─── Network Events ──────────────────────────

export async function insertNetworkEvents(analysisId, events) {
  if (!events?.length) return;
  const rows = events.map(e => ({
    analysis_id: analysisId,
    timestamp_sec: e.timestamp ?? e.timestamp_sec ?? 0,
    protocol: e.protocol || 'TCP',
    src_ip: e.src_ip || e.src,
    src_port: e.src_port ?? null,
    dst_ip: e.dst_ip || e.dst,
    dst_port: e.dst_port ?? null,
    hostname: e.hostname || e.host || null,
    request_data: typeof e.request_data === 'string' ? e.request_data : JSON.stringify(e.request_data || null),
  }));
  const { error } = await sb().from('network_events').insert(rows);
  if (error) console.error('insertNetworkEvents:', error.message);
}

export async function getNetworkEvents(analysisId) {
  const { data } = await sb()
    .from('network_events')
    .select()
    .eq('analysis_id', analysisId)
    .order('timestamp_sec', { ascending: true });
  return data || [];
}

// ─── IOCs ────────────────────────────────────

export async function insertIOCs(analysisId, iocs) {
  if (!iocs?.length) return;
  const rows = iocs.map(i => ({
    analysis_id: analysisId,
    type: i.type,
    value: i.value,
    confidence: i.confidence ?? 50,
    threat_label: i.threat_label || null,
  }));
  const { error } = await sb().from('iocs').insert(rows);
  if (error) console.error('insertIOCs:', error.message);
}

export async function searchIOCs(query, limit = 100) {
  const { data } = await sb()
    .from('iocs')
    .select()
    .ilike('value', `%${query}%`)
    .limit(limit);
  return data || [];
}

// ─── Threat Families ─────────────────────────

export async function upsertThreatFamily(name, tags = []) {
  const { data: existing } = await sb()
    .from('threat_families')
    .select()
    .eq('name', name)
    .maybeSingle();

  if (existing) {
    await sb().from('threat_families').update({
      count: existing.count + 1,
      last_seen: new Date().toISOString(),
      tags: [...new Set([...(existing.tags || []), ...tags])],
    }).eq('name', name);
  } else {
    await sb().from('threat_families').insert({
      name,
      count: 1,
      tags,
    });
  }
}

export async function getThreatFamilies() {
  const { data } = await sb()
    .from('threat_families')
    .select()
    .order('count', { ascending: false });
  return data || [];
}

// ─── Sample Storage ──────────────────────────

export async function uploadSample(fileName, buffer) {
  const storagePath = `${Date.now()}_${fileName}`;
  const { error } = await sb().storage
    .from('samples')
    .upload(storagePath, buffer, {
      contentType: 'application/octet-stream',
      upsert: false,
    });
  if (error) console.error('uploadSample:', error.message);
  return storagePath;
}
