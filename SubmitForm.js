import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './clientApi';
import { Spinner } from './UI';

const OS_OPTIONS = ['Windows 10 x64', 'Windows 11 x64', 'Windows 7 x86', 'Windows 7 x64', 'Ubuntu 22.04', 'Android 12'];
const NETWORK_LABELS = { simulated: 'Simulated (FakeNet)', real: 'Real Internet', isolated: 'No Network', tor: 'Tor Proxy' };
const DURATION_OPTIONS = [30, 60, 120, 180, 240];

const TABS = [
  { id: 'file', label: 'File',   icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6' },
  { id: 'url',  label: 'URL',    icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
  { id: 'hash', label: 'Search', icon: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4' },
];

const inputStyle = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--border2)',
  borderRadius: 'var(--radius)',
  padding: '11px 14px',
  color: 'var(--text)',
  fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const selectStyle = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '7px 28px 7px 10px',
  color: 'var(--text2)',
  fontFamily: 'var(--font-ui)', fontSize: 12,
  outline: 'none', cursor: 'pointer',
  transition: 'border-color 0.15s',
};

export default function SubmitForm() {
  const [tab, setTab]         = useState('file');
  const [file, setFile]       = useState(null);
  const [urlVal, setUrlVal]   = useState('');
  const [hashVal, setHashVal] = useState('');
  const [dragging, setDragging] = useState(false);
  const [os, setOs]           = useState('Windows 10 x64');
  const [network, setNetwork] = useState('simulated');
  const [duration, setDuration] = useState(60);
  const [privacy, setPrivacy] = useState(false);
  const [heavyEvasion, setHeavyEvasion] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [showOpts, setShowOpts] = useState(false);

  const fileRef = useRef();
  const navigate = useNavigate();

  const handleFile = f => { if (f) { setFile(f); setError(null); } };

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleSubmit = async () => {
    setError(null); setLoading(true);
    try {
      let result;
      const fd = new FormData();
      if (tab === 'file') {
        if (!file) throw new Error('Please select a file');
        fd.append('file', file); fd.append('os', os);
        fd.append('network_mode', network); fd.append('duration', duration);
        fd.append('privacy', privacy ? 'unlisted' : 'public');
        result = await api.submitFile(fd);
      } else if (tab === 'url') {
        if (!urlVal.trim()) throw new Error('Please enter a URL');
        fd.append('url', urlVal.trim()); fd.append('os', os);
        fd.append('network_mode', network); fd.append('duration', duration);
        fd.append('privacy', privacy ? 'unlisted' : 'public');
        result = await api.submitFile(fd);
      } else {
        if (!hashVal.trim()) throw new Error('Please enter a hash');
        fd.append('hash', hashVal.trim());
        result = await api.submitFile(fd);
      }
      if (result?.error) throw new Error(result.error);
      if (result?.id) navigate('/analysis/' + result.id);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      width: '100%', maxWidth: 760,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(0,0,0,0.15)',
        padding: '6px 8px',
        gap: 4,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setError(null); }}
            style={{
              padding: '6px 14px',
              background: tab === t.id ? 'var(--surface)' : 'transparent',
              border: tab === t.id ? '1px solid var(--border)' : '1px solid transparent',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)', fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? 'var(--amber)' : 'var(--text3)',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
            }}
            onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--text2)'; }}
            onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--text3)'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* File drop zone */}
        {tab === 'file' && (
          <div
            style={{
              border: `2px dashed ${dragging ? 'var(--amber)' : file ? 'rgba(34,197,94,0.40)' : 'var(--border2)'}`,
              borderRadius: 'var(--radius)',
              padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.2s',
              background: dragging ? 'rgba(217,119,6,0.04)' : file ? 'rgba(34,197,94,0.03)' : 'rgba(0,0,0,0.15)',
            }}
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--surface2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              transition: 'background 0.2s',
            }}>
              {file ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
              )}
            </div>
            {file ? (
              <>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, fontFamily: 'var(--font-serif)', color: 'var(--text)' }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                  {(file.size / 1024).toFixed(1)} KB · click to change
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, marginBottom: 8, color: 'var(--text)' }}>
                  Drag &amp; drop your sample
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20, lineHeight: 1.6 }}>
                  Supports PE, ELF, Mach-O, Office docs, PDFs, scripts, and archives.<br />Maximum file size: 100MB.
                </p>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                  style={{
                    background: 'var(--surface2)', border: '1px solid var(--border2)',
                    borderRadius: 'var(--radius)', padding: '8px 20px',
                    color: 'var(--text2)', fontSize: 13, fontWeight: 500,
                    fontFamily: 'var(--font-ui)', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)'; }}
                >
                  Browse Files
                </button>
              </>
            )}
          </div>
        )}

        {/* URL input */}
        {tab === 'url' && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text3)', display: 'block', marginBottom: 8 }}>Target URL</label>
            <input
              type="text" placeholder="https://suspicious-site.com/download/..."
              value={urlVal} onChange={e => setUrlVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ ...inputStyle, height: 44 }}
              onFocus={e => { e.target.style.borderColor = 'var(--amber)'; e.target.style.boxShadow = '0 0 0 2px rgba(217,119,6,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
            />
            <p style={{ fontSize: 12, color: 'var(--text4)', marginTop: 8 }}>
              The URL will be visited by our instrumented browser in a sandboxed Windows 10 environment.
            </p>
          </div>
        )}

        {/* Hash input */}
        {tab === 'hash' && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text3)', display: 'block', marginBottom: 8 }}>MD5, SHA-1, or SHA-256</label>
            <input
              type="text" placeholder="e.g. 44d88612fea8a8f36de82e1278abb02f"
              value={hashVal} onChange={e => setHashVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ ...inputStyle, height: 44 }}
              onFocus={e => { e.target.style.borderColor = 'var(--amber)'; e.target.style.boxShadow = '0 0 0 2px rgba(217,119,6,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
            />
            <p style={{ fontSize: 12, color: 'var(--text4)', marginTop: 8 }}>
              Search our intelligence database for existing reports of this indicator.
            </p>
          </div>
        )}

        {/* Advanced options toggle */}
        {tab !== 'hash' && (
          <>
            <button
              onClick={() => setShowOpts(!showOpts)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', color: 'var(--text3)',
                cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12,
                fontWeight: 500, padding: '12px 0 0', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showOpts ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
              Sandbox Options
            </button>
            <div style={{
              maxHeight: showOpts ? 100 : 0, overflow: 'hidden',
              transition: 'max-height 0.3s cubic-bezier(0.22,0.68,0,1), opacity 0.2s',
              opacity: showOpts ? 1 : 0,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, paddingTop: 12 }}>
                {[
                  { label: 'OS',       value: os,       set: setOs,   opts: OS_OPTIONS.map(o => ({ value: o, label: o })) },
                  { label: 'Network',  value: network,  set: setNetwork, opts: Object.entries(NETWORK_LABELS).map(([v, l]) => ({ value: v, label: l })) },
                  { label: 'Duration', value: duration, set: v => setDuration(Number(v)), opts: DURATION_OPTIONS.map(d => ({ value: d, label: d + 's' })) },
                ].map(({ label, value, set, opts }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: 'var(--text4)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
                      {label}
                    </div>
                    <select value={value} onChange={e => set(e.target.value)} style={selectStyle}>
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
            marginTop: 14, padding: '10px 14px',
            background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Submit row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {[
              { label: 'Private Submission', val: privacy,     set: setPrivacy },
              { label: 'Heavy Evasion Detection', val: heavyEvasion, set: setHeavyEvasion },
            ].map(({ label, val, set }) => (
              <label key={label} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                cursor: 'pointer', fontSize: 13, color: 'var(--text3)',
              }}>
                <div
                  onClick={() => set(!val)}
                  style={{
                    width: 16, height: 16, borderRadius: 2,
                    border: `1px solid ${val ? 'var(--amber)' : 'var(--border2)'}`,
                    background: val ? 'rgba(217,119,6,0.15)' : 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
                  }}
                >
                  {val && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </div>
                {label}
              </label>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: loading ? 'var(--bg4)' : 'var(--amber)',
              border: 'none',
              color: loading ? 'var(--text3)' : '#fff',
              padding: '10px 28px', borderRadius: 'var(--radius)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.04em',
              transition: 'all 0.15s',
              boxShadow: loading ? 'none' : 'var(--shadow-amber)',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'var(--amber2)'; }}}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = 'var(--amber)'; }}}
          >
            {loading ? (
              <><Spinner size={14} color="var(--text3)" /> Queuing...</>
            ) : (
              <>
                Analyze Sample
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
