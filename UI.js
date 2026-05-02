import React from 'react';
import { verdictColor, verdictBg, severityColor, severityBg, protocolColor, protocolBg } from './helpers';

export function VerdictTag({ verdict, size = 'sm' }) {
  if (!verdict) return null;
  const fs = size === 'lg' ? 11 : 10;
  const px = size === 'lg' ? '4px 12px' : '3px 8px';
  const color = verdictColor(verdict);
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: 'var(--font-mono)', fontSize: fs,
      fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: px, borderRadius: 5,
      color, background: verdictBg(verdict),
      border: `1px solid ${color}25`,
      whiteSpace: 'nowrap',
    }}>
      {verdict}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  if (!severity) return null;
  const color = severityColor(severity);
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 5,
      color, background: severityBg(severity),
    }}>
      {severity}
    </span>
  );
}

export function ProtocolBadge({ protocol }) {
  if (!protocol) return null;
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 5,
      color: protocolColor(protocol), background: protocolBg(protocol),
    }}>
      {protocol}
    </span>
  );
}

export function Panel({ title, dot, dotColor = 'var(--green)', right, children, style = {}, bodyStyle = {} }) {
  return (
    <div className="glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', ...style }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', flexShrink: 0,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, fontWeight: 600, letterSpacing: '0.01em',
          color: 'var(--text)',
        }}>
          {dot !== false && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: dotColor,
              animation: 'pulse 2.5s ease-in-out infinite',
              flexShrink: 0,
            }} />
          )}
          {title}
        </div>
        {right && <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{right}</div>}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 0,
      borderBottom: '1px solid var(--border)',
      padding: '0 12px', flexShrink: 0,
      background: 'rgba(255,255,255,0.01)',
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              background: 'none', border: 'none',
              padding: '10px 14px',
              fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text)' : 'var(--text3)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 7,
              whiteSpace: 'nowrap', position: 'relative',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text2)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text3)'; }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                background: isActive ? 'rgba(217,119,6,0.12)' : 'rgba(255,255,255,0.05)',
                color: isActive ? 'var(--amber)' : 'var(--text4)',
                padding: '1px 7px', borderRadius: 4,
              }}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <span style={{
                position: 'absolute', bottom: -1, left: '10%', right: '10%',
                height: 2, borderRadius: '2px 2px 0 0',
                background: 'var(--amber)',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ScoreRing({ score = 0, size = 80 }) {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(score, 100) / 100);
  const color = score >= 70 ? 'var(--red)' : score >= 30 ? 'var(--orange)' : 'var(--green)';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={4} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke={color} strokeWidth={4} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22, 0.68, 0, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: size > 70 ? 18 : 13,
        fontWeight: 800, color,
      }}>
        {score}
      </div>
    </div>
  );
}

export function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={copy} style={{
      background: copied ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
      border: '1px solid ' + (copied ? 'rgba(34,197,94,0.15)' : 'var(--border)'),
      color: copied ? 'var(--green)' : 'var(--text4)',
      cursor: 'pointer', fontSize: 11, padding: '3px 8px',
      borderRadius: 6, transition: 'all 0.2s',
      fontFamily: 'var(--font-mono)',
      display: 'flex', alignItems: 'center', gap: 4,
    }}>
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      )}
    </button>
  );
}

export function Spinner({ size = 18, color = 'var(--amber)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(255,255,255,0.08)`,
      borderTopColor: color, borderRadius: '50%',
      animation: 'spin 0.65s linear infinite',
      flexShrink: 0,
    }} />
  );
}

export function EmptyState({ icon, message = 'No data', sub }) {
  return (
    <div className="fade-scale" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 48, gap: 8, color: 'var(--text3)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
      }}>
        {icon ? (
          <span style={{ fontSize: 22 }}>{icon}</span>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M8 15h8M9 9h.01M15 9h.01"/>
          </svg>
        )}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>{message}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text4)' }}>{sub}</div>}
    </div>
  );
}

export function MonoValue({ children, color, style = {} }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 11,
      color: color || 'var(--text)', wordBreak: 'break-all',
      ...style,
    }}>
      {children}
    </span>
  );
}

export function TagList({ tags = [], max = 8 }) {
  const visible = tags.slice(0, max);
  const rest = tags.length - max;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {visible.map((tag, i) => (
        <span key={i} style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          padding: '3px 9px', borderRadius: 5,
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
          color: 'var(--text3)',
        }}>
          {tag}
        </span>
      ))}
      {rest > 0 && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          padding: '3px 9px', borderRadius: 5,
          background: 'rgba(255,255,255,0.02)', color: 'var(--text4)',
        }}>
          +{rest}
        </span>
      )}
    </div>
  );
}

export function InfoRow({ label, value, mono }) {
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
    }}>
      <span style={{
        width: 120, flexShrink: 0, fontSize: 11, color: 'var(--text4)',
        fontWeight: 500, paddingTop: 1,
      }}>
        {label}
      </span>
      <span style={{
        flex: 1, fontSize: 12, color: 'var(--text)',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
        wordBreak: 'break-all',
      }}>
        {value ?? '—'}
      </span>
    </div>
  );
}
