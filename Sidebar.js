import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MAIN_ITEMS = [
  { path: '/',       icon: 'M22 12h-4l-3 9L9 3l-3 9H2', title: 'Dashboard' },
  { path: '/public', icon: 'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', title: 'Public Feed' },
  { path: '/ioc',    icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', title: 'IOC Search' },
  { path: '/threats',icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01', title: 'Threat Intel' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const go = path => { navigate(path); onClose?.(); };

  const isActive = path =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navBtn = (item, active) => (
    <button
      key={item.path || item.title}
      type="button"
      onClick={item.path ? () => go(item.path) : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 12px', borderRadius: 'var(--radius)',
        border: 'none', width: '100%', textAlign: 'left',
        background: active ? 'rgba(217,119,6,0.10)' : 'transparent',
        color: active ? 'var(--amber)' : 'var(--text3)',
        fontSize: 13, fontWeight: active ? 600 : 400,
        fontFamily: 'var(--font-ui)', cursor: 'pointer',
        transition: 'all 0.15s', position: 'relative',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text)'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; }}}
    >
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: 2, borderRadius: '0 2px 2px 0',
          background: 'var(--amber)',
        }} />
      )}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d={item.icon} />
      </svg>
      {item.title}
    </button>
  );

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
        {/* Operations section */}
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
          textTransform: 'uppercase', color: 'var(--text4)',
          padding: '4px 12px 8px',
        }}>
          Operations
        </div>

        {MAIN_ITEMS.map(item => navBtn(item, isActive(item.path)))}

        <div style={{ flex: 1 }} />

        {/* System section */}
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
          textTransform: 'uppercase', color: 'var(--text4)',
          padding: '8px 12px 6px',
        }}>
          System
        </div>

        {navBtn({
          icon: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
          title: 'Settings',
        }, false)}
      </aside>
    </>
  );
}
