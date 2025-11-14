import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestCard } from '../../components/everest/core/EverestCard';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestButton } from '../../components/everest/core/EverestButton';
import { EverestSelect } from '../../components/everest/core/EverestSelect';
import { EverestSlider } from '../../components/everest/specialized/EverestSlider';
import { EverestPriceSidebar } from '../../components/everest/specialized/EverestPriceSidebar';
import { useQuoteByNumber, useUpdateQuoteCoverage } from '../../hooks/useQuote';
import './Coverage.css';

/**
 * Coverage Screen (Screen 06 of 16) - Everest Design
 *
 * Coverage selection with three sections:
 * 1. Protect You & Loved Ones (Bodily Injury, Medical Payments, UM/UIM)
 * 2. Protect Your Assets (Property Damage Liability)
 * 3. Protect Your Vehicles (Comprehensive, Collision per vehicle)
 *
 * Design:
 * - Two-column layout with EverestPriceSidebar
 * - Coverage sections in EverestCards
 * - EverestSelect for liability limits
 * - EverestSlider for deductibles and limits
 * - Real-time premium updates with debouncing (300ms)
 * - Per-vehicle comprehensive and collision sliders
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

const Coverage: React.FC = () => {
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

      // Parse BI liability from quote
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
  const debouncedVehicleCoveragesJson = useDebounce(vehicleCoveragesJson, 300);

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
    debouncedVehicleCoveragesJson,
    debouncedMedicalPayments,
    debouncedUmbiLimit,
    debouncedUimbiLimit,
    quoteNumber,
    isInitialized,
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
      <EverestLayout>
        <EverestContainer>
          <div className="coverage-loading">
            <EverestTitle variant="h2">Loading coverage options...</EverestTitle>
          </div>
        </EverestContainer>
      </EverestLayout>
    );
  }

  // Error state
  if (error || !quote) {
    return (
      <EverestLayout>
        <EverestContainer>
          <div className="coverage-error">
            <EverestTitle variant="h2">Error Loading Quote</EverestTitle>
            <EverestButton variant="primary" onClick={() => navigate('/quote-v2/get-started')}>
              Start Over
            </EverestButton>
          </div>
        </EverestContainer>
      </EverestLayout>
    );
  }

  // Get all vehicles for display
  const vehicles = quote.vehicles || [];
  console.log('[Coverage] Quote vehicles:', vehicles);

  return (
    <EverestLayout>
      <EverestContainer>
        <div className="coverage-layout">
          {/* Main Content */}
          <div className="coverage-main">
            <div className="coverage-header">
              <EverestTitle variant="h2">Customize Your Coverage</EverestTitle>
              <EverestText variant="subtitle">
                Select the coverage levels that work best for you
              </EverestText>
            </div>

            {/* Section 1: Protect You & Loved Ones */}
            <EverestCard>
              <div className="coverage-section">
                <EverestTitle variant="h3">Protect You & Loved Ones</EverestTitle>

                <div className="coverage-item">
                  <EverestTitle variant="h4">Bodily Injury Liability</EverestTitle>
                  <EverestText variant="body">
                    Accidents happen. So do injuries to other people. Help protect yourself in the event you're found at fault.
                  </EverestText>
                  <EverestSelect
                    label="Coverage Limit"
                    value={biLiability}
                    onChange={(e) => setBiLiability(e.target.value)}
                    options={[
                      { label: '$100,000 / $300,000', value: '100000/300000' },
                      { label: '$300,000 / $500,000', value: '300000/500000' },
                      { label: '$500,000 / $1,000,000', value: '500000/1000000' }
                    ]}
                  />
                </div>

                <div className="coverage-item">
                  <EverestTitle variant="h4">Medical Payments</EverestTitle>
                  <EverestText variant="body">
                    These coverages can help cover medical costs wherever someone you love is injured.
                  </EverestText>
                  <EverestSlider
                    label="Coverage Limit"
                    min={1000}
                    max={10000}
                    step={1000}
                    value={medicalPayments}
                    onChange={setMedicalPayments}
                    formatValue={(value) => `$${value.toLocaleString()} per person`}
                  />
                </div>

                <div className="coverage-item">
                  <EverestTitle variant="h4">Uninsured Motorist Bodily Injury</EverestTitle>
                  <EverestText variant="body">
                    That pain in your back is not just from the accident – it's also from finding out that the person who hit you has no insurance.
                  </EverestText>
                  <EverestSelect
                    label="Coverage Limit"
                    value={umbiLimit}
                    onChange={(e) => setUmbiLimit(e.target.value)}
                    options={[
                      { label: '$100,000 / $300,000', value: '100000/300000' },
                      { label: '$300,000 / $500,000', value: '300000/500000' },
                      { label: '$500,000 / $1,000,000', value: '500000/1000000' }
                    ]}
                  />
                  <EverestText variant="small" className="coverage-recommendation">
                    Limit recommended
                  </EverestText>
                </div>

                <div className="coverage-item">
                  <EverestTitle variant="h4">Underinsured Motorist Bodily Injury</EverestTitle>
                  <EverestText variant="body">
                    If you or your passenger is injured in an accident and the driver at fault has insurance but not quite enough, this coverage can help make up the difference.
                  </EverestText>
                  <EverestSelect
                    label="Coverage Limit"
                    value={uimbiLimit}
                    onChange={(e) => setUimbiLimit(e.target.value)}
                    options={[
                      { label: '$100,000 / $300,000', value: '100000/300000' },
                      { label: '$300,000 / $500,000', value: '300000/500000' },
                      { label: '$500,000 / $1,000,000', value: '500000/1000000' }
                    ]}
                  />
                  <EverestText variant="small" className="coverage-recommendation">
                    Limit recommended
                  </EverestText>
                </div>
              </div>
            </EverestCard>

            {/* Section 2: Protect Your Assets */}
            <EverestCard>
              <div className="coverage-section">
                <EverestTitle variant="h3">Protect Your Assets</EverestTitle>
                <EverestText variant="body">
                  These coverages help protect you and your assets from damages that you caused.
                </EverestText>

                <div className="coverage-item">
                  <EverestTitle variant="h4">Property Damage Liability</EverestTitle>
                  <EverestText variant="body">
                    You don't really get to pick which car you accidentally rear-end – whether it's a beater or a Bentley, this coverage can help.
                  </EverestText>
                  <EverestSlider
                    label="Coverage Limit"
                    min={25000}
                    max={100000}
                    step={25000}
                    value={pdLiability}
                    onChange={setPdLiability}
                    formatValue={(value) => `$${value.toLocaleString()}`}
                  />
                </div>
              </div>
            </EverestCard>

            {/* Section 3: Protect Your Vehicles */}
            <EverestCard>
              <div className="coverage-section">
                <EverestTitle variant="h3">Protect Your Vehicles</EverestTitle>
                <EverestText variant="body">
                  How important is your car to you? These coverages will help get you back on the road if something happens to it.
                </EverestText>

                {/* Per-vehicle sliders */}
                {vehicles.map((vehicle: any, index: number) => (
                  <div key={index} className="coverage-vehicle">
                    <EverestTitle variant="h4">
                      Vehicle {index + 1}: {vehicle.year} {vehicle.make} {vehicle.model}
                    </EverestTitle>

                    <div className="coverage-item">
                      <EverestText variant="label">Comprehensive Deductible</EverestText>
                      <EverestText variant="small">
                        Covers theft, vandalism, weather damage
                      </EverestText>
                      <EverestSlider
                        min={250}
                        max={1000}
                        step={250}
                        value={vehicleCoverages[index]?.comprehensive || 500}
                        onChange={(value) => {
                          console.log(`[Coverage] Vehicle ${index} comprehensive slider changed to:`, value);
                          setVehicleCoverages(prev => {
                            const updated = {
                              ...prev,
                              [index]: {
                                ...prev[index],
                                comprehensive: value
                              }
                            };
                            console.log('[Coverage] Updated vehicleCoverages:', updated);
                            return updated;
                          });
                        }}
                        formatValue={(value) => `$${value} deductible`}
                      />
                    </div>

                    <div className="coverage-item">
                      <EverestText variant="label">Collision Deductible</EverestText>
                      <EverestText variant="small">
                        Covers damage from accidents
                      </EverestText>
                      <EverestSlider
                        min={250}
                        max={1000}
                        step={250}
                        value={vehicleCoverages[index]?.collision || 500}
                        onChange={(value) => {
                          setVehicleCoverages(prev => ({
                            ...prev,
                            [index]: {
                              ...prev[index],
                              collision: value
                            }
                          }));
                        }}
                        formatValue={(value) => `$${value} deductible`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </EverestCard>

            {/* Navigation Buttons */}
            <div className="coverage-actions">
              <EverestButton
                type="button"
                variant="secondary"
                size="large"
                onClick={handleBack}
              >
                Back
              </EverestButton>
              <EverestButton
                type="button"
                variant="primary"
                size="large"
                onClick={handleContinue}
              >
                Continue
              </EverestButton>
            </div>
          </div>

          {/* Price Sidebar */}
          <div className="coverage-sidebar">
            <EverestPriceSidebar quote={quote} />
          </div>
        </div>
      </EverestContainer>
    </EverestLayout>
  );
};

export default Coverage;
