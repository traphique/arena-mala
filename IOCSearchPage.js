import React, { useState } from 'react';
import { api } from './clientApi';
import { EmptyState, Spinner } from './UI';

const IOC_TYPE_COLOR = {
  ip: 'var(--amber)', domain: 'var(--purple)', url: 'var(--cyan)',
  md5: 'var(--orange)', sha1: 'var(--orange)', sha256: 'var(--orange)',
  filepath: 'var(--text3)', registry: 'var(--text3)', email: 'var(--green)',
};

export default function IOCSearchPage() {
  const [query, setQuery]     = useState('');
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
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, marginBottom: 4 }}>IOC Search</h2>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>
          Search indicators of compromise across all analyses
        </p>
      </div>

      {/* Search bar */}
      <div className="fade-scale delay-1" style={{ display: 'flex', gap: 8, marginBottom: 24, maxWidth: 640 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search IP, domain, URL, MD5, SHA256..."
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)', padding: '11px 14px 11px 40px',
              fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
          />
        </div>
        <button
          onClick={search}
          style={{
            background: 'var(--amber)', border: 'none',
            borderRadius: 'var(--radius)', padding: '11px 22px',
            color: '#fff', fontWeight: 600, fontSize: 13,
            fontFamily: 'var(--font-ui)', cursor: 'pointer',
            boxShadow: 'var(--shadow-amber)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--amber2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--amber)'; }}
        >
          Search
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
      )}

      {!loading && searched && !results.length && (
        <EmptyState message="No matches found" sub="Try a different term or submit more analyses to build the IOC database" />
      )}

      {!loading && !searched && (
        <div style={{
          maxWidth: 640,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '32px',
          textAlign: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Search for indicators</div>
          <div style={{ fontSize: 12, color: 'var(--text4)' }}>Enter an IP, domain, URL, or file hash to search across all analyses</div>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ maxWidth: 640 }}>
          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '90px 1fr 70px',
            gap: 12, padding: '8px 16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          }}>
            {['Type', 'Value', 'Confidence'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)', borderTop: 'none',
            borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
            overflow: 'hidden',
          }}>
            {results.map((ioc, idx) => (
              <div key={`${ioc.value}-${idx}`} className="fade-up" style={{
                display: 'grid', gridTemplateColumns: '90px 1fr 70px',
                gap: 12, padding: '10px 16px',
                borderBottom: idx < results.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                alignItems: 'center', animationDelay: `${idx * 0.03}s`,
              }}>
                <span style={{
                  textTransform: 'uppercase', fontSize: 9,
                  fontWeight: 700, letterSpacing: '0.05em',
                  fontFamily: 'var(--font-mono)',
                  color: IOC_TYPE_COLOR[ioc.type?.toLowerCase()] || 'var(--text3)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '3px 7px', borderRadius: 4, textAlign: 'center',
                }}>
                  {ioc.type}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, wordBreak: 'break-all', color: 'var(--text)' }}>{ioc.value}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, textAlign: 'right',
                  color: ioc.confidence >= 80 ? 'var(--red)' : ioc.confidence >= 50 ? 'var(--orange)' : 'var(--text3)',
                }}>
                  {ioc.confidence}%
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text4)', fontFamily: 'var(--font-mono)' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </div>
        </div>
      )}
    </div>
  );
}
