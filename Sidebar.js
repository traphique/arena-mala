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
        aria-label="Primary"
      >
      {ITEMS.map(item => {
        const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <div key={item.path} className="tooltip-wrap">
            <button
              type="button"
              aria-label={item.title}
              onClick={() => go(item.path)}
              className={[
                'relative flex h-10 w-10 items-center justify-center rounded-md transition-all',
                active
                  ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
                  : 'bg-transparent text-[var(--text4)] hover:bg-[rgba(200,170,120,0.08)] hover:text-[var(--text2)] hover:scale-[1.08]',
              ].join(' ')}
            >
              {active && (
                <span
                  className="absolute -left-px top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-sm"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 8px rgba(212,148,60,0.4)' }}
                />
              )}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
            </button>
            <div className="tip">{item.title}</div>
          </div>
        );
      })}

      <div className="flex-1" />
      <div className="my-1 h-px w-7" style={{ background: 'rgba(200,170,120,0.08)' }} />

      <div className="tooltip-wrap">
        <button
          type="button"
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-md bg-transparent text-[var(--text4)] transition-all hover:scale-[1.08] hover:bg-[rgba(200,170,120,0.08)] hover:text-[var(--text2)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <div className="tip">Settings</div>
      </div>
    </aside>
    </>
  );
}
