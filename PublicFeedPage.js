import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './clientApi';
import { EmptyState, Spinner, VerdictTag } from './UI';
import { fileIcon, formatBytes, formatTime } from './helpers';

export default function PublicFeedPage() {
  const [items, setItems] = useState([]);
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
      <EmptyState message="No public submissions yet" sub="Submit a sample to see it appear in the feed" />
    </div>
  );

  return (
    <div className="page-padding-main" style={{ flex: 1, overflowY: 'auto' }}>
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>Public Feed</h2>
        <p style={{ color: 'var(--text3)', fontSize: 14 }}>
          Browse publicly submitted samples and their analysis results
        </p>
      </div>

      <div className="glass fade-scale delay-1" style={{ overflow: 'hidden', padding: 0 }}>
        {items.map((sample, i) => (
          <div
            key={sample.id}
            onClick={() => navigate(`/analysis/${sample.id}`)}
            style={{
              display: 'grid', gridTemplateColumns: '46px 1fr auto auto',
              gap: 14, alignItems: 'center',
              padding: '13px 18px',
              borderBottom: i < items.length - 1 ? '1px solid rgba(200,170,120,0.04)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.22, 0.68, 0, 1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,170,120,0.03)'; e.currentTarget.style.paddingLeft = '22px'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '18px'; }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(200,170,120,0.06)', border: '1px solid rgba(200,170,120,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, transition: 'transform 0.2s',
            }}>
              {fileIcon(sample.original_filename, sample.file_type)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sample.original_filename}
              </div>
              <div style={{ color: 'var(--text4)', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                {sample.file_type} · {formatBytes(sample.file_size)} · {formatTime(sample.created_at)}
              </div>
            </div>
            <span style={{
              color: sample.threat_score >= 70 ? 'var(--red)' : sample.threat_score >= 30 ? 'var(--orange)' : 'var(--yellow)',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14,
              textShadow: `0 0 12px ${sample.threat_score >= 70 ? 'rgba(239,83,80,0.3)' : 'rgba(255,152,0,0.2)'}`,
            }}>
              {sample.threat_score}
            </span>
            <VerdictTag verdict={sample.verdict} />
          </div>
        ))}
      </div>
    </div>
  );
}
