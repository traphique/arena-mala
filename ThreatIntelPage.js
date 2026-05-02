import React, { useEffect, useState } from 'react';
import { api } from './clientApi';
import { EmptyState, Spinner, TagList } from './UI';

export default function ThreatIntelPage() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.getThreatFamilies().then(setFamilies).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-padding-main" style={{ flex: 1, overflowY: 'auto' }}>
    <div className="page-inner">
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, marginBottom: 4 }}>Threat Intel</h2>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>
          Threat family profiles aggregated from all analyses
        </p>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={22} /></div>
      )}

      {!loading && !families.length && (
        <EmptyState message="No threat intel yet" sub="Submit samples for analysis to build threat intelligence" />
      )}

      <div className="threat-page-grid">
        {families.map((fam, i) => (
          <div key={fam.name} className="fade-scale" style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px',
            animationDelay: `${i * 0.06}s`,
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01"/>
                  </svg>
                </div>
                <strong style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{fam.name}</strong>
              </div>
              <span style={{
                fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)',
                background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 6,
                border: '1px solid var(--border)', flexShrink: 0,
              }}>
                {fam.count} sample{fam.count !== 1 ? 's' : ''}
              </span>
            </div>

            {fam.summary && (
              <p style={{
                color: 'var(--text3)', fontSize: 13, lineHeight: 1.65,
                marginBottom: fam.tags?.length ? 12 : 0,
                paddingLeft: 48,
              }}>
                {fam.summary}
              </p>
            )}

            {fam.tags?.length > 0 && (
              <div style={{ paddingLeft: 48 }}>
                <TagList tags={fam.tags} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
