import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ITEMS = [
  { path: '/', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10', title: 'Dashboard' },
  { path: '/public', icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', title: 'Public Feed' },
  { path: '/ioc', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', title: 'IOC Search' },
  { path: '/threats', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01', title: 'Threat Intel' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const go = path => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop${mobileOpen ? ' sidebar-backdrop--visible' : ''}`}
        aria-label="Close navigation menu"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={`sidebar-rail${mobileOpen ? ' sidebar-rail--open' : ''}`}
        aria-label="Primary navigation"
      >
        {/* Section label */}
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
          textTransform: 'uppercase', color: 'var(--text4)',
          padding: '4px 12px 8px',
        }}>
          Navigation
        </div>

        {ITEMS.map(item => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => go(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 'var(--radius)',
                border: 'none', width: '100%', textAlign: 'left',
                background: active ? 'rgba(59,130,246,0.10)' : 'transparent',
                color: active ? 'var(--blue)' : 'var(--text3)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; } }}
            >
              {active && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 2px 2px 0',
                  background: 'var(--blue)',
                }} />
              )}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d={item.icon} />
              </svg>
              {item.title}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        <div style={{
          height: 1, background: 'var(--border)',
          margin: '8px 12px',
        }} />

        <button
          type="button"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', borderRadius: 'var(--radius)',
            border: 'none', width: '100%', textAlign: 'left',
            background: 'transparent',
            color: 'var(--text4)',
            fontSize: 13, fontFamily: 'var(--font-ui)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text4)'; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </button>
      </aside>
    </>
  );
}
