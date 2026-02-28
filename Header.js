import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from './clientApi';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
  { path: '/public', label: 'Public Feed', icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
  { path: '/ioc', label: 'IOC Search', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' },
  { path: '/threats', label: 'Threat Intel', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01' },
];

export default function Header() {
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
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 58,
      background: 'rgba(26,20,16,0.6)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      borderBottom: '1px solid rgba(200,170,120,0.06)',
      flexShrink: 0, zIndex: 50,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 11,
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          <div style={{
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            {/* Diamond-shaped mark */}
            <div style={{
              width: 28, height: 28,
              background: 'linear-gradient(135deg, #e0a040, #d4943c, #c07c28)',
              borderRadius: 6,
              transform: 'rotate(45deg)',
              boxShadow: '0 2px 14px rgba(212,148,60,0.35), 0 0 28px rgba(212,148,60,0.12)',
              animation: 'glow 4s ease-in-out infinite',
              position: 'absolute',
            }} />
            {/* Crack icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
              <path d="M12 3L10 10.5L14 13L12 21"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 19,
            letterSpacing: '-0.01em',
            background: 'linear-gradient(135deg, var(--text), var(--accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Arena<span style={{ WebkitTextFillColor: 'var(--accent)', color: 'var(--accent)' }}> Mala</span>
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 3 }}>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  border: 'none',
                  color: active ? 'var(--accent)' : 'var(--text3)',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
                  transition: 'all 0.25s cubic-bezier(0.22, 0.68, 0, 1)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(200,170,120,0.06)'; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent'; }}}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
                {active && (
                  <span style={{
                    position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
                    width: 20, height: 2, borderRadius: 1,
                    background: 'var(--accent)',
                    boxShadow: '0 0 8px rgba(212,148,60,0.4)',
                  }} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {stats && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 12px', borderRadius: 8,
            background: 'rgba(200,170,120,0.04)',
            border: '1px solid rgba(200,170,120,0.06)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--green2)',
              animation: 'pulse 2s ease-in-out infinite',
              boxShadow: '0 0 8px rgba(76,175,80,0.4)',
            }} />
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
              {stats.total_analyses?.toLocaleString()} analyses · {stats.malicious_rate}% malicious
            </span>
          </div>
        )}
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          padding: '4px 12px', borderRadius: 8,
          background: 'var(--accent-dim)', color: 'var(--accent)',
          border: '1px solid rgba(212,148,60,0.12)',
          letterSpacing: '0.08em', fontWeight: 700,
        }}>
          FREE TIER
        </span>
      </div>
    </header>
  );
}
