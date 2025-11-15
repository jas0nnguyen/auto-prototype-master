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
import BindingCheckout from './pages/binding/Checkout';
import Confirmation from './pages/binding/Confirmation';

// Import portal pages (T121 - Phase 5)
import Dashboard from './pages/portal/Dashboard';
import PersonalInfo from './pages/portal/PersonalInfo';
import VehicleDetails from './pages/portal/VehicleDetails';
import AdditionalDriversPortal from './pages/portal/AdditionalDrivers';
import CoveragePortal from './pages/portal/Coverage';
import Documents from './pages/portal/Documents';
import BillingHistory from './pages/portal/BillingHistory';
import ClaimsList from './pages/portal/ClaimsList';
import FileClaim from './pages/portal/FileClaim';

// Import debug panel (T128 - Phase 6)
import { QuoteDebugPanel } from './components/debug/QuoteDebugPanel';

// Import RouteGuard for flow protection (T048 - Phase 2, Feature 004)
import { RouteGuard } from './components/RouteGuard';

// Import quote-v2 flow pages (Feature 004 - Phase 3)
import GetStarted from './pages/quote-v2/GetStarted';
import EffectiveDate from './pages/quote-v2/EffectiveDate';
import EmailCollection from './pages/quote-v2/EmailCollection';
import LoadingPrefill from './pages/quote-v2/LoadingPrefill';
import Summary from './pages/quote-v2/Summary';

// Import test page for debugging
import { TestCoveragePage } from './pages/TestCoveragePage';
import Coverage from './pages/quote-v2/Coverage';
import AddOns from './pages/quote-v2/AddOns';
import LoadingValidation from './pages/quote-v2/LoadingValidation';
import Review from './pages/quote-v2/Review';

// Import quote-v2 Phase 4 pages (Feature 004 - User Story 2: Payment & Signing)
import Sign from './pages/quote-v2/Sign';
import Checkout from './pages/quote-v2/Checkout';
import Payment from './pages/quote-v2/Payment';
import Processing from './pages/quote-v2/Processing';
import Success from './pages/quote-v2/Success';

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
          <Route path="/binding/checkout/:quoteNumber" element={<BindingCheckout />} />
          <Route path="/binding/confirmation/:quoteNumber" element={<Confirmation />} />
          {/* TODO: Add ReviewBind route when implemented (optional) */}

          {/* Portal Routes (T121 - Phase 5: Self-Service Portal) */}
          <Route path="/portal/:policyNumber" element={<Dashboard />} />
          <Route path="/portal/:policyNumber/personal-info" element={<PersonalInfo />} />
          <Route path="/portal/:policyNumber/vehicles" element={<VehicleDetails />} />
          <Route path="/portal/:policyNumber/drivers" element={<AdditionalDriversPortal />} />
          <Route path="/portal/:policyNumber/coverage" element={<CoveragePortal />} />
          <Route path="/portal/:policyNumber/documents" element={<Documents />} />
          <Route path="/portal/:policyNumber/billing" element={<BillingHistory />} />
          <Route path="/portal/:policyNumber/claims" element={<ClaimsList />} />
          <Route path="/portal/:policyNumber/claims/new" element={<FileClaim />} />

          {/* Quote-v2 Flow Routes (T048 - Feature 004: Tech Startup Flow Redesign) */}
          {/* All routes wrapped in RouteGuard to ensure flow consistency */}
          {/* Quote-v2 Flow Routes (Feature 004 - Tech Startup Progressive Flow) */}
          <Route
            path="/quote-v2/*"
            element={
              <RouteGuard expectedFlow="tech-startup">
                <Routes>
                  {/* Screens 1-4: Progressive data collection (no quote number yet) */}
                  <Route path="get-started" element={<GetStarted />} />
                  <Route path="effective-date" element={<EffectiveDate />} />
                  <Route path="email-collection" element={<EmailCollection />} />
                  <Route path="loading-prefill" element={<LoadingPrefill />} />

                  {/* Screens 5-9: Quote exists, requires :quoteNumber param */}
                  <Route path="summary/:quoteNumber" element={<Summary />} />
                  <Route path="coverage/:quoteNumber" element={<Coverage />} />
                  <Route path="add-ons/:quoteNumber" element={<AddOns />} />
                  <Route path="loading-validation/:quoteNumber" element={<LoadingValidation />} />
                  <Route path="review/:quoteNumber" element={<Review />} />

                  {/* Screens 10-13: Signing ceremony, payment, and processing (Phase 4) */}
                  <Route path="sign/:quoteNumber" element={<Sign />} />
                  <Route path="checkout/:quoteNumber" element={<Checkout />} />
                  <Route path="payment/:quoteNumber" element={<Payment />} />
                  <Route path="processing/:quoteNumber" element={<Processing />} />

                  {/* Catch-all: redirect to start */}
                  <Route path="*" element={<Navigate to="/quote-v2/get-started" replace />} />
                </Routes>
              </RouteGuard>
            }
          />

          {/* Success route - Outside RouteGuard since flow is complete */}
          <Route path="/quote-v2/success/:quoteNumber" element={<Success />} />

          {/* Test page for debugging Medical Payments functionality */}
          <Route path="/test-coverage" element={<TestCoveragePage />} />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      {/* Debug Panel (T128 - Phase 6, dev mode only) */}
      <QuoteDebugPanel />
    </QueryClientProvider>
  );
}

export default App; 