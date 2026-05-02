import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from './clientApi';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
  { path: '/public', label: 'Public Feed', icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
  { path: '/ioc', label: 'IOC Search', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' },
  { path: '/threats', label: 'Threat Intel', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01' },
];

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
    const interval = setInterval(() => api.getStats().then(setStats).catch(() => {}), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      position: 'relative', zIndex: 200,
      height: 52, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px 0 20px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {onMenuClick && (
          <button
            type="button"
            className="header-menu-btn"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/'); } }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--red)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{
            fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em',
            color: 'var(--text)', fontFamily: 'var(--font-ui)',
          }}>
            Arena<span style={{ color: 'var(--red)' }}>Mala</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="header-nav" aria-label="Main pages">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                type="button"
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 'var(--radius)',
                  border: 'none', background: active ? 'rgba(59,130,246,0.10)' : 'transparent',
                  color: active ? 'var(--blue)' : 'var(--text3)',
                  fontSize: 13, fontWeight: 500,
                  fontFamily: 'var(--font-ui)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; } }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {stats && (
          <div className="header-stat-pill" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 12px', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--green)',
              animation: 'pulse 2.5s ease-in-out infinite',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
              {stats.total_analyses?.toLocaleString()} scans · {stats.malicious_rate}% malicious
            </span>
          </div>
        )}
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          padding: '4px 10px', borderRadius: 6,
          background: 'rgba(59,130,246,0.10)',
          border: '1px solid rgba(59,130,246,0.20)',
          color: 'var(--blue)',
          fontFamily: 'var(--font-mono)',
        }}>
          FREE
        </span>
      </div>
    </header>
  );
}
