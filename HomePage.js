import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './clientApi';
import SubmitForm from './SubmitForm';
import { VerdictTag, Spinner } from './UI';
import { formatTime, formatBytes, fileIcon } from './helpers';

const STAT_ICONS = {
  'Total Analyses': 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  'Malicious Rate': 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  'Today': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2',
  'Avg. Analysis': 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
};

const STAT_COLORS = {
  'Total Analyses': 'var(--blue)',
  'Malicious Rate': 'var(--red)',
  'Today':          'var(--purple)',
  'Avg. Analysis':  'var(--green)',
};

export default function HomePage() {
  const [stats, setStats]               = useState(null);
  const [recent, setRecent]             = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [bannerError, setBannerError]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setBannerError(null);
    api.getStats().then(s => { if (!cancelled) setStats(s); }).catch(err => {
      if (!cancelled) setBannerError(err.message || 'Failed to load statistics');
    });
    api.getRecentSamples(8)
      .then(r => { if (!cancelled) { setRecent(r); setLoadingRecent(false); } })
      .catch(err => {
        if (!cancelled) {
          setLoadingRecent(false);
          setBannerError(prev => prev || err.message || 'Failed to load recent samples');
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page-padding-main" style={{ flex: 1, overflowY: 'auto' }}>

      {/* Hero */}
      <div className="fade-up" style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 20,
          border: '1px solid rgba(239,68,68,0.20)',
          background: 'rgba(239,68,68,0.07)',
          fontSize: 12, fontWeight: 600, color: 'var(--red)',
          marginBottom: 20,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 2s ease-in-out infinite', flexShrink: 0 }} />
          Malware Analysis Sandbox
        </div>

        <h1 className="home-hero-title fade-up delay-1" style={{
          fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1,
          marginBottom: 16, color: 'var(--text)',
        }}>
          Detonate &amp; Analyze{' '}
          <span style={{ color: 'var(--red)' }}>Threats</span>
        </h1>

        <p className="fade-up delay-2" style={{
          maxWidth: 480, margin: '0 auto',
          fontSize: 15, lineHeight: 1.7, color: 'var(--text3)',
        }}>
          Submit files or URLs for execution in isolated VMs. Monitor behavior,
          intercept network traffic, and extract threat intelligence in real time.
        </p>
      </div>

      {bannerError && (
        <div className="home-error-banner fade-up" role="alert">
          {bannerError}
        </div>
      )}

      {/* Submit form */}
      <div className="fade-scale delay-3" style={{ display: 'flex', justifyContent: 'center', marginBottom: 44 }}>
        <SubmitForm />
      </div>

      {/* Stats */}
      {stats && (
        <div className="fade-up delay-4 home-stats-grid">
          {[
            { label: 'Total Analyses', value: stats.total_analyses?.toLocaleString() },
            { label: 'Malicious Rate', value: stats.malicious_rate + '%' },
            { label: 'Today',          value: stats.today?.toLocaleString() },
            { label: 'Avg. Analysis',  value: '~45s' },
          ].map((stat) => {
            const color = STAT_COLORS[stat.label];
            return (
              <div key={stat.label} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '18px 16px',
                textAlign: 'center',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: `${color}12`,
                  border: `1px solid ${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={STAT_ICONS[stat.label]} />
                  </svg>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800,
                  color, marginBottom: 4,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: 11, color: 'var(--text4)',
                  letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500,
                }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent samples */}
      <div className="fade-up delay-5" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <span style={{
            fontSize: 12, fontWeight: 600, color: 'var(--text2)',
            letterSpacing: '0.01em',
          }}>
            Recent Submissions
          </span>
          <button
            onClick={() => navigate('/public')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '5px 12px',
              color: 'var(--text3)', fontSize: 12, fontWeight: 500,
              fontFamily: 'var(--font-ui)', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text3)'; }}
          >
            View all
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {loadingRecent ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 36 }}><Spinner /></div>
        ) : recent.length === 0 ? (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '32px',
            textAlign: 'center', color: 'var(--text4)', fontSize: 13,
          }}>
            No recent submissions yet
          </div>
        ) : (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            {recent.map((sample, i) => (
              <div
                key={sample.id}
                onClick={() => navigate('/analysis/' + sample.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 16px', cursor: 'pointer',
                  borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, flexShrink: 0,
                }}>
                  {fileIcon(sample.original_filename, sample.file_type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                    {sample.original_filename}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text4)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {sample.file_type || 'Unknown'} · {formatBytes(sample.file_size)} · {formatTime(sample.created_at)}
                  </div>
                </div>
                {sample.malware_family && (
                  <div style={{
                    fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)',
                    flexShrink: 0, maxWidth: 130,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: 5,
                    border: '1px solid var(--border)',
                  }}>
                    {sample.malware_family}
                  </div>
                )}
                {sample.threat_score > 0 && (
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, flexShrink: 0,
                    color: sample.threat_score >= 70 ? 'var(--red)' : sample.threat_score >= 30 ? 'var(--orange)' : 'var(--yellow)',
                    width: 32, textAlign: 'right',
                  }}>
                    {sample.threat_score}
                  </div>
                )}
                <VerdictTag verdict={sample.verdict} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
