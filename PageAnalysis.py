import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, createWebSocket } from '../utils/api';
import {
  Panel, TabBar, ScoreRing, VerdictTag, SeverityBadge,
  ProtocolBadge, Spinner, EmptyState, CopyButton, MonoValue, TagList, InfoRow
} from '../components/UI';
import {
  formatBytes, formatTime, formatTimestamp, fileIcon, iocIcon,
  severityColor, severityBg, verdictColor, protocolColor
} from '../utils/helpers';

// ─────────────────────────────────────────────
// SCANNING VIEW
// ─────────────────────────────────────────────
function ScanningView({ progress, status, filename }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 28,
    }}>
      {/* Triple spinner */}
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            position: 'absolute',
            inset: i * 14,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: ['var(--cyan)', 'var(--purple)', 'var(--green2)'][i],
            animation: `spin ${[1.4, 0.9, 2.0][i]}s linear infinite ${i === 1 ? 'reverse' : ''}`,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>
          🦠
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Analyzing Sample</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{filename}</div>
      </div>

      <div style={{ width: 320 }}>
        <div style={{
          height: 4, background: 'var(--bg4)', borderRadius: 2,
          overflow: 'hidden', marginBottom: 10,
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, var(--purple), var(--cyan))',
            width: progress + '%', transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{
          textAlign: 'center', fontSize: 12,
          color: 'var(--text2)', fontFamily: 'var(--font-mono)',
        }}>
          {status || 'Initializing...'}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PROCESS TREE
// ─────────────────────────────────────────────
function ProcessTree({ processes }) {
  const [selected, setSelected] = useState(null);
  if (!processes?.length) return <EmptyState icon="⚙" message="No processes" />;

  const statusColor = { malicious: 'var(--red)', suspicious: 'var(--orange)', ok: 'var(--green2)' };
  const statusBg = { malicious: 'var(--red-dim)', suspicious: 'var(--orange-dim)', ok: 'var(--green-dim)' };
  const statusLabel = { malicious: 'MAL', suspicious: 'SUS', ok: 'OK' };

  const sorted = [...processes].sort((a, b) => (a.start_time || 0) - (b.start_time || 0));

  // Build tree structure
  const byPid = {};
  sorted.forEach(p => { byPid[p.pid] = p; });

  const roots = sorted.filter(p => !p.parent_pid || !byPid[p.parent_pid]);
  const children = {};
  sorted.forEach(p => {
    if (p.parent_pid && byPid[p.parent_pid]) {
      if (!children[p.parent_pid]) children[p.parent_pid] = [];
      children[p.parent_pid].push(p);
    }
  });

  function renderNode(proc, depth = 0) {
    const isSelected = selected === proc.pid;
    const hasChildren = children[proc.pid]?.length > 0;

    return (
      <div key={proc.pid}>
        <div
          onClick={() => setSelected(isSelected ? null : proc.pid)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 8px',
            paddingLeft: (8 + depth * 18) + 'px',
            borderRadius: 4, cursor: 'pointer',
            background: isSelected ? 'var(--cyan-dim)' : 'none',
            border: isSelected ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
            marginBottom: 1, transition: 'background 0.1s',
            borderLeft: depth > 0 ? `2px solid ${statusColor[proc.status] || 'var(--border2)'}` : undefined,
          }}
          onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'var(--bg4)')}
          onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'none')}
        >
          {depth > 0 && (
            <span style={{ color: 'var(--text3)', fontSize: 10, flexShrink: 0 }}>└</span>
          )}
          <span style={{ fontSize: 13, flexShrink: 0 }}>
            {proc.name?.includes('powershell') ? '💙' :
             proc.name?.includes('cmd') ? '💻' :
             proc.name?.includes('schtasks') ? '📅' :
             proc.name?.includes('regsvr') ? '📋' :
             proc.name?.includes('wscript') ? '📜' :
             proc.name?.includes('mshta') ? '🌐' :
             proc.injected ? '💉' : '⚙'}
          </span>
          <span style={{
            flex: 1, fontSize: 12, fontFamily: 'var(--font-mono)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: proc.status === 'malicious' ? 'var(--red)' : proc.status === 'suspicious' ? 'var(--orange)' : 'var(--text)',
          }}>
            {proc.name}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text3)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
            {proc.pid}
          </span>
          {proc.injected ? (
            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 2, background: 'var(--purple-dim)', color: 'var(--purple)', flexShrink: 0 }}>
              INJ
            </span>
          ) : (
            <span style={{
              fontSize: 9, padding: '1px 5px', borderRadius: 2, flexShrink: 0,
              background: statusBg[proc.status] || 'var(--bg4)',
              color: statusColor[proc.status] || 'var(--text3)',
            }}>
              {statusLabel[proc.status] || '?'}
            </span>
          )}
        </div>
        {/* CMD hint on select */}
        {isSelected && proc.cmdline && (
          <div style={{
            marginLeft: (16 + depth * 18) + 'px', marginBottom: 4,
            padding: '6px 10px', borderRadius: 4,
            background: 'var(--bg3)', border: '1px solid var(--border)',
            fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text2)',
            wordBreak: 'break-all',
          }}>
            <span style={{ color: 'var(--text3)' }}>$ </span>{proc.cmdline}
          </div>
        )}
        {hasChildren && children[proc.pid].map(child => renderNode(child, depth + 1))}
      </div>
    );
  }

  return (
    <div style={{ padding: '8px' }}>
      {roots.map(r => renderNode(r, 0))}
    </div>
  );
}

// ─────────────────────────────────────────────
// TIMELINE
// ─────────────────────────────────────────────
function Timeline({ events }) {
  if (!events?.length) return <EmptyState icon="⏱" message="No events yet" sub="Waiting for analysis..." />;

  return (
    <div style={{ padding: '0 8px' }}>
      {events.map((evt, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '8px 6px', borderBottom: '1px solid var(--border)',
          cursor: 'default', transition: 'background 0.1s',
          animationDelay: (i * 0.04) + 's',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <div style={{ width: 44, color: 'var(--text3)', fontSize: 10, fontFamily: 'var(--font-mono)', flexShrink: 0, paddingTop: 2 }}>
            +{formatTimestamp(evt.timestamp)}
          </div>
          <div style={{
            width: 24, height: 24, borderRadius: 5, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, background: severityBg(evt.severity),
          }}>
            {evt.icon || '•'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{evt.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {evt.detail}
            </div>
            {evt.mitre_id && (
              <div style={{ marginTop: 3, display: 'flex', gap: 6 }}>
                <span style={{
                  fontSize: 9, padding: '1px 6px', borderRadius: 3,
                  background: 'var(--purple-dim)', color: 'var(--purple)',
                  fontFamily: 'var(--font-mono)', fontWeight: 600,
                }}>
                  {evt.mitre_id}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{evt.mitre_name}</span>
              </div>
            )}
          </div>
          <SeverityBadge severity={evt.severity} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// NETWORK TABLE
// ─────────────────────────────────────────────
function NetworkTable({ events }) {
  if (!events?.length) return <EmptyState icon="🌐" message="No network activity" />;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
      <thead>
        <tr>
          {['Time','Protocol','Destination','Port','Info','Threat'].map(h => (
            <th key={h} style={{
              padding: '7px 10px', textAlign: 'left', position: 'sticky', top: 0,
              background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
              fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em',
              textTransform: 'uppercase', fontFamily: 'var(--font-ui)', fontWeight: 700,
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {events.map((n, i) => (
          <tr key={i}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <td style={{ padding: '6px 10px', color: 'var(--text3)' }}>+{formatTimestamp(n.timestamp)}</td>
            <td style={{ padding: '6px 10px' }}><ProtocolBadge protocol={n.protocol} /></td>
            <td style={{ padding: '6px 10px', maxWidth: 200 }}>
              <div style={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: n.threat_flag ? 'var(--red)' : 'var(--text)',
              }}>
                {n.hostname || n.dst_ip || '—'}
              </div>
              {n.url && (
                <div style={{ fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.url}
                </div>
              )}
            </td>
            <td style={{ padding: '6px 10px', color: 'var(--text2)' }}>{n.dst_port}</td>
            <td style={{ padding: '6px 10px', color: 'var(--text2)', maxWidth: 220 }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {n.info || n.method || '—'}
              </div>
            </td>
            <td style={{ padding: '6px 10px' }}>
              {n.threat_flag ? (
                <span style={{ color: 'var(--red)', fontWeight: 700 }}>⚠ THREAT</span>
              ) : (
                <span style={{ color: 'var(--green2)' }}>✓ OK</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────
// BEHAVIOR TABLE
// ─────────────────────────────────────────────
function BehaviorTable({ files, registry }) {
  const [sub, setSub] = useState('files');
  const data = sub === 'files' ? files : registry;

  const typeBg = {
    file: 'var(--cyan-dim)', registry: 'var(--purple-dim)',
    network: 'var(--green-dim)', process: 'var(--yellow-dim)',
  };
  const typeColor = {
    file: 'var(--cyan)', registry: 'var(--purple)',
    network: 'var(--green2)', process: 'var(--yellow)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {[['files', '📁 File Ops', files?.length], ['registry', '🗃 Registry Ops', registry?.length]].map(([id, label, count]) => (
          <button key={id} onClick={() => setSub(id)} style={{
            background: sub === id ? 'var(--bg4)' : 'none',
            border: `1px solid ${sub === id ? 'var(--border2)' : 'transparent'}`,
            borderRadius: 4, padding: '5px 12px', cursor: 'pointer',
            fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
            color: sub === id ? 'var(--text)' : 'var(--text3)',
          }}>
            {label}
            {count > 0 && <span style={{ marginLeft: 5, fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{count}</span>}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!data?.length ? (
          <EmptyState icon="🔬" message="No events" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            <thead>
              <tr>
                {['Time','Operation','Path / Key','Process'].map(h => (
                  <th key={h} style={{
                    padding: '7px 10px', textAlign: 'left', position: 'sticky', top: 0,
                    background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
                    fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em',
                    textTransform: 'uppercase', fontFamily: 'var(--font-ui)', fontWeight: 700,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <td style={{ padding: '6px 10px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                    +{formatTimestamp(row.timestamp)}
                  </td>
                  <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '2px 6px', borderRadius: 3,
                      background: sub === 'files' ? typeBg.file : typeBg.registry,
                      color: sub === 'files' ? typeColor.file : typeColor.registry,
                    }}>
                      {row.operation}
                    </span>
                  </td>
                  <td style={{ padding: '6px 10px', maxWidth: 300 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                      {row.path || row.key_path}
                    </div>
                    {row.value_name && (
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                        ↳ {row.value_name}{row.value_data ? ` = ${row.value_data.slice(0,60)}` : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '6px 10px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                    {row.process_name}
                    {row.pid && <span style={{ color: 'var(--text3)', marginLeft: 4 }}>({row.pid})</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// IOC LIST
// ─────────────────────────────────────────────
function IOCList({ iocs }) {
  const [filter, setFilter] = useState('all');
  const types = ['all', 'ip', 'domain', 'url', 'sha256', 'md5', 'filepath', 'registry'];
  const filtered = filter === 'all' ? iocs : iocs?.filter(i => i.type === filter);

  const typeColor = {
    ip: 'var(--red)', domain: 'var(--cyan)', url: 'var(--orange)',
    sha256: 'var(--purple)', md5: 'var(--purple)', sha1: 'var(--purple)',
    filepath: 'var(--yellow)', registry: 'var(--green2)',
  };
  const typeBg = {
    ip: 'var(--red-dim)', domain: 'var(--cyan-dim)', url: 'var(--orange-dim)',
    sha256: 'var(--purple-dim)', md5: 'var(--purple-dim)', sha1: 'var(--purple-dim)',
    filepath: 'var(--yellow-dim)', registry: 'var(--green-dim)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', gap: 5, padding: '8px 10px', flexWrap: 'wrap',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        {types.map(t => {
          const count = t === 'all' ? iocs?.length : iocs?.filter(i => i.type === t).length;
          if (count === 0 && t !== 'all') return null;
          return (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '3px 10px', borderRadius: 3, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              background: filter === t ? (typeBg[t] || 'var(--bg4)') : 'var(--bg3)',
              color: filter === t ? (typeColor[t] || 'var(--text)') : 'var(--text3)',
            }}>
              {t.toUpperCase()} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {!filtered?.length ? (
          <EmptyState icon="🎯" message="No IOCs" />
        ) : (
          filtered.map((ioc, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 4,
              background: 'var(--bg3)', border: '1px solid var(--border)',
              marginBottom: 5, transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{iocIcon(ioc.type)}</span>
              <span style={{
                fontSize: 9, padding: '2px 6px', borderRadius: 3, flexShrink: 0,
                fontFamily: 'var(--font-mono)', fontWeight: 700,
                background: typeBg[ioc.type] || 'var(--bg4)',
                color: typeColor[ioc.type] || 'var(--text2)',
              }}>
                {(ioc.type || '').toUpperCase()}
              </span>
              <span style={{
                flex: 1, fontFamily: 'var(--font-mono)', fontSize: 11,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: 'var(--text)',
              }}>
                {ioc.value}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text2)', flexShrink: 0, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ioc.threat_label}
              </span>
              <span style={{
                fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--font-mono)', flexShrink: 0,
              }}>
                {ioc.confidence}%
              </span>
              <CopyButton text={ioc.value} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STATIC INFO PANEL
// ─────────────────────────────────────────────
function StaticInfo({ data, yaraHits }) {
  if (!data && !yaraHits?.length) return <EmptyState icon="🔬" message="No static data" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 14 }}>
      {/* YARA Hits */}
      {yaraHits?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            YARA Matches ({yaraHits.length})
          </div>
          {yaraHits.map((y, i) => (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 4,
              background: 'var(--bg3)', border: '1px solid var(--border)',
              marginBottom: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <SeverityBadge severity={y.severity} />
                <span style={{ fontWeight: 700, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{y.rule_name}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{y.rule_description}</div>
              {y.tags?.length > 0 && <div style={{ marginTop: 5 }}><TagList tags={y.tags} /></div>}
            </div>
          ))}
        </div>
      )}

      {/* PE Info */}
      {data && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            PE Header
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: 4, border: '1px solid var(--border)', padding: '10px 12px' }}>
            <InfoRow label="Architecture" value={data.arch} />
            <InfoRow label="Compiler" value={data.compiler} />
            <InfoRow label="Entry Point" value={data.entry_point} mono />
            <InfoRow label="Sections" value={data.num_sections} />
            <InfoRow label="Entropy" value={data.entropy?.toFixed(2) + ' bits/byte'} />
            <InfoRow label="Packed" value={data.is_packed ? '⚠ YES — packer detected' : 'No'} />
            <InfoRow label="Signed" value={data.is_signed ? '✓ Yes' : 'No'} />
            <InfoRow label="Magic" value={data.file_magic} mono />
          </div>
        </div>
      )}

      {/* Sections */}
      {data?.sections?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color:
