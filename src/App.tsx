import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

// Import quote flow pages (T079)
import PrimaryDriverInfo from './pages/quote/PrimaryDriverInfo';
import AdditionalDrivers from './pages/quote/AdditionalDrivers';
import VehiclesList from './pages/quote/VehiclesList';
import VehicleConfirmation from './pages/quote/VehicleConfirmation';
import CoverageSelection from './pages/quote/CoverageSelection';
import QuoteResults from './pages/quote/QuoteResults';

// Import binding flow pages (T101 - Phase 4)
import Checkout from './pages/binding/Checkout';
import Confirmation from './pages/binding/Confirmation';

/**
 * Create TanStack Query Client
 *
 * This manages all the query caching for the entire app.
 * Created once at the app level and passed down via context.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered "fresh" (5 minutes)
      staleTime: 5 * 60 * 1000,
      // How long unused data stays in cache (10 minutes)
      cacheTime: 10 * 60 * 1000,
      // Don't refetch when window regains focus
      refetchOnWindowFocus: false,
      // Retry failed requests once
      retry: 1,
    },
  },
});

function App() {
  return (
    /**
     * QueryClientProvider makes the query client available to all components
     * Similar to how Router provides routing context
     */
    <QueryClientProvider client={queryClient}>
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

          {/* Quote Flow Routes (Progressive Quote Creation with URL-based navigation) */}
          <Route path="/quote/driver-info" element={<PrimaryDriverInfo />} />
          <Route path="/quote/driver-info/:quoteNumber" element={<PrimaryDriverInfo />} />
          <Route path="/quote/additional-drivers/:quoteNumber" element={<AdditionalDrivers />} />
          <Route path="/quote/vehicles/:quoteNumber" element={<VehiclesList />} />
          <Route path="/quote/vehicle-confirmation/:quoteNumber" element={<VehicleConfirmation />} />
          <Route path="/quote/coverage-selection/:quoteNumber" element={<CoverageSelection />} />
          <Route path="/quote/results/:quoteNumber" element={<QuoteResults />} />

          {/* Binding Flow Routes (T101 - Phase 4: Policy Binding & Payment) */}
          <Route path="/binding/checkout/:quoteNumber" element={<Checkout />} />
          <Route path="/binding/confirmation/:quoteNumber" element={<Confirmation />} />
          {/* TODO: Add ReviewBind route when implemented (optional) */}

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App; 