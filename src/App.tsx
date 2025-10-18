import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import LandingPage from './pages/LandingPage';
import GettingStartedPage from './pages/GettingStartedPage';
import CoveragePage from './pages/CoveragePage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<HomePage />} />
        
        {/* Examples routes */}
        <Route path="/examples/landing-page" element={<LandingPage />} />
        
        {/* Add more example routes here as we build them */}
        <Route path="/examples/getting-started" element={<GettingStartedPage />} />
        <Route path="/examples/coverage" element={<CoveragePage />} />
        <Route path="/examples/checkout" element={<CheckoutPage />} />
        <Route path="/examples/confirmation" element={<ConfirmationPage />} />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 