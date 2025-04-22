import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PaymentFlow from './pages/PaymentFlow';
import Security from './pages/Security';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<PaymentFlow />} />
        <Route path="/security" element={<Security />} />
      </Routes>
    </Router>
  );
}

export default App;