import React, { useEffect, useState } from 'react';
import { api } from './clientApi';
import { EmptyState, Spinner } from './UI';

export default function ThreatIntelPage() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getThreatFamilies().then(setFamilies).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 80px' }}>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>Threat Intel</h2>
        <p style={{ color: 'var(--text3)', fontSize: 14 }}>
          Threat family profiles aggregated from all analyses
        </p>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={24} /></div>
      )}

      {!loading && !families.length && (
        <EmptyState message="No threat intel yet" sub="Submit samples for analysis to build threat intelligence" />
      )}

      <div style={{ display: 'grid', gap: 14, maxWidth: 720 }}>
        {families.map((fam, i) => (
          <div key={fam.name} className="glass gradient-border fade-scale" style={{
            padding: '20px 22px', animationDelay: `${i * 0.08}s`,
            cursor: 'default',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01"/>
                  </svg>
                </div>
                <strong style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{fam.name}</strong>
              </div>
              <span style={{
                color: 'var(--text4)', fontFamily: 'var(--font-mono)', fontSize: 11,
                background: 'rgba(200,170,120,0.06)', padding: '4px 12px', borderRadius: 8,
                border: '1px solid rgba(200,170,120,0.04)',
              }}>
                {fam.count} samples
              </span>
            </div>
            <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7, marginBottom: 14, paddingLeft: 50 }}>
              {fam.summary}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 50 }}>
              {fam.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: 10, padding: '3px 12px', borderRadius: 999,
                  border: '1px solid rgba(200,170,120,0.08)',
                  background: 'rgba(200,170,120,0.04)',
                  color: 'var(--text3)', fontWeight: 500,
                  transition: 'all 0.2s',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
