import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './clientApi';
import SubmitForm from './SubmitForm';
import { VerdictTag, Spinner } from './UI';
import { formatTime, formatBytes, fileIcon } from './helpers';
import { Card } from './components/ui/card.js';
import { Button } from './components/ui/button.js';

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
  const [bannerError, setBannerError] = useState(null);
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
      <div className="fade-up mb-12 text-center">
        <div
          className="fade-scale mx-auto inline-flex items-center gap-2 rounded-full border border-[rgba(212,148,60,0.10)] bg-[var(--accent-dim)] px-4 py-1.5 text-xs font-semibold text-[var(--accent)]"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L22 12L12 22L2 12Z"/>
            <path d="M12 7L10.5 11L13.5 13L12 17"/>
          </svg>
          Malware Analysis Sandbox
        </div>
        <h1
          className="fade-up delay-1 home-hero-title mb-4 font-extrabold tracking-[-0.03em]"
          style={{ fontFamily: 'var(--font-ui)', lineHeight: 1.08 }}
        >
          Detonate & Analyze{' '}
          <span style={{
            background: 'linear-gradient(135deg, #e0a040, #d4943c, #c07c28)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Threats
          </span>
        </h1>
        <p className="fade-up delay-2 mx-auto max-w-[520px] text-[16px] leading-[1.7] text-[var(--text2)]">
          Submit files or URLs to execute in isolated VMs. Monitor behavior, intercept
          network traffic, and extract threat intelligence in real time.
        </p>
      </div>

      {bannerError && (
        <div className="home-error-banner fade-up" role="alert">
          {bannerError}
        </div>
      )}

      {/* Submit form */}
      <div className="fade-scale delay-3 mb-[52px] flex justify-center">
        <SubmitForm />
      </div>

      {/* Stats */}
      {stats && (
        <div className="fade-up delay-4 home-stats-grid">
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
      <div className="fade-up delay-5 mx-auto max-w-[720px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text3)]">
            Recent Public Submissions
          </div>
          <Button
            onClick={() => navigate('/public')}
            variant="glass"
            size="sm"
            className="font-semibold"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            View all
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Button>
        </div>

        {loadingRecent ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        ) : (
          <Card className="overflow-hidden p-0">
            {recent.map((sample, i) => (
              <div
                key={sample.id}
                onClick={() => navigate('/analysis/' + sample.id)}
                className={[
                  'flex cursor-pointer items-center gap-3.5 px-[18px] py-3.5 transition-all',
                  i < recent.length - 1 ? 'border-b border-[rgba(200,170,120,0.06)]' : '',
                  'hover:bg-[rgba(200,170,120,0.04)] hover:pl-[22px]',
                ].join(' ')}
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
          </Card>
        )}
      </div>
    </div>
  );
}
