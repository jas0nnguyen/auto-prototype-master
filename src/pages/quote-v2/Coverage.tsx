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

  // Fetch quote data - this will auto-refetch when cache is invalidated
  const { data: quote, isLoading, error } = useQuoteByNumber(quoteNumber);

  // Mutation for updating coverage
  const updateCoverage = useUpdateQuoteCoverage();

  // Coverage state - initialize from quote data
  const [biLiability, setBiLiability] = useState('100000/300000');
  const [pdLiability, setPdLiability] = useState(50000);
  const [medicalPayments, setMedicalPayments] = useState(5000);
  const [isInitialized, setIsInitialized] = useState(false);

  // Per-vehicle coverage state (comprehensive and collision deductibles)
  const [vehicleCoverages, setVehicleCoverages] = useState<Record<number, { comprehensive: number; collision: number }>>({});

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
      if (quote.coverage?.medical_payments_limit !== undefined) {
        setMedicalPayments(quote.coverage.medical_payments_limit);
      }

      // Initialize per-vehicle coverages (default to $500 deductible for both)
      const vehicles = quote.vehicles || [];
      const initialVehicleCoverages: Record<number, { comprehensive: number; collision: number }> = {};
      vehicles.forEach((_: any, index: number) => {
        initialVehicleCoverages[index] = {
          comprehensive: quote.coverage?.comprehensive_deductible || 500,
          collision: quote.coverage?.collision_deductible || 500,
        };
      });
      setVehicleCoverages(initialVehicleCoverages);

      setIsInitialized(true);
    }
  }, [quote, isInitialized]);

  // Debounce coverage changes (300ms)
  const debouncedBiLiability = useDebounce(biLiability, 300);
  const debouncedPdLiability = useDebounce(pdLiability, 300);
  const debouncedMedicalPayments = useDebounce(medicalPayments, 300);

  // For objects, we need to serialize to detect changes properly
  const vehicleCoveragesJson = JSON.stringify(vehicleCoverages);
  console.log('[Coverage] vehicleCoveragesJson:', vehicleCoveragesJson);
  const debouncedVehicleCoveragesJson = useDebounce(vehicleCoveragesJson, 300);
  console.log('[Coverage] debouncedVehicleCoveragesJson:', debouncedVehicleCoveragesJson);

  // Update coverage when debounced values change
  useEffect(() => {
    const debouncedVehicleCoverages = debouncedVehicleCoveragesJson ? JSON.parse(debouncedVehicleCoveragesJson) : {};

    console.log('[Coverage] useEffect triggered', {
      quoteNumber,
      isInitialized,
      debouncedVehicleCoveragesKeys: Object.keys(debouncedVehicleCoverages),
      debouncedVehicleCoverages,
      debouncedBiLiability,
      debouncedPdLiability,
      debouncedMedicalPayments,
    });

    if (!quoteNumber || !isInitialized) {
      console.log('[Coverage] Skipping API call -', { quoteNumber, isInitialized });
      return;
    }

    const updateCoverageData = async () => {
      try {
        // Convert vehicleCoverages object to array format for API
        const vehicleCoveragesArray = Object.entries(debouncedVehicleCoverages).map(([index, coverage]) => ({
          vehicle_index: parseInt(index),
          collision_deductible: coverage.collision,
          comprehensive_deductible: coverage.comprehensive
        }));

        console.log('[Coverage] Calling API with vehicle coverages:', vehicleCoveragesArray);
        console.log('[Coverage] Vehicle coverages array stringified:', JSON.stringify(vehicleCoveragesArray));
        vehicleCoveragesArray.forEach((vc, idx) => {
          console.log(`[Coverage] Vehicle ${idx}: index=${vc.vehicle_index}, collision=${vc.collision_deductible}, comprehensive=${vc.comprehensive_deductible}`);
        });

        const coveragePayload = {
          coverage_bodily_injury_limit: debouncedBiLiability,
          coverage_property_damage_limit: debouncedPdLiability,
          coverage_medical_payments_limit: debouncedMedicalPayments,
          coverage_collision: true,
          coverage_comprehensive: true,
          vehicle_coverages: vehicleCoveragesArray.length > 0 ? vehicleCoveragesArray : undefined,
        };
        console.log('[Coverage] Sending coverage payload:', coveragePayload);
        console.log('[Coverage] Medical Payments value:', debouncedMedicalPayments);

        await updateCoverage.mutateAsync({
          quoteNumber,
          coverageData: coveragePayload
        });

        console.log('[Coverage] API call completed successfully');
      } catch (err) {
        console.error('[Coverage] Error updating coverage:', err);
      }
    };

    updateCoverageData();
  }, [
    debouncedBiLiability,
    debouncedPdLiability,
    debouncedVehicleCoveragesJson, // Use serialized version for proper change detection
    debouncedMedicalPayments,
    quoteNumber,
    isInitialized,
    // NOTE: Do NOT include updateCoverage here - it changes on every render and causes infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Get all vehicles for display
  const vehicles = quote.vehicles || [];
  console.log('[Coverage] Quote vehicles:', vehicles);
  console.log('[Coverage] Vehicle count:', vehicles.length);

  const vehicleDisplay = vehicles.length > 0
    ? vehicles.map((v: any) => `${v.year} ${v.make} ${v.model}`).join(', ')
    : 'No vehicles found';

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
                    onChange={(value) => setBiLiability(value)}
                    options={[
                      { label: '$100,000 / $300,000', value: '100000/300000' },
                      { label: '$300,000 / $500,000', value: '300000/500000' },
                      { label: '$500,000 / $1,000,000', value: '500000/1000000' }
                    ]}
                  />
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
                  Comprehensive and Collision coverage helps repair or replace your vehicle if it's damaged or stolen. Choose your deductible for each vehicle.
                </Text>

                {/* Per-vehicle sliders */}
                {vehicles.map((vehicle: any, index: number) => (
                  <Layout key={index} display="flex-column" gap="medium" padding="medium" style={{ background: '#f7fafc', borderRadius: '12px' }}>
                    <Title variant="title-4">
                      Vehicle {index + 1}: {vehicle.year} {vehicle.make} {vehicle.model}
                    </Title>

                    <Layout display="flex-column" gap="small">
                      <Text variant="body-small" style={{ fontWeight: 600 }}>Comprehensive Deductible</Text>
                      <Text variant="body-small" color="subtle">
                        Covers theft, vandalism, weather damage
                      </Text>
                      <input
                        type="range"
                        min="250"
                        max="1000"
                        step="250"
                        value={vehicleCoverages[index]?.comprehensive || 500}
                        onChange={(e) => {
                          const newValue = Number(e.target.value);
                          console.log(`[Coverage] Vehicle ${index} comprehensive slider changed to:`, newValue);
                          setVehicleCoverages(prev => {
                            const updated = {
                              ...prev,
                              [index]: {
                                ...prev[index],
                                comprehensive: newValue
                              }
                            };
                            console.log('[Coverage] Updated vehicleCoverages:', updated);
                            return updated;
                          });
                        }}
                        style={{ width: '100%' }}
                      />
                      <Text variant="body-regular">
                        ${vehicleCoverages[index]?.comprehensive || 500} deductible
                      </Text>
                    </Layout>

                    <Layout display="flex-column" gap="small">
                      <Text variant="body-small" style={{ fontWeight: 600 }}>Collision Deductible</Text>
                      <Text variant="body-small" color="subtle">
                        Covers damage from accidents
                      </Text>
                      <input
                        type="range"
                        min="250"
                        max="1000"
                        step="250"
                        value={vehicleCoverages[index]?.collision || 500}
                        onChange={(e) => {
                          const newValue = Number(e.target.value);
                          setVehicleCoverages(prev => ({
                            ...prev,
                            [index]: {
                              ...prev[index],
                              collision: newValue
                            }
                          }));
                        }}
                        style={{ width: '100%' }}
                      />
                      <Text variant="body-regular">
                        ${vehicleCoverages[index]?.collision || 500} deductible
                      </Text>
                    </Layout>
                  </Layout>
                ))}
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
            <PriceSidebar quote={quote} isLoading={isLoading} />
          </div>
        </Layout>
      </Container>
    </TechStartupLayout>
  );
};

// Export CoverageContent directly as Coverage
export default CoverageContent;
