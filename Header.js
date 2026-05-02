import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from './clientApi';

const NAV_ITEMS = [
  { path: '/',       label: 'Analysis' },
  { path: '/public', label: 'Hunting' },
  { path: '/threats',label: 'Intelligence' },
];

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
    const iv = setInterval(() => api.getStats().then(setStats).catch(() => {}), 30000);
    return () => clearInterval(iv);
  }, []);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header style={{
      position: 'relative', zIndex: 200,
      height: 52, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      boxShadow: '0 1px 0 rgba(0,0,0,0.3)',
    }}>
      {/* Left: hamburger + logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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

        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/'); }}}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 4,
            background: 'rgba(217,119,6,0.15)',
            border: '1px solid rgba(217,119,6,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={{
            fontSize: 16, fontWeight: 600,
            fontFamily: 'var(--font-serif)',
            letterSpacing: '0.02em',
            color: 'var(--amber)',
          }}>
            ArenaMala
          </span>
        </div>
      </div>

      {/* Center: nav */}
      <nav className="header-nav" aria-label="Main pages" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.path);
          return (
            <button
              type="button"
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: '6px 16px', borderRadius: 'var(--radius)',
                border: 'none', background: 'transparent',
                color: active ? 'var(--amber)' : 'var(--text3)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text3)'; }}}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right: node badge + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {stats && (
          <div className="header-stat-pill" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'rgba(217,119,6,0.06)',
            fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--amber)',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
              <line x1="6" y1="6" x2="6.01" y2="6"/>
              <line x1="6" y1="18" x2="6.01" y2="18"/>
            </svg>
            NODE: AM-US-WEST-04
          </div>
        )}
        <div style={{
          width: 30, height: 30, borderRadius: 4,
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
            color: 'var(--text3)', fontFamily: 'var(--font-ui)',
          }}>JD</span>
        </div>
      </div>
    </header>
  );
}
