import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './clientApi';
import { Spinner } from './UI';

const OS_OPTIONS = ['Windows 10 x64', 'Windows 11 x64', 'Windows 7 x86', 'Windows 7 x64', 'Ubuntu 22.04', 'Android 12'];
const NETWORK_LABELS = { simulated: 'Simulated (FakeNet)', real: 'Real Internet', isolated: 'No Network', tor: 'Tor Proxy' };
const DURATION_OPTIONS = [30, 60, 120, 180, 240];
const PRIVACY_OPTIONS = ['public', 'unlisted'];

export default function SubmitForm() {
  const [tab, setTab] = useState('file');
  const [file, setFile] = useState(null);
  const [urlVal, setUrlVal] = useState('');
  const [hashVal, setHashVal] = useState('');
  const [dragging, setDragging] = useState(false);
  const [os, setOs] = useState('Windows 10 x64');
  const [network, setNetwork] = useState('simulated');
  const [duration, setDuration] = useState(60);
  const [privacy, setPrivacy] = useState('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOpts, setShowOpts] = useState(false);

  const fileRef = useRef();
  const navigate = useNavigate();

  const handleFile = (f) => { if (f) { setFile(f); setError(null); } };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleSubmit = async () => {
    setError(null); setLoading(true);
    try {
      let result;
      if (tab === 'file') {
        if (!file) throw new Error('Please select a file');
        const fd = new FormData();
        fd.append('file', file); fd.append('os', os);
        fd.append('network_mode', network); fd.append('duration', duration);
        fd.append('privacy', privacy);
        result = await api.submitFile(fd);
      } else if (tab === 'url') {
        if (!urlVal.trim()) throw new Error('Please enter a URL');
        const fd = new FormData();
        fd.append('url', urlVal.trim()); fd.append('os', os);
        fd.append('network_mode', network); fd.append('duration', duration);
        fd.append('privacy', privacy);
        result = await api.submitFile(fd);
      } else {
        if (!hashVal.trim()) throw new Error('Please enter a hash');
        const fd = new FormData();
        fd.append('hash', hashVal.trim());
        result = await api.submitFile(fd);
      }
      if (result?.error) throw new Error(result.error);
      if (result?.id) navigate('/analysis/' + result.id);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const TABS = [
    { id: 'file', label: 'File', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6' },
    { id: 'url', label: 'URL', icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
    { id: 'hash', label: 'Hash', icon: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4' },
  ];

  const inputBase = {
    width: '100%', background: 'rgba(200,170,120,0.04)',
    border: '1px solid rgba(200,170,120,0.1)', borderRadius: 'var(--radius)',
    padding: '13px 16px', color: 'var(--text)',
    fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none',
    transition: 'all 0.25s cubic-bezier(0.22, 0.68, 0, 1)',
  };

  return (
    <div className="glass" style={{
      width: '100%', maxWidth: 720, overflow: 'hidden',
      boxShadow: 'var(--shadow-lg), 0 0 60px rgba(212,148,60,0.04)',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(200,170,120,0.06)', position: 'relative' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '14px', background: 'none',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
              color: tab === t.id ? 'var(--accent)' : 'var(--text3)',
              transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              position: 'relative',
            }}
            onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--text2)'; }}
            onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--text3)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={t.icon} />
            </svg>
            {t.label}
            {tab === t.id && (
              <span style={{
                position: 'absolute', bottom: -1, left: '20%', right: '20%',
                height: 2, borderRadius: 1,
                background: 'var(--accent)',
                boxShadow: '0 0 12px rgba(212,148,60,0.4)',
              }} />
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* File Drop */}
        {tab === 'file' && (
          <div
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--green2)' : 'rgba(200,170,120,0.12)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '44px 20px', textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.22, 0.68, 0, 1)',
              background: dragging ? 'rgba(212,148,60,0.06)' : file ? 'rgba(76,175,80,0.04)' : 'rgba(200,170,120,0.02)',
            }}
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                  {(file.size / 1024).toFixed(1)} KB · click to change
                </div>
              </>
            ) : (
              <>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(200,170,120,0.06)', border: '1px solid rgba(200,170,120,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                  transition: 'all 0.3s',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Drop sample here or click to browse</div>
                <div style={{ fontSize: 12, color: 'var(--text4)' }}>
                  EXE · DLL · PDF · Office · APK · ZIP · PS1 · JS — max 100MB
                </div>
              </>
            )}
          </div>
        )}

        {/* URL */}
        {tab === 'url' && (
          <input
            type="text" placeholder="https://suspicious-domain.com/payload.exe"
            value={urlVal} onChange={e => setUrlVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputBase}
            onFocus={e => { e.target.style.borderColor = 'rgba(212,148,60,0.3)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,148,60,0.08), 0 0 20px rgba(212,148,60,0.06)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(200,170,120,0.1)'; e.target.style.boxShadow = 'none'; }}
          />
        )}

        {/* Hash */}
        {tab === 'hash' && (
          <input
            type="text" placeholder="MD5 / SHA1 / SHA256 hash lookup"
            value={hashVal} onChange={e => setHashVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputBase}
            onFocus={e => { e.target.style.borderColor = 'rgba(212,148,60,0.3)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,148,60,0.08), 0 0 20px rgba(212,148,60,0.06)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(200,170,120,0.1)'; e.target.style.boxShadow = 'none'; }}
          />
        )}

        {/* Advanced toggle */}
        {tab !== 'hash' && (
          <>
            <button
              onClick={() => setShowOpts(!showOpts)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', color: 'var(--text3)',
                cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12,
                fontWeight: 600, padding: '10px 0 0', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showOpts ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
              Advanced Options
            </button>

            <div style={{
              maxHeight: showOpts ? 120 : 0, overflow: 'hidden',
              transition: 'max-height 0.35s cubic-bezier(0.22, 0.68, 0, 1), opacity 0.25s',
              opacity: showOpts ? 1 : 0,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, paddingTop: 14 }}>
                {[
                  { label: 'OS', value: os, set: setOs, opts: OS_OPTIONS.map(o => ({ value: o, label: o })) },
                  { label: 'Network', value: network, set: setNetwork, opts: Object.entries(NETWORK_LABELS).map(([v, l]) => ({ value: v, label: l })) },
                  { label: 'Duration', value: duration, set: v => setDuration(Number(v)), opts: DURATION_OPTIONS.map(d => ({ value: d, label: d + 's' })) },
                  { label: 'Privacy', value: privacy, set: setPrivacy, opts: PRIVACY_OPTIONS.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })) },
                ].map(({ label, value, set, opts }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: 'var(--text4)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
                      {label}
                    </div>
                    <select value={value} onChange={e => set(e.target.value)} style={{
                      width: '100%', background: 'rgba(200,170,120,0.04)',
                      border: '1px solid rgba(200,170,120,0.08)', borderRadius: 'var(--radius)',
                      padding: '8px 10px', color: 'var(--text2)',
                      fontFamily: 'var(--font-ui)', fontSize: 12, outline: 'none',
                      cursor: 'pointer', transition: 'border-color 0.15s',
                    }}>
                      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="fade-scale" style={{
            marginTop: 14, padding: '11px 14px',
            background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.12)',
            borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 8,
            backdropFilter: 'blur(8px)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Submit area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
          <span style={{ fontSize: 11, color: 'var(--text4)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Isolated VM execution — never on host
          </span>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-glow"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: loading ? 'var(--bg4)' : 'linear-gradient(135deg, #e0a040, #c07c28)',
              border: 'none', color: loading ? 'var(--text3)' : '#fff',
              padding: '12px 32px', borderRadius: 'var(--radius)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              transition: 'all 0.3s cubic-bezier(0.22, 0.68, 0, 1)',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(212,148,60,0.3), 0 0 40px rgba(212,148,60,0.08)',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(212,148,60,0.4), 0 0 60px rgba(212,148,60,0.12)'; }}}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,148,60,0.3), 0 0 40px rgba(212,148,60,0.08)'; }}}
          >
            {loading ? (
              <><Spinner size={14} color="var(--text3)" /> Queuing...</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                ANALYZE
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
