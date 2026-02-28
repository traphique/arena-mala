import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, createWebSocket } from './clientApi';
import { EmptyState, Panel, ProtocolBadge, ScoreRing, Spinner, TabBar, VerdictTag } from './UI';
import { formatBytes, formatDuration, formatTimestamp } from './helpers';

function Overview({ analysis }) {
  if (!analysis) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
      {[
        ['Verdict', <VerdictTag verdict={analysis.verdict} size="lg" />],
        ['Threat Score', <ScoreRing score={analysis.threat_score ?? 0} size={56} />],
        ['Duration', <span style={{ fontWeight: 600, fontSize: 15 }}>{formatDuration(analysis.duration_sec)}</span>],
        ['OS', <span style={{ fontWeight: 600 }}>{analysis.os || 'Windows 10 x64'}</span>],
        ['Network', <span style={{ fontWeight: 600 }}>{analysis.network_mode || 'simulated'}</span>],
        ['File', <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{analysis.original_filename}</span>],
      ].map(([label, value], i) => (
        <div key={label} className="fade-scale glass gradient-border" style={{
          padding: '16px 18px', animationDelay: `${i * 0.06}s`,
        }}>
          <div style={{
            fontSize: 10, color: 'var(--text4)', marginBottom: 10,
            letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700,
          }}>
            {label}
          </div>
          <div style={{ fontSize: 13 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

export default function AnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [full, setFull] = useState(null);
  const [status, setStatus] = useState({ state: 'queued', progress: 0, status: 'Queued' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    let mounted = true;
    let ws;
    const load = async () => {
      try {
        const [a, f, s] = await Promise.all([
          api.getAnalysis(id),
          api.getFullAnalysis(id).catch(() => null),
          api.getStatus(id).catch(() => null),
        ]);
        if (!mounted) return;
        setAnalysis(a); if (f) setFull(f); if (s) setStatus(s);
      } finally { if (mounted) setLoading(false); }
    };
    load();
    ws = createWebSocket(id, {
      status: s => setStatus(s), analysis: a => setAnalysis(a), report: r => setFull(r),
    });
    const poll = setInterval(async () => {
      try {
        const [a, s] = await Promise.all([api.getAnalysis(id), api.getStatus(id)]);
        if (!mounted) return;
        setAnalysis(a); setStatus(s);
        if (s.state === 'completed') { const f = await api.getFullAnalysis(id); if (mounted) setFull(f); }
      } catch (_) {}
    }, 5000);
    return () => { mounted = false; clearInterval(poll); if (ws && ws.readyState < 2) ws.close(); };
  }, [id]);

  const timeline = full?.timeline || [];
  const network = full?.network || [];
  const iocs = full?.iocs || [];

  const tabBody = useMemo(() => {
    if (activeTab === 'timeline') {
      if (!timeline.length) return <EmptyState message="No timeline events yet" sub="Events appear as the analysis progresses" />;
      return (
        <div style={{ padding: 16 }}>
          {timeline.map((evt, idx) => (
            <div key={`${evt.timestamp}-${idx}`} className="fade-up" style={{
              display: 'flex', gap: 14, padding: '12px 0',
              borderBottom: '1px solid rgba(200,170,120,0.04)',
              animationDelay: `${idx * 0.03}s`,
            }}>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'var(--accent)', boxShadow: '0 0 10px rgba(212,148,60,0.3)',
                  flexShrink: 0, zIndex: 1,
                }} />
                {idx < timeline.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: 'rgba(200,170,120,0.08)', marginTop: 4 }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'var(--text4)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>+{formatTimestamp(evt.timestamp)}</div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{evt.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{evt.detail}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (activeTab === 'network') {
      if (!network.length) return <EmptyState message="No network events yet" sub="Network activity captured during analysis" />;
      return (
        <div style={{ padding: 16 }}>
          {network.map((row, idx) => (
            <div key={`${row.timestamp}-${idx}`} className="fade-up" style={{
              display: 'grid', gridTemplateColumns: '70px 80px 1fr 60px',
              gap: 10, borderBottom: '1px solid rgba(200,170,120,0.04)', padding: '10px 0',
              alignItems: 'center', animationDelay: `${idx * 0.03}s`,
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text4)', fontSize: 11 }}>+{formatTimestamp(row.timestamp)}</span>
              <ProtocolBadge protocol={row.protocol} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.hostname || row.dst_ip || '—'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>{row.dst_port || '—'}</span>
            </div>
          ))}
        </div>
      );
    }
    if (!iocs.length) return <EmptyState message="No IOCs extracted yet" sub="Indicators appear after analysis completes" />;
    return (
      <div style={{ padding: 16 }}>
        {iocs.map((ioc, idx) => (
          <div key={`${ioc.value}-${idx}`} className="fade-up" style={{
            display: 'grid', gridTemplateColumns: '90px 1fr 70px',
            gap: 10, borderBottom: '1px solid rgba(200,170,120,0.04)', padding: '10px 0',
            alignItems: 'center', animationDelay: `${idx * 0.03}s`,
          }}>
            <span style={{
              color: 'var(--text4)', textTransform: 'uppercase', fontSize: 9,
              fontWeight: 700, letterSpacing: '0.06em',
              background: 'rgba(200,170,120,0.06)', padding: '3px 8px', borderRadius: 6,
              textAlign: 'center',
            }}>
              {ioc.type}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{ioc.value}</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, textAlign: 'right',
              color: ioc.confidence >= 80 ? 'var(--red)' : ioc.confidence >= 50 ? 'var(--orange)' : 'var(--text3)',
            }}>
              {ioc.confidence}%
            </span>
          </div>
        ))}
      </div>
    );
  }, [activeTab, iocs, network, timeline]);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="fade-scale" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Spinner size={28} />
        <span style={{ color: 'var(--text3)', fontSize: 13 }}>Loading analysis...</span>
      </div>
    </div>
  );

  if (!analysis) return (
    <div style={{ flex: 1 }}><EmptyState message="Analysis not found" sub="Try submitting a new sample from the dashboard." /></div>
  );

  const stateGlows = { completed: 'var(--green2)', running: 'var(--accent)', queued: 'var(--text4)', failed: 'var(--red)' };
  const stateColor = stateGlows[status.state] || 'var(--text3)';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 80px' }}>
      <button
        onClick={() => navigate('/')}
        className="fade-in"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(200,170,120,0.04)', border: '1px solid rgba(200,170,120,0.06)',
          color: 'var(--text3)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12,
          fontWeight: 600, marginBottom: 22, padding: '6px 14px', borderRadius: 8,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(200,170,120,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'rgba(200,170,120,0.04)'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Dashboard
      </button>

      {/* Header card */}
      <div className="glass fade-scale" style={{ padding: '22px 26px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>
              {analysis.original_filename}
            </h2>
            <div style={{ color: 'var(--text4)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              {analysis.file_type} · {formatBytes(analysis.file_size)} · {id}
            </div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 14px', borderRadius: 10,
            background: `${stateColor}10`,
            border: `1px solid ${stateColor}15`,
            color: stateColor,
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: stateColor,
              animation: status.state === 'running' ? 'pulse 1.8s ease-in-out infinite' : 'none',
              boxShadow: `0 0 8px ${stateColor}60`,
            }} />
            {status.state}
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: 6, background: 'rgba(200,170,120,0.06)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            width: `${status.progress || 0}%`, height: '100%',
            background: 'linear-gradient(90deg, var(--accent2), var(--accent), var(--warm))',
            borderRadius: 4,
            transition: 'width 0.8s cubic-bezier(0.22, 0.68, 0, 1)',
            boxShadow: '0 0 16px rgba(212,148,60,0.3)',
            animation: status.state === 'running' ? 'progressPulse 2s ease-in-out infinite' : 'none',
          }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
          {status.progress || 0}% complete
        </div>
      </div>

      <div className="fade-up delay-2" style={{ marginBottom: 16 }}>
        <Overview analysis={analysis} />
      </div>

      <div className="fade-up delay-3">
        <Panel
          title="Behavioral Data"
          bodyStyle={{ maxHeight: 440 }}
        >
          <TabBar
            active={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'timeline', label: 'Timeline', count: timeline.length },
              { id: 'network', label: 'Network', count: network.length },
              { id: 'iocs', label: 'IOCs', count: iocs.length },
            ]}
          />
          {tabBody}
        </Panel>
      </div>
    </div>
  );
}
