import React, { useState } from 'react';
import { api } from './clientApi';
import { EmptyState, Spinner } from './UI';

export default function IOCSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try { setResults(await api.searchIOC(query.trim())); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-padding-main" style={{ flex: 1, overflowY: 'auto' }}>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>IOC Search</h2>
        <p style={{ color: 'var(--text3)', fontSize: 14 }}>
          Search for indicators of compromise across all analyses
        </p>
      </div>

      <div className="fade-scale delay-1" style={{ display: 'flex', gap: 10, marginBottom: 24, maxWidth: 660 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search IP, domain, URL, hash..."
            style={{
              width: '100%',
              background: 'var(--glass)',
              backdropFilter: 'var(--blur-sm)',
              WebkitBackdropFilter: 'var(--blur-sm)',
              border: '1px solid rgba(200,170,120,0.08)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)', padding: '12px 16px 12px 42px',
              fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none',
              transition: 'all 0.25s cubic-bezier(0.22, 0.68, 0, 1)',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(212,148,60,0.25)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,148,60,0.06), 0 0 30px rgba(212,148,60,0.04)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(200,170,120,0.08)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <button
          onClick={search}
          className="btn-glow"
          style={{
            background: 'linear-gradient(135deg, #e0a040, #c07c28)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius)',
            padding: '12px 22px', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'var(--font-ui)',
            boxShadow: '0 4px 16px rgba(212,148,60,0.25)',
            transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,148,60,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(212,148,60,0.25)'; }}
        >
          Search
        </button>
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>}

      {!loading && searched && !results.length && (
        <EmptyState message="No IOC matches found" sub="Try a different search term or submit more analyses" />
      )}

      {!loading && !searched && (
        <EmptyState message="Search for indicators" sub="Enter an IP, domain, URL, or hash to find matches" />
      )}

      {results.length > 0 && (
        <div className="glass fade-scale" style={{ overflow: 'hidden', padding: 0, maxWidth: 660 }}>
          {results.map((ioc, idx) => (
            <div key={`${ioc.value}-${idx}`} className="fade-up" style={{
              display: 'grid', gridTemplateColumns: '90px 1fr 70px',
              gap: 10, padding: '12px 18px',
              borderBottom: idx < results.length - 1 ? '1px solid rgba(200,170,120,0.04)' : 'none',
              alignItems: 'center', animationDelay: `${idx * 0.04}s`,
            }}>
              <span style={{
                color: 'var(--text4)', textTransform: 'uppercase', fontSize: 9,
                fontWeight: 700, letterSpacing: '0.06em',
                background: 'rgba(200,170,120,0.06)', padding: '3px 8px', borderRadius: 6,
                textAlign: 'center',
              }}>
                {ioc.type}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, wordBreak: 'break-all' }}>{ioc.value}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, textAlign: 'right',
                color: ioc.confidence >= 80 ? 'var(--red)' : ioc.confidence >= 50 ? 'var(--orange)' : 'var(--text3)',
                textShadow: ioc.confidence >= 80 ? '0 0 10px rgba(239,83,80,0.2)' : 'none',
              }}>
                {ioc.confidence}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
