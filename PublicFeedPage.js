import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './clientApi';
import { EmptyState, Spinner, VerdictTag } from './UI';
import { fileIcon, formatBytes, formatTime } from './helpers';

export default function PublicFeedPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getPublicSamples({ limit: 50 }).then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={24} />
    </div>
  );

  if (!items.length) return (
    <div style={{ flex: 1 }}>
      <EmptyState message="No public submissions yet" sub="Submit a sample to see it appear here" />
    </div>
  );

  return (
    <div className="page-padding-main" style={{ flex: 1, overflowY: 'auto' }}>
      <div className="fade-up" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, marginBottom: 4 }}>Public Feed</h2>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>
          Community-submitted samples and their analysis results
        </p>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '36px 1fr 90px 60px 80px',
        gap: 12, padding: '8px 16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      }}>
        {['', 'File', 'Type', 'Score', 'Verdict'].map(h => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
        ))}
      </div>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)', borderTop: 'none',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {items.map((sample, i) => (
          <div
            key={sample.id}
            onClick={() => navigate(`/analysis/${sample.id}`)}
            style={{
              display: 'grid', gridTemplateColumns: '36px 1fr 90px 60px 80px',
              gap: 12, alignItems: 'center',
              padding: '10px 16px',
              borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 7,
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, flexShrink: 0,
            }}>
              {fileIcon(sample.original_filename, sample.file_type)}
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                {sample.original_filename}
              </div>
              <div style={{ color: 'var(--text4)', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {formatBytes(sample.file_size)} · {formatTime(sample.created_at)}
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sample.file_type || '—'}
            </div>

            <span style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13,
              color: sample.threat_score >= 70 ? 'var(--red)' : sample.threat_score >= 30 ? 'var(--orange)' : 'var(--yellow)',
            }}>
              {sample.threat_score || '—'}
            </span>

            <VerdictTag verdict={sample.verdict} />
          </div>
        ))}
      </div>
    </div>
  );
}
