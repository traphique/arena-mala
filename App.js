import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import HomePage from './HomePage';
import AnalysisPage from './AnalysisPage';
import PublicFeedPage from './PublicFeedPage';
import IOCSearchPage from './IOCSearchPage';
import ThreatIntelPage from './ThreatIntelPage';

function AnimatedBackground() {
  return (
    <div className="arena-bg">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
    </div>
  );
}

function AppInner() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
      position: 'relative', zIndex: 1,
    }}>
      <AnimatedBackground />
      <Header />
      <div style={{
        display: 'flex', flex: 1,
        overflow: 'hidden', minHeight: 0,
        position: 'relative', zIndex: 2,
      }}>
        <Sidebar />
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
