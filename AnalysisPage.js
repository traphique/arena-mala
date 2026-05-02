import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, createWebSocket } from './clientApi';
import { EmptyState, Panel, ProtocolBadge, ScoreRing, Spinner, TabBar, VerdictTag } from './UI';
import { formatBytes, formatDuration, formatTimestamp } from './helpers';

function MetaChip({ label, children }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '12px 16px',
    }}>
      <div style={{
        fontSize: 10, color: 'var(--text4)',
        letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text)' }}>{children}</div>
    </div>
  );
}

function Overview({ analysis }) {
  if (!analysis) return null;
  return (
    <div className="analysis-overview-grid">
      {[
        ['Verdict',      <VerdictTag verdict={analysis.verdict} size="lg" />],
        ['Threat Score', <ScoreRing score={analysis.threat_score ?? 0} size={52} />],
        ['Duration',     <span style={{ fontWeight: 600, fontSize: 14 }}>{formatDuration(analysis.duration_sec)}</span>],
        ['OS',           <span style={{ fontWeight: 500, fontSize: 13 }}>{analysis.os || 'Windows 10 x64'}</span>],
        ['Network',      <span style={{ fontWeight: 500, fontSize: 13 }}>{analysis.network_mode || 'simulated'}</span>],
        ['File',         <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}>{analysis.original_filename}</span>],
      ].map(([label, value], i) => (
        <MetaChip key={label} label={label}>
          <div className="fade-scale" style={{ animationDelay: `${i * 0.05}s` }}>{value}</div>
        </MetaChip>
      ))}
    </div>
  );
}

export default function AnalysisPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [analysis, setAnalysis]   = useState(null);
  const [full, setFull]           = useState(null);
  const [status, setStatus]       = useState({ state: 'queued', progress: 0, status: 'Queued' });
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [wsReconnecting, setWsReconnecting] = useState(false);
  const hadWsOpen = useRef(false);

  useEffect(() => {
    let mounted = true;
    let ws = null;
    let reconnectTimer = null;
    let attempt = 0;
    hadWsOpen.current = false;
    setWsReconnecting(false);

    const connectWs = () => {
      if (!mounted) return;
      ws = createWebSocket(id, {
        status: s => { if (mounted) setStatus(s); },
        analysis: a => { if (mounted) setAnalysis(a); },
        report: r => { if (mounted) setFull(r); },
        onOpen: () => {
          if (!mounted) return;
          attempt = 0; hadWsOpen.current = true; setWsReconnecting(false);
        },
        onClose: () => {
          if (!mounted) return;
          if (hadWsOpen.current) setWsReconnecting(true);
          attempt += 1;
          const delay = Math.min(25000, 750 * Math.pow(2, Math.min(attempt, 5)));
          reconnectTimer = setTimeout(() => { reconnectTimer = null; if (mounted) connectWs(); }, delay);
        },
      });
    };

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
    connectWs();
    const poll = setInterval(async () => {
      try {
        const [a, s] = await Promise.all([api.getAnalysis(id), api.getStatus(id)]);
        if (!mounted) return;
        setAnalysis(a); setStatus(s);
        if (s.state === 'completed' || s.state === 'static-only') {
          const f = await api.getFullAnalysis(id);
          if (mounted) setFull(f);
        }
      } catch (_) {}
    }, 5000);
    return () => {
      mounted = false;
      clearInterval(poll);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [id]);

  const timeline = full?.timeline || [];
  const network  = full?.network  || [];
  const iocs     = full?.iocs     || [];

  const tabBody = useMemo(() => {
    if (activeTab === 'timeline') {
      if (!timeline.length) return <EmptyState message="No timeline events yet" sub="Events appear as the analysis progresses" />;
      return (
        <div style={{ padding: '8px 0' }}>
          {timeline.map((evt, idx) => (
            <div key={`${evt.timestamp}-${idx}`} className="fade-up" style={{
              display: 'flex', gap: 14, padding: '10px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              animationDelay: `${idx * 0.025}s`,
            }}>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 5 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--blue)', flexShrink: 0, zIndex: 1,
                }} />
                {idx < timeline.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.06)', marginTop: 4 }} />
                )}
              </div>
              <div style={{ flex: 1, paddingBottom: 6 }}>
                <div style={{ fontSize: 10, color: 'var(--text4)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
                  +{formatTimestamp(evt.timestamp)}
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: 'var(--text)' }}>{evt.title}</div>
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
        <div>
          {/* Column headers */}
          <div className="network-row-grid" style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            {['Time', 'Protocol', 'Host / IP', 'Port'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          {network.map((row, idx) => (
            <div key={`${row.timestamp}-${idx}`} className="fade-up network-row-grid" style={{
              padding: '9px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              animationDelay: `${idx * 0.025}s`,
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text4)', fontSize: 11 }}>+{formatTimestamp(row.timestamp)}</span>
              <ProtocolBadge protocol={row.protocol} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.hostname || row.dst_ip || '—'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>{row.dst_port || '—'}</span>
            </div>
          ))}
        </div>
      );
    }

    if (!iocs.length) return <EmptyState message="No IOCs extracted yet" sub="Indicators appear after analysis completes" />;
    return (
      <div>
        <div className="ioc-row-grid" style={{
          padding: '8px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          {['Type', 'Value', 'Conf.'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>
        {iocs.map((ioc, idx) => (
          <div key={`${ioc.value}-${idx}`} className="fade-up ioc-row-grid" style={{
            padding: '9px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            animationDelay: `${idx * 0.025}s`,
          }}>
            <span style={{
              color: 'var(--text4)', textTransform: 'uppercase', fontSize: 9,
              fontWeight: 700, letterSpacing: '0.05em',
              background: 'rgba(255,255,255,0.04)', padding: '3px 7px', borderRadius: 4,
              textAlign: 'center', fontFamily: 'var(--font-mono)',
            }}>
              {ioc.type}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ioc.value}</span>
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
      <div className="fade-scale" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Spinner size={26} />
        <span style={{ color: 'var(--text3)', fontSize: 13 }}>Loading analysis...</span>
      </div>
    </div>
  );

  if (!analysis) return (
    <div style={{ flex: 1 }}><EmptyState message="Analysis not found" sub="Try submitting a new sample from the dashboard." /></div>
  );

  const STATE_COLOR = {
    completed: 'var(--green)', running: 'var(--blue)',
    'static-only': 'var(--cyan)', queued: 'var(--text4)', failed: 'var(--red)',
  };
  const stateColor = STATE_COLOR[status.state] || 'var(--text3)';

  return (
    <div className="page-padding-main" style={{ flex: 1, overflowY: 'auto' }}>

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="fade-in"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginBottom: 20,
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '6px 12px',
          color: 'var(--text3)', fontSize: 12, fontWeight: 500,
          fontFamily: 'var(--font-ui)', cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text3)'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Dashboard
      </button>

      {/* Header card */}
      <div className="fade-scale" style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {analysis.original_filename}
            </h2>
            <div style={{ fontSize: 11, color: 'var(--text4)', fontFamily: 'var(--font-mono)' }}>
              {analysis.file_type} · {formatBytes(analysis.file_size)} · ID: {id}
            </div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
            padding: '6px 14px', borderRadius: 'var(--radius)',
            border: `1px solid ${stateColor}20`,
            background: `${stateColor}0d`,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: stateColor,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: stateColor,
              animation: status.state === 'running' ? 'pulse 1.8s ease-in-out infinite' : 'none',
              flexShrink: 0,
            }} />
            {status.state}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${status.progress || 0}%`, height: '100%',
            background: stateColor, borderRadius: 3,
            transition: 'width 0.7s cubic-bezier(0.22, 0.68, 0, 1)',
            animation: status.state === 'running' ? 'progressPulse 2s ease-in-out infinite' : 'none',
          }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
          {status.progress || 0}% — {status.status || 'Waiting'}
        </div>

        {wsReconnecting && !['completed', 'failed', 'static-only'].includes(status.state) && (
          <div className="analysis-live-banner" role="status">
            <Spinner size={13} color="var(--orange)" />
            Reconnecting to live feed… polling every 5s.
          </div>
        )}
      </div>

      {/* Overview grid */}
      <div className="fade-up delay-2" style={{ marginBottom: 12 }}>
        <Overview analysis={analysis} />
      </div>

      {/* Behavioral data panel */}
      <div className="fade-up delay-3">
        <Panel title="Behavioral Data" bodyStyle={{ maxHeight: 440 }}>
          <TabBar
            active={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'timeline', label: 'Timeline', count: timeline.length },
              { id: 'network',  label: 'Network',  count: network.length  },
              { id: 'iocs',     label: 'IOCs',     count: iocs.length     },
            ]}
          />
          {tabBody}
        </Panel>
      </div>
    </div>
  );
}
