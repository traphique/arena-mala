import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './clientApi';
import SubmitForm from './SubmitForm';
import { VerdictTag, Spinner } from './UI';
import { formatTime, formatBytes, fileIcon } from './helpers';

export default function HomePage() {
  const [stats, setStats]             = useState(null);
  const [recent, setRecent]           = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [bannerError, setBannerError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setBannerError(null);
    api.getStats().then(s => { if (!cancelled) setStats(s); }).catch(err => {
      if (!cancelled) setBannerError(err.message || 'Failed to load statistics');
    });
    api.getRecentSamples(8)
      .then(r => { if (!cancelled) { setRecent(r); setLoadingRecent(false); }})
      .catch(err => { if (!cancelled) { setLoadingRecent(false); setBannerError(prev => prev || err.message); }});
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page-padding-main" style={{ flex: 1, overflowY: 'auto' }}>
    <div className="page-inner">

      {/* Page header */}
      <div className="fade-up" style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)', paddingBottom: 24, marginBottom: 32,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem,4vw,2.8rem)',
            fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.1,
            color: 'var(--text)', marginBottom: 8,
          }}>
            Sandbox Submission
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.6 }}>
            Upload suspicious files, URLs, or hashes for dynamic analysis in an isolated environment.
          </p>
        </div>

        {/* Systems status badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
          padding: '7px 14px', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--surface2)',
          fontSize: 12, color: 'var(--text3)',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Systems Operational
        </div>
      </div>

      {bannerError && (
        <div className="home-error-banner fade-up" role="alert">{bannerError}</div>
      )}

      {/* Submit form */}
      <div className="fade-scale delay-1" style={{ marginBottom: 48 }}>
        <SubmitForm />
      </div>

      {/* Recent Activity */}
      <div className="fade-up delay-2">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22, fontWeight: 500, color: 'var(--text)',
          }}>
            Recent Activity
          </h2>
          <button
            onClick={() => navigate('/public')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'transparent', border: 'none',
              color: 'var(--amber)', fontSize: 12, fontWeight: 500,
              fontFamily: 'var(--font-ui)', cursor: 'pointer',
              transition: 'all 0.15s', padding: '4px 0',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
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
          /* Empty state with mock rows to show layout */
          <div style={{
            border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            overflow: 'hidden', background: 'var(--surface)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid var(--border)' }}>
                  {['Target', 'Type', 'Environment', 'Score', 'Status', 'Time'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: 12, fontWeight: 600, color: 'var(--text3)',
                      letterSpacing: '0.02em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text4)', fontSize: 13 }}>
                    No recent submissions yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            overflow: 'hidden', background: 'var(--surface)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid var(--border)' }}>
                  {['Target', 'Type', 'Environment', 'Score', 'Status', 'Time'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: 12, fontWeight: 600, color: 'var(--text3)',
                      letterSpacing: '0.02em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((sample, i) => {
                  const score = sample.threat_score || 0;
                  const scoreColor = score > 70 ? 'var(--red)' : score > 40 ? 'var(--amber)' : 'var(--green)';
                  return (
                    <tr
                      key={sample.id}
                      onClick={() => navigate('/analysis/' + sample.id)}
                      style={{
                        borderBottom: i < recent.length - 1 ? '1px solid rgba(217,119,6,0.06)' : 'none',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>
                        {sample.original_filename}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text3)', fontSize: 12 }}>
                        {sample.file_type || '—'}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text3)', fontSize: 12 }}>
                        {sample.os || 'Windows 10 x64'}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        {score > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 56, height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${score}%`, height: '100%', background: scoreColor, borderRadius: 2 }} />
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{score}/100</span>
                          </div>
                        ) : <span style={{ color: 'var(--text4)' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <VerdictTag verdict={sample.verdict} />
                      </td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text4)' }}>
                        {formatTime(sample.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats row */}
        {stats && (
          <div className="fade-up delay-3" style={{
            display: 'flex', gap: 20, marginTop: 24,
            padding: '16px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}>
            {[
              { label: 'Total Analyses', value: stats.total_analyses?.toLocaleString() },
              { label: 'Malicious Rate', value: stats.malicious_rate + '%' },
              { label: 'Today',          value: stats.today?.toLocaleString() },
              { label: 'Avg. Duration',  value: '~45s' },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                flex: 1, textAlign: 'center', position: 'relative',
              }}>
                {i > 0 && (
                  <div style={{
                    position: 'absolute', left: -10, top: '10%', bottom: '10%',
                    width: 1, background: 'var(--border)',
                  }} />
                )}
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700,
                  color: 'var(--amber)', marginBottom: 3,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
