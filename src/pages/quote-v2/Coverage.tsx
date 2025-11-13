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
  const { data: quote, isLoading, error } = useQuoteByNumber(quoteNumber) as {
    data: any;
    isLoading: boolean;
    error: any;
  };

  // Mutation for updating coverage
  const updateCoverage = useUpdateQuoteCoverage();

  // Coverage state - initialize from quote data
  const [biLiability, setBiLiability] = useState('100000/300000');
  const [pdLiability, setPdLiability] = useState(50000);
  const [medicalPayments, setMedicalPayments] = useState(5000);
  const [umbiLimit, setUmbiLimit] = useState('100000/300000');
  const [uimbiLimit, setUimbiLimit] = useState('100000/300000');
  const [isInitialized, setIsInitialized] = useState(false);

  // Per-vehicle coverage state (comprehensive and collision deductibles)
  const [vehicleCoverages, setVehicleCoverages] = useState<Record<number, { comprehensive: number; collision: number }>>({});

  // Track the last quote number we initialized from to prevent re-initialization loops
  const [lastInitializedQuoteNumber, setLastInitializedQuoteNumber] = useState<string | null>(null);

  // Initialize coverage values from quote
  useEffect(() => {
    // Only initialize if we have a quote and either:
    // 1. We haven't initialized yet (!isInitialized), OR
    // 2. The quote number has changed (user went back and forward)
    const shouldInitialize = quote && (
      !isInitialized ||
      (quote.quote_number && quote.quote_number !== lastInitializedQuoteNumber)
    );

    if (shouldInitialize) {
      const coverages = quote.coverages || {};

      console.log('[Coverage] Initializing from quote:', {
        quoteNumber: quote.quote_number,
        coverages,
        bodilyInjuryLimit: coverages.bodilyInjuryLimit,
        propertyDamageLimit: coverages.propertyDamageLimit,
        medicalPaymentsLimit: coverages.medicalPaymentsLimit,
        collisionDeductible: coverages.collisionDeductible,
        comprehensiveDeductible: coverages.comprehensiveDeductible,
        vehicleCoverages: coverages.vehicleCoverages,
      });

      // Parse BI liability from quote (use coverages, not coverage)
      if (coverages.bodilyInjuryLimit) {
        setBiLiability(coverages.bodilyInjuryLimit);
      }
      if (coverages.propertyDamageLimit !== undefined && coverages.propertyDamageLimit !== null) {
        // Handle both string and number formats
        const pdLimit = typeof coverages.propertyDamageLimit === 'string'
          ? parseInt(coverages.propertyDamageLimit.replace(/\D/g, ''))
          : coverages.propertyDamageLimit;
        setPdLiability(pdLimit);
      }
      if (coverages.medicalPaymentsLimit !== undefined && coverages.medicalPaymentsLimit !== null) {
        setMedicalPayments(coverages.medicalPaymentsLimit);
      }
      if (coverages.uninsuredMotoristBodilyInjury) {
        setUmbiLimit(coverages.uninsuredMotoristBodilyInjury);
      }
      if (coverages.underinsuredMotoristBodilyInjury) {
        setUimbiLimit(coverages.underinsuredMotoristBodilyInjury);
      }

      // Initialize per-vehicle coverages from saved data or defaults
      const vehicles = quote.vehicles || [];
      const initialVehicleCoverages: Record<number, { comprehensive: number; collision: number }> = {};

      // Check if we have saved vehicle coverages in the quote
      const savedVehicleCoverages = coverages.vehicleCoverages;

      vehicles.forEach((_: any, index: number) => {
        // Try to find saved coverage for this vehicle index
        const savedCoverage = savedVehicleCoverages?.find((vc: any) => vc.vehicle_index === index);

        initialVehicleCoverages[index] = {
          comprehensive: savedCoverage?.comprehensive_deductible
            || coverages.comprehensiveDeductible
            || 500,
          collision: savedCoverage?.collision_deductible
            || coverages.collisionDeductible
            || 500,
        };
      });

      console.log('[Coverage] Initialized vehicle coverages:', initialVehicleCoverages);
      setVehicleCoverages(initialVehicleCoverages);

      setIsInitialized(true);
      setLastInitializedQuoteNumber(quote.quote_number);
    }
  }, [quote, isInitialized, lastInitializedQuoteNumber]);

  // Debounce coverage changes (300ms)
  const debouncedBiLiability = useDebounce(biLiability, 300);
  const debouncedPdLiability = useDebounce(pdLiability, 300);
  const debouncedMedicalPayments = useDebounce(medicalPayments, 300);
  const debouncedUmbiLimit = useDebounce(umbiLimit, 300);
  const debouncedUimbiLimit = useDebounce(uimbiLimit, 300);

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
        const vehicleCoveragesArray = Object.entries(debouncedVehicleCoverages).map(([index, coverage]: [string, any]) => ({
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
          coverage_uninsured_motorist_bodily_injury: debouncedUmbiLimit,
          coverage_underinsured_motorist_bodily_injury: debouncedUimbiLimit,
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
    debouncedUmbiLimit,
    debouncedUimbiLimit,
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
                    Accidents happen. So do injuries to other people. Help protect yourself in the event you're found at fault.
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
                    These coverages can help cover medical costs wherever someone you love is injured. If that happens, though, this coverage can help lessen the impact to your wallet or theirs.
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

                <Layout display="flex-column" gap="small">
                  <Title variant="title-4">Uninsured Motorist Bodily Injury</Title>
                  <Text variant="body-regular" color="subtle">
                    That pain is you're not back is not just from the accident – it's also from finding out that the person who hit you has no insurance. This coverage can help.
                  </Text>
                  <Select
                    label="Coverage Limit"
                    value={umbiLimit}
                    onChange={(value) => setUmbiLimit(value)}
                    options={[
                      { label: '$100,000 / $300,000', value: '100000/300000' },
                      { label: '$300,000 / $500,000', value: '300000/500000' },
                      { label: '$500,000 / $1,000,000', value: '500000/1000000' }
                    ]}
                  />
                  <Text variant="body-small" color="subtle" style={{ fontStyle: 'italic' }}>
                    Limit recommended
                  </Text>
                </Layout>

                <Layout display="flex-column" gap="small">
                  <Title variant="title-4">Underinsured Motorist Bodily Injury</Title>
                  <Text variant="body-regular" color="subtle">
                    If you or your passenger is injured in an accident and the driver at fault has insurance but not quite enough, this coverage can help make up the difference.
                  </Text>
                  <Select
                    label="Coverage Limit"
                    value={uimbiLimit}
                    onChange={(value) => setUimbiLimit(value)}
                    options={[
                      { label: '$100,000 / $300,000', value: '100000/300000' },
                      { label: '$300,000 / $500,000', value: '300000/500000' },
                      { label: '$500,000 / $1,000,000', value: '500000/1000000' }
                    ]}
                  />
                  <Text variant="body-small" color="subtle" style={{ fontStyle: 'italic' }}>
                    Limit recommended
                  </Text>
                </Layout>
              </Layout>

              {/* Section 2: Protect Your Assets */}
              <Layout display="flex-column" gap="medium" padding="medium" style={{ border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                <Title variant="title-3">Protect Your Assets</Title>
                <Text variant="body-regular" color="subtle">
                  These coverages help protect you and your assets from damages that you caused. They can be the difference between a bad day and a bad decade.
                </Text>

                <Layout display="flex-column" gap="small">
                  <Title variant="title-4">Property Damage Liability</Title>
                  <Text variant="body-regular" color="subtle">
                    You don't really get to pick which car you accidentally rear-end – whether it's a beater or a Bentley, this coverage can help.
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
                  How important is your car to you? How much do you depend on it? If something happens to it, these coverages will help get you back on the road. We've combined these coverages because if you'd need to worry about the intricacy of whether that storm, fender bender, and broken windshield are just a few examples. Required coverage for leased or financed vehicles.
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
