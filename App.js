import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import HomePage from './HomePage';
import AnalysisPage from './AnalysisPage';
import PublicFeedPage from './PublicFeedPage';
import IOCSearchPage from './IOCSearchPage';
import ThreatIntelPage from './ThreatIntelPage';

function AppInner() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
      position: 'relative', zIndex: 1,
    }}>
      <div className="arena-bg" />
      <Header onMenuClick={() => setMobileNavOpen(true)} />
      <div style={{
        display: 'flex', flex: 1,
        overflow: 'hidden', minHeight: 0,
        position: 'relative', zIndex: 2,
      }}>
        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <div style={{
          flex: 1, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          minWidth: 0,
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analysis/:id" element={<AnalysisPage />} />
            <Route path="/public" element={<PublicFeedPage />} />
            <Route path="/ioc" element={<IOCSearchPage />} />
            <Route path="/threats" element={<ThreatIntelPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
