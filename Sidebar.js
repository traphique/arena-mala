import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ITEMS = [
  { path: '/', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10', title: 'Dashboard' },
  { path: '/public', icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', title: 'Public Feed' },
  { path: '/ioc', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', title: 'IOC Search' },
  { path: '/threats', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01', title: 'Threat Intel' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside style={{
      width: 60,
      background: 'rgba(26,20,16,0.4)',
      backdropFilter: 'saturate(160%) blur(16px)',
      WebkitBackdropFilter: 'saturate(160%) blur(16px)',
      borderRight: '1px solid rgba(200,170,120,0.06)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '16px 0', gap: 6,
      flexShrink: 0, position: 'relative', zIndex: 2,
    }}>
      {ITEMS.map(item => {
        const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <div key={item.path} className="tooltip-wrap">
            <button
              onClick={() => navigate(item.path)}
              style={{
                width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? 'var(--accent-dim)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                color: active ? 'var(--accent)' : 'var(--text4)',
                transition: 'all 0.25s cubic-bezier(0.22, 0.68, 0, 1)',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(200,170,120,0.08)';
                  e.currentTarget.style.color = 'var(--text2)';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text4)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {active && (
                <span style={{
                  position: 'absolute', left: -1, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 20, borderRadius: '0 2px 2px 0',
                  background: 'var(--accent)',
                  boxShadow: '0 0 8px rgba(212,148,60,0.4)',
                }} />
              )}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
            </button>
            <div className="tip">{item.title}</div>
          </div>
        );
      })}

      <div style={{ flex: 1 }} />
      <div style={{ width: 28, height: 1, background: 'rgba(200,170,120,0.08)', margin: '4px 0' }} />

      <div className="tooltip-wrap">
        <button
          style={{
            width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none',
            borderRadius: 'var(--radius)', cursor: 'pointer',
            color: 'var(--text4)',
            transition: 'all 0.25s cubic-bezier(0.22, 0.68, 0, 1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,170,120,0.08)'; e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text4)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <div className="tip">Settings</div>
      </div>
    </aside>
  );
}
