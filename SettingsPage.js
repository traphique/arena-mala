import React, { useEffect, useRef, useState } from 'react';
import {
  loadStoredSettings,
  saveStoredSettings,
  applySettingsToServer,
  fetchServerSettings,
} from './clientApi';

function StatusDot({ active }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 8, height: 8, borderRadius: '50%',
      background: active ? 'var(--green)' : 'var(--text4)',
      boxShadow: active ? '0 0 6px var(--green)' : 'none',
      flexShrink: 0,
    }} />
  );
}

function FieldLabel({ children, hint }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--text3)',
      }}>{children}</label>
      {hint && (
        <span style={{ fontSize: 11, color: 'var(--text4)', marginLeft: 8 }}>{hint}</span>
      )}
    </div>
  );
}

function SecretInput({ value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'var(--bg)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)',
          color: 'var(--text)', padding: '10px 44px 10px 14px',
          fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'rgba(217,119,6,0.45)';
          e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.10)';
        }}
        onBlur={e => {
          e.target.style.borderColor = '';
          e.target.style.boxShadow = '';
        }}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text4)', padding: 2, lineHeight: 1,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text2)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text4)'}
        title={visible ? 'Hide' : 'Show'}
      >
        {visible ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      style={{
        width: '100%', boxSizing: 'border-box',
        background: 'var(--bg)',
        border: '1px solid var(--border2)',
        borderRadius: 'var(--radius)',
        color: 'var(--text)', padding: '10px 14px',
        fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onFocus={e => {
        e.target.style.borderColor = 'rgba(217,119,6,0.45)';
        e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.10)';
      }}
      onBlur={e => {
        e.target.style.borderColor = '';
        e.target.style.boxShadow = '';
      }}
    />
  );
}

function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
      background: type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
      border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '12px 18px',
      display: 'flex', alignItems: 'center', gap: 10,
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      animation: 'fadeIn 0.2s ease',
    }}>
      {type === 'success' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )}
      <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{message}</span>
    </div>
  );
}

function ServiceCard({ icon, title, description, badge, configured, children }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 22px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(217,119,6,0.08)',
            border: '1px solid rgba(217,119,6,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{title}</span>
              {badge && (
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                  textTransform: 'uppercase', padding: '2px 7px',
                  borderRadius: 4, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)', color: 'var(--text4)',
                }}>
                  {badge}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text4)', marginTop: 2 }}>{description}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <StatusDot active={configured} />
          <span style={{ fontSize: 12, color: configured ? 'var(--green)' : 'var(--text4)' }}>
            {configured ? 'Connected' : 'Not configured'}
          </span>
        </div>
      </div>
      <div style={{ padding: '22px' }}>
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState({
    supabaseUrl: '', supabaseKey: '',
    capeUrl: '', capeKey: '',
  });
  const [serverStatus, setServerStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const toastKey = useRef(0);

  useEffect(() => {
    const stored = loadStoredSettings();
    setForm(stored);
    fetchServerSettings().then(setServerStatus).catch(() => {});
  }, []);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const showToast = (message, type = 'success') => {
    toastKey.current += 1;
    setToast({ message, type, key: toastKey.current });
  };

  const handleSave = async (keys) => {
    setSaving(true);
    try {
      const patch = {};
      keys.forEach(k => { patch[k] = form[k]; });
      saveStoredSettings(patch);
      await applySettingsToServer({ ...loadStoredSettings(), ...patch });
      const updated = await fetchServerSettings();
      setServerStatus(updated);
      showToast('Settings saved and applied');
    } catch (err) {
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async (keys) => {
    const patch = {};
    keys.forEach(k => { patch[k] = ''; });
    setForm(f => ({ ...f, ...patch }));
    saveStoredSettings(patch);
    await applySettingsToServer({ ...loadStoredSettings(), ...patch }).catch(() => {});
    const updated = await fetchServerSettings().catch(() => serverStatus);
    setServerStatus(updated);
    showToast('Credentials cleared');
  };

  const supabaseConfigured = serverStatus?.supabaseConfigured ?? false;
  const capeConfigured     = serverStatus?.capeConfigured     ?? false;

  return (
    <>
    <div className="page-padding-main" style={{ flex: 1, overflowY: 'auto' }}>
    <div className="page-inner">

      {/* Page header */}
      <div className="fade-up" style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)', paddingBottom: 24, marginBottom: 32,
      }}>
        <div>
          <h1 className="home-hero-title" style={{ marginBottom: 6 }}>Settings</h1>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>
            Configure your own API credentials for this session
          </p>
        </div>

        {/* Status overview pills */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {[
            { label: 'Database', ok: supabaseConfigured },
            { label: 'Sandbox',  ok: capeConfigured },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 20,
              background: s.ok ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${s.ok ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
              fontSize: 12, fontWeight: 500,
              color: s.ok ? 'var(--green)' : 'var(--text4)',
            }}>
              <StatusDot active={s.ok} />
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="fade-up delay-1" style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.18)',
        borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 28,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>
          Credentials are stored in your browser's local storage and re-applied on every page load.
          They are sent to the backend only to activate the connection — never logged or persisted on the server.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Supabase ── */}
        <div className="fade-scale delay-1">
          <ServiceCard
            configured={supabaseConfigured}
            title="Supabase"
            badge="Database"
            description="Stores analyses, IOCs, timeline events and threat families"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <FieldLabel hint="e.g. https://xxxx.supabase.co">Project URL</FieldLabel>
                <TextInput
                  value={form.supabaseUrl}
                  onChange={set('supabaseUrl')}
                  placeholder="https://your-project.supabase.co"
                />
              </div>
              <div>
                <FieldLabel hint="service_role key (keep private)">Service Role Key</FieldLabel>
                <SecretInput
                  value={form.supabaseKey}
                  onChange={set('supabaseKey')}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                {(form.supabaseUrl || form.supabaseKey) && (
                  <button
                    onClick={() => handleClear(['supabaseUrl', 'supabaseKey'])}
                    style={{
                      background: 'transparent', border: '1px solid var(--border2)',
                      borderRadius: 'var(--radius)', padding: '8px 16px',
                      color: 'var(--text4)', fontSize: 13, fontFamily: 'var(--font-ui)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text4)'; }}
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => handleSave(['supabaseUrl', 'supabaseKey'])}
                  disabled={saving || (!form.supabaseUrl && !form.supabaseKey)}
                  style={{
                    background: 'var(--amber)', border: 'none',
                    borderRadius: 'var(--radius)', padding: '8px 20px',
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    fontFamily: 'var(--font-ui)', cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: (saving || (!form.supabaseUrl && !form.supabaseKey)) ? 0.5 : 1,
                    boxShadow: 'var(--shadow-amber)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--amber2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--amber)'; }}
                >
                  {saving ? 'Saving…' : 'Save & Apply'}
                </button>
              </div>
            </div>
          </ServiceCard>
        </div>

        {/* ── CAPE Sandbox ── */}
        <div className="fade-scale delay-2">
          <ServiceCard
            configured={capeConfigured}
            title="CAPE Sandbox"
            badge="Dynamic Analysis"
            description="Detonates samples in an isolated VM for behavioral analysis"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <FieldLabel hint="default: http://localhost:8000">API URL</FieldLabel>
                <TextInput
                  value={form.capeUrl}
                  onChange={set('capeUrl')}
                  placeholder="http://your-cape-instance:8000"
                />
              </div>
              <div>
                <FieldLabel hint="optional if CAPE has no auth">API Key</FieldLabel>
                <SecretInput
                  value={form.capeKey}
                  onChange={set('capeKey')}
                  placeholder="cape_api_key_here"
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                {(form.capeUrl || form.capeKey) && (
                  <button
                    onClick={() => handleClear(['capeUrl', 'capeKey'])}
                    style={{
                      background: 'transparent', border: '1px solid var(--border2)',
                      borderRadius: 'var(--radius)', padding: '8px 16px',
                      color: 'var(--text4)', fontSize: 13, fontFamily: 'var(--font-ui)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text4)'; }}
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => handleSave(['capeUrl', 'capeKey'])}
                  disabled={saving || (!form.capeUrl && !form.capeKey)}
                  style={{
                    background: 'var(--amber)', border: 'none',
                    borderRadius: 'var(--radius)', padding: '8px 20px',
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    fontFamily: 'var(--font-ui)', cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: (saving || (!form.capeUrl && !form.capeKey)) ? 0.5 : 1,
                    boxShadow: 'var(--shadow-amber)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--amber2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--amber)'; }}
                >
                  {saving ? 'Saving…' : 'Save & Apply'}
                </button>
              </div>
            </div>
          </ServiceCard>
        </div>

        {/* ── How it works ── */}
        <div className="fade-scale delay-3" style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 22px',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 16,
          }}>
            How credentials work
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { step: '01', text: 'Enter your credentials above and click Save & Apply' },
              { step: '02', text: 'Keys are stored in local storage and applied to the server instantly' },
              { step: '03', text: 'On every page load, stored keys are automatically re-applied' },
              { step: '04', text: 'Use Clear to remove credentials from this browser at any time' },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                  color: 'var(--amber)', flexShrink: 0, marginTop: 1,
                }}>{item.step}</span>
                <span style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
    </div>

    {toast && (
      <Toast
        key={toast.key}
        message={toast.message}
        type={toast.type}
        onDone={() => setToast(null)}
      />
    )}
    </>
  );
}
