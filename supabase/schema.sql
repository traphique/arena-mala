-- Arena Mala: Malware Detonation Infrastructure
-- Run this against your Supabase SQL editor or via psql.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- Core analyses table
-- ─────────────────────────────────────────────
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','static-only')),
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  input_type TEXT NOT NULL CHECK (input_type IN ('file','url','hash')),
  original_filename TEXT,
  file_type TEXT,
  file_size BIGINT DEFAULT 0,

  md5 TEXT,
  sha1 TEXT,
  sha256 TEXT,

  os TEXT DEFAULT 'Windows 10 x64',
  network_mode TEXT DEFAULT 'simulated',
  duration_sec INT DEFAULT 0,
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public','unlisted')),

  verdict TEXT DEFAULT 'pending' CHECK (verdict IN ('pending','clean','suspicious','malicious')),
  threat_score INT DEFAULT 0 CHECK (threat_score >= 0 AND threat_score <= 100),
  malware_family TEXT,
  signatures TEXT[] DEFAULT '{}',

  sandbox_task_id TEXT,
  static_report JSONB,
  storage_path TEXT
);

-- ─────────────────────────────────────────────
-- Timeline events from dynamic analysis
-- ─────────────────────────────────────────────
CREATE TABLE timeline_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  timestamp_sec REAL NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  detail TEXT,
  category TEXT
);

-- ─────────────────────────────────────────────
-- Network connections captured during execution
-- ─────────────────────────────────────────────
CREATE TABLE network_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  timestamp_sec REAL DEFAULT 0,
  protocol TEXT,
  src_ip TEXT,
  src_port INT,
  dst_ip TEXT,
  dst_port INT,
  hostname TEXT,
  request_data TEXT
);

-- ─────────────────────────────────────────────
-- Extracted Indicators of Compromise
-- ─────────────────────────────────────────────
CREATE TABLE iocs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  confidence INT DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  threat_label TEXT
);

-- ─────────────────────────────────────────────
-- Threat family aggregation
-- ─────────────────────────────────────────────
CREATE TABLE threat_families (
  name TEXT PRIMARY KEY,
  count INT DEFAULT 1,
  first_seen TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ DEFAULT now(),
  summary TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}'
);

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_analyses_created ON analyses(created_at DESC);
CREATE INDEX idx_analyses_sha256 ON analyses(sha256);
CREATE INDEX idx_analyses_short_id ON analyses(short_id);
CREATE INDEX idx_timeline_analysis ON timeline_events(analysis_id);
CREATE INDEX idx_network_analysis ON network_events(analysis_id);
CREATE INDEX idx_iocs_analysis ON iocs(analysis_id);
CREATE INDEX idx_iocs_value ON iocs(value);
CREATE INDEX idx_iocs_type ON iocs(type);

-- ─────────────────────────────────────────────
-- Auto-update updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_analyses_updated
  BEFORE UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- Supabase Storage bucket (run via dashboard or API)
-- Bucket name: samples
-- Public: false
-- ─────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('samples', 'samples', false)
-- ON CONFLICT DO NOTHING;
