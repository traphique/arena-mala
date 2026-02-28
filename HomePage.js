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

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
    api.getRecentSamples(8).then(r => { setRecent(r); setLoadingRecent(false); }).catch(() => setLoadingRecent(false));
  }, []);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '48px 48px 80px' }}>
      {/* Hero */}
      <div className="fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="fade-scale" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '6px 16px', borderRadius: 999,
          background: 'var(--accent-dim)', color: 'var(--accent)',
          fontSize: 12, fontWeight: 600, marginBottom: 24,
          border: '1px solid rgba(212,148,60,0.1)',
          backdropFilter: 'blur(8px)',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L22 12L12 22L2 12Z"/>
            <path d="M12 7L10.5 11L13.5 13L12 17"/>
          </svg>
          Malware Analysis Sandbox
        </div>
        <h1 className="fade-up delay-1" style={{
          fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 52,
          letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 18,
        }}>
          Detonate & Analyze{' '}
          <span style={{
            background: 'linear-gradient(135deg, #e0a040, #d4943c, #c07c28)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Threats
          </span>
        </h1>
        <p className="fade-up delay-2" style={{
          color: 'var(--text2)', maxWidth: 520, margin: '0 auto',
          fontSize: 16, lineHeight: 1.7,
        }}>
          Submit files or URLs to execute in isolated VMs. Monitor behavior, intercept
          network traffic, and extract threat intelligence in real time.
        </p>
      </div>

      {/* Submit form */}
      <div className="fade-scale delay-3" style={{ display: 'flex', justifyContent: 'center', marginBottom: 52 }}>
        <SubmitForm />
      </div>

      {/* Stats */}
      {stats && (
        <div className="fade-up delay-4" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14, maxWidth: 720, margin: '0 auto 52px',
        }}>
          {[
            { label: 'Total Analyses', value: stats.total_analyses?.toLocaleString(), color: 'var(--accent)' },
            { label: 'Malicious Rate', value: stats.malicious_rate + '%', color: 'var(--red)' },
            { label: 'Today', value: stats.today?.toLocaleString(), color: 'var(--purple)' },
            { label: 'Avg. Analysis', value: '~45s', color: 'var(--green2)' },
          ].map((stat, i) => (
            <div key={stat.label} className="glass gradient-border" style={{
              padding: '20px 16px', textAlign: 'center',
              cursor: 'default',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${stat.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                transition: 'transform 0.3s',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stat.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={STAT_ICONS[stat.label]} />
                </svg>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800,
                color: stat.color, marginBottom: 4,
                textShadow: `0 0 20px ${stat.color}30`,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 11, color: 'var(--text3)', letterSpacing: '0.06em',
                textTransform: 'uppercase', fontWeight: 600,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent samples */}
      <div className="fade-up delay-5" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text3)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Recent Public Submissions
          </div>
          <button
            onClick={() => navigate('/public')}
            style={{
              background: 'rgba(200,170,120,0.06)', border: '1px solid rgba(200,170,120,0.08)',
              color: 'var(--accent)', fontSize: 12,
              cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 8,
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.borderColor = 'rgba(212,148,60,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,170,120,0.06)'; e.currentTarget.style.borderColor = 'rgba(200,170,120,0.08)'; }}
          >
            View all
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {loadingRecent ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        ) : (
          <div className="glass" style={{ overflow: 'hidden', padding: 0 }}>
            {recent.map((sample, i) => (
              <div
                key={sample.id}
                onClick={() => navigate('/analysis/' + sample.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 18px',
                  borderBottom: i < recent.length - 1 ? '1px solid rgba(200,170,120,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.22, 0.68, 0, 1)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,170,120,0.04)'; e.currentTarget.style.paddingLeft = '22px'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '18px'; }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(200,170,120,0.06)', border: '1px solid rgba(200,170,120,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, flexShrink: 0,
                  transition: 'transform 0.2s',
                }}>
                  {fileIcon(sample.original_filename, sample.file_type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sample.original_filename}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                    {sample.file_type || 'Unknown'} · {formatBytes(sample.file_size)} · {formatTime(sample.created_at)}
                  </div>
                </div>
                {sample.malware_family && (
                  <div style={{
                    fontSize: 10, color: 'var(--text2)', fontFamily: 'var(--font-mono)',
                    flexShrink: 0, maxWidth: 140, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    background: 'rgba(200,170,120,0.06)', padding: '4px 10px', borderRadius: 8,
                    border: '1px solid rgba(200,170,120,0.06)',
                  }}>
                    {sample.malware_family}
                  </div>
                )}
                {sample.threat_score > 0 && (
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, flexShrink: 0,
                    color: sample.threat_score >= 70 ? 'var(--red)' : sample.threat_score >= 30 ? 'var(--orange)' : 'var(--yellow)',
                    textShadow: `0 0 12px ${sample.threat_score >= 70 ? 'rgba(239,83,80,0.3)' : sample.threat_score >= 30 ? 'rgba(255,152,0,0.3)' : 'rgba(255,193,7,0.2)'}`,
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
