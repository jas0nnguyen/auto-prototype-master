import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import LandingPage from './pages/LandingPage';
import GettingStartedPage from './pages/GettingStartedPage';
import CoveragePage from './pages/CoveragePage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AutoInsuranceLandingPage from './pages/AutoInsuranceLandingPage';
import AutoInsuranceGettingStartedPage from './pages/AutoInsuranceGettingStartedPage';
import AutoInsuranceCoveragePage from './pages/AutoInsuranceCoveragePage';
import AutoInsuranceCheckoutPage from './pages/AutoInsuranceCheckoutPage';
import AutoInsuranceConfirmationPage from './pages/AutoInsuranceConfirmationPage';

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

        {/* Auto Insurance Flow */}
        <Route path="/auto-insurance/landing" element={<AutoInsuranceLandingPage />} />
        <Route path="/auto-insurance/getting-started" element={<AutoInsuranceGettingStartedPage />} />
        <Route path="/auto-insurance/coverage" element={<AutoInsuranceCoveragePage />} />
        <Route path="/auto-insurance/checkout" element={<AutoInsuranceCheckoutPage />} />
        <Route path="/auto-insurance/confirmation" element={<AutoInsuranceConfirmationPage />} />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 