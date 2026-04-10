import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from './clientApi';
import { Badge } from './components/ui/badge.js';

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
    <header
      className="relative z-[200] flex h-[58px] shrink-0 items-center justify-between border-b border-[rgba(200,170,120,0.06)] bg-[rgba(26,20,16,0.6)] px-4 pl-6 backdrop-blur-[20px] backdrop-saturate-150"
      style={{ WebkitBackdropFilter: 'saturate(180%) blur(20px)' }}
    >
      <div className="flex items-center gap-9">
        {onMenuClick && (
          <button
            type="button"
            className="header-menu-btn"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
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
          className="flex cursor-pointer select-none items-center gap-3"
        >
          <div className="relative flex h-[34px] w-[34px] items-center justify-center">
            {/* Diamond-shaped mark */}
            <div
              className="absolute h-7 w-7 rounded-md"
              style={{
                background: 'linear-gradient(135deg, #e0a040, #d4943c, #c07c28)',
                transform: 'rotate(45deg)',
                boxShadow: '0 2px 14px rgba(212,148,60,0.35), 0 0 28px rgba(212,148,60,0.12)',
                animation: 'glow 4s ease-in-out infinite',
              }}
            />
            {/* Crack icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
              <path d="M12 3L10 10.5L14 13L12 21"/>
            </svg>
          </div>
          <span
            className="text-[19px] font-extrabold tracking-[-0.01em]"
            style={{
              fontFamily: 'var(--font-ui)',
              background: 'linear-gradient(135deg, var(--text), var(--accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Arena<span style={{ WebkitTextFillColor: 'var(--accent)', color: 'var(--accent)' }}> Mala</span>
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
                className={[
                  'relative flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
                  active
                    ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
                    : 'bg-transparent text-[var(--text3)] hover:bg-[rgba(200,170,120,0.06)] hover:text-[var(--text)]',
                ].join(' ')}
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
                {active && (
                  <span
                    className="absolute -bottom-px left-1/2 h-0.5 w-5 -translate-x-1/2 rounded"
                    style={{ background: 'var(--accent)', boxShadow: '0 0 8px rgba(212,148,60,0.4)' }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {stats && (
          <div className="header-stat-pill flex items-center gap-2 rounded-md border border-[rgba(200,170,120,0.06)] bg-[rgba(200,170,120,0.04)] px-3 py-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: 'var(--green2)',
                animation: 'pulse 2s ease-in-out infinite',
                boxShadow: '0 0 8px rgba(76,175,80,0.4)',
              }}
            />
            <span className="text-[11px] font-medium text-[var(--text3)]" style={{ fontFamily: 'var(--font-mono)' }}>
              {stats.total_analyses?.toLocaleString()} analyses · {stats.malicious_rate}% malicious
            </span>
          </div>
        )}
        <Badge
          variant="primary"
          className="rounded-lg px-3 py-1 text-[10px] font-bold tracking-[0.08em]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          FREE TIER
        </Badge>
      </div>
    </header>
  );
}
