import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Layout,
  Container,
  Title,
  Text,
  Select,
  Button
} from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { PriceSidebar } from './components/PriceSidebar';
import { ScreenProgress } from './components/ScreenProgress';
import { QuoteProvider } from './contexts/QuoteContext';
import { useQuoteByNumber, useUpdateQuoteCoverage } from '../../hooks/useQuote';

/**
 * Coverage Screen (Screen 06 of 19) - T096
 *
 * Coverage selection with three sections:
 * 1. Protect You & Loved Ones (Bodily Injury, Medical Payments)
 * 2. Protect Your Assets (Property Damage Liability)
 * 3. Protect Your Vehicles (Comprehensive, Collision per vehicle)
 *
 * Features:
 * - BI Liability dropdown with 3 options
 * - PD Liability slider
 * - Comprehensive/Collision sliders per vehicle
 * - Medical Payments slider
 * - Real-time premium updates in PriceSidebar with debouncing (300ms)
 */

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const CoverageContent: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  // Fetch quote data
  const { data: quote, isLoading, error } = useQuoteByNumber(quoteNumber);

  // Mutation for updating coverage
  const updateCoverage = useUpdateQuoteCoverage();

  // Coverage state - initialize from quote data
  const [biLiability, setBiLiability] = useState('100000/300000');
  const [pdLiability, setPdLiability] = useState(50000);
  const [comprehensive, setComprehensive] = useState(500);
  const [collision, setCollision] = useState(500);
  const [medicalPayments, setMedicalPayments] = useState(5000);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize coverage values from quote
  useEffect(() => {
    if (quote && !isInitialized) {
      // Parse BI liability from quote
      if (quote.coverage?.bodily_injury_limit) {
        setBiLiability(quote.coverage.bodily_injury_limit);
      }
      if (quote.coverage?.property_damage_limit !== undefined) {
        setPdLiability(quote.coverage.property_damage_limit);
      }
      if (quote.coverage?.collision_deductible !== undefined) {
        setCollision(quote.coverage.collision_deductible);
      }
      if (quote.coverage?.comprehensive_deductible !== undefined) {
        setComprehensive(quote.coverage.comprehensive_deductible);
      }
      if (quote.coverage?.medical_payments_limit !== undefined) {
        setMedicalPayments(quote.coverage.medical_payments_limit);
      }
      setIsInitialized(true);
    }
  }, [quote, isInitialized]);

  // Debounce coverage changes (300ms)
  const debouncedBiLiability = useDebounce(biLiability, 300);
  const debouncedPdLiability = useDebounce(pdLiability, 300);
  const debouncedComprehensive = useDebounce(comprehensive, 300);
  const debouncedCollision = useDebounce(collision, 300);
  const debouncedMedicalPayments = useDebounce(medicalPayments, 300);

  // Update coverage when debounced values change
  useEffect(() => {
    if (!quoteNumber || !isInitialized) return;

    const updateCoverageData = async () => {
      try {
        await updateCoverage.mutateAsync({
          quoteNumber,
          coverageData: {
            coverage_bodily_injury_limit: debouncedBiLiability,
            coverage_property_damage_limit: debouncedPdLiability,
            coverage_collision: true,
            coverage_collision_deductible: debouncedCollision,
            coverage_comprehensive: true,
            coverage_comprehensive_deductible: debouncedComprehensive,
          }
        });
      } catch (err) {
        console.error('[Coverage] Error updating coverage:', err);
      }
    };

    updateCoverageData();
  }, [
    debouncedBiLiability,
    debouncedPdLiability,
    debouncedComprehensive,
    debouncedCollision,
    debouncedMedicalPayments,
    quoteNumber,
    isInitialized,
    updateCoverage
  ]);

  const handleContinue = () => {
    navigate(`/quote-v2/add-ons/${quoteNumber}`);
  };

  const handleBack = () => {
    navigate(`/quote-v2/summary/${quoteNumber}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={6} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center" flexJustify="center">
            <Title variant="title-2">Loading coverage options...</Title>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  // Error state
  if (error || !quote) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={6} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center">
            <Title variant="title-2" color="error">Error Loading Quote</Title>
            <Button variant="primary" onClick={() => navigate('/quote-v2/get-started')}>
              Start Over
            </Button>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  // Get first vehicle for display
  const firstVehicle = quote.vehicles?.[0];
  const vehicleDisplay = firstVehicle
    ? `${firstVehicle.year} ${firstVehicle.make} ${firstVehicle.model}`
    : 'Vehicle';

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={6} totalScreens={19} />

      <Container padding="large">
        <Layout display="flex" gap="large">
          {/* Main Content */}
          <div style={{ flex: 1 }}>
            <Layout display="flex-column" gap="large">
              <Title variant="display-2">Customize Your Coverage</Title>

              <Text variant="body-large" color="subtle">
                Select the coverage levels that work best for you
              </Text>

              {/* Section 1: Protect You & Loved Ones */}
              <Layout display="flex-column" gap="medium" padding="medium" style={{ border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                <Title variant="title-3">Protect You & Loved Ones</Title>

                <Layout display="flex-column" gap="small">
                  <Title variant="title-4">Bodily Injury Liability</Title>
                  <Text variant="body-regular" color="subtle">
                    Covers injuries to others in an accident you cause
                  </Text>
                  <Select
                    label="Coverage Limit"
                    value={biLiability}
                    onChange={(e) => setBiLiability(e.target.value)}
                  >
                    <option value="100000/300000">$100,000 / $300,000</option>
                    <option value="300000/500000">$300,000 / $500,000</option>
                    <option value="500000/1000000">$500,000 / $1,000,000</option>
                  </Select>
                </Layout>

                <Layout display="flex-column" gap="small">
                  <Title variant="title-4">Medical Payments</Title>
                  <Text variant="body-regular" color="subtle">
                    Covers medical expenses for you and your passengers
                  </Text>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="1000"
                    value={medicalPayments}
                    onChange={(e) => setMedicalPayments(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <Text variant="body-regular">
                    ${medicalPayments.toLocaleString()} per person
                  </Text>
                </Layout>
              </Layout>

              {/* Section 2: Protect Your Assets */}
              <Layout display="flex-column" gap="medium" padding="medium" style={{ border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                <Title variant="title-3">Protect Your Assets</Title>

                <Layout display="flex-column" gap="small">
                  <Title variant="title-4">Property Damage Liability</Title>
                  <Text variant="body-regular" color="subtle">
                    Covers damage to others' property in an accident you cause
                  </Text>
                  <input
                    type="range"
                    min="25000"
                    max="100000"
                    step="25000"
                    value={pdLiability}
                    onChange={(e) => setPdLiability(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <Text variant="body-regular">
                    ${pdLiability.toLocaleString()}
                  </Text>
                </Layout>
              </Layout>

              {/* Section 3: Protect Your Vehicles */}
              <Layout display="flex-column" gap="medium" padding="medium" style={{ border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                <Title variant="title-3">Protect Your Vehicles</Title>

                <Text variant="body-regular" color="subtle">
                  {vehicleDisplay}
                </Text>

                <Layout display="flex-column" gap="small">
                  <Title variant="title-4">Comprehensive Deductible</Title>
                  <Text variant="body-small" color="subtle">
                    Covers theft, vandalism, weather damage
                  </Text>
                  <input
                    type="range"
                    min="250"
                    max="1000"
                    step="250"
                    value={comprehensive}
                    onChange={(e) => setComprehensive(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <Text variant="body-regular">${comprehensive} deductible</Text>
                </Layout>

                <Layout display="flex-column" gap="small">
                  <Title variant="title-4">Collision Deductible</Title>
                  <Text variant="body-small" color="subtle">
                    Covers damage from accidents
                  </Text>
                  <input
                    type="range"
                    min="250"
                    max="1000"
                    step="250"
                    value={collision}
                    onChange={(e) => setCollision(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <Text variant="body-regular">${collision} deductible</Text>
                </Layout>
              </Layout>

              {/* Navigation Buttons */}
              <Layout display="flex" gap="medium" flexJustify="space-between" padding={{ top: 'medium' }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="large"
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              </Layout>
            </Layout>
          </div>

          {/* Price Sidebar */}
          <div style={{ width: '320px' }}>
            <PriceSidebar />
          </div>
        </Layout>
      </Container>
    </TechStartupLayout>
  );
};

/**
 * Coverage Component Wrapper with QuoteProvider
 */
const Coverage: React.FC = () => {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const { data: quote } = useQuoteByNumber(quoteNumber);

  if (!quote) {
    return <CoverageContent />;
  }

  return (
    <QuoteProvider quoteId={quote.quoteId}>
      <CoverageContent />
    </QuoteProvider>
  );
};

export default Coverage;
