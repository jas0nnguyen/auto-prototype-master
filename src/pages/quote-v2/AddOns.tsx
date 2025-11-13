import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Layout,
  Container,
  Title,
  Text,
  Button
} from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { PriceSidebar } from './components/PriceSidebar';
import { ScreenProgress } from './components/ScreenProgress';
import { QuoteProvider } from './contexts/QuoteContext';
import { useQuoteByNumber, useUpdateQuoteCoverage } from '../../hooks/useQuote';

/**
 * Custom hook for debouncing values
 */
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

/**
 * AddOns Screen (Screen 07 of 19) - T097
 *
 * Optional coverage add-ons (per-vehicle):
 * - Rental Reimbursement (toggle per vehicle)
 * - Additional Equipment Coverage (amount selector per vehicle)
 * - Original Parts Replacement (toggle per vehicle)
 * - Roadside Assistance (always included, shown for all vehicles)
 *
 * Features:
 * - Per-vehicle toggle switches for add-ons
 * - Additional Equipment has amount buttons ($1,000 or $5,000)
 * - Roadside shown as "Always On" (checked + disabled)
 * - Real-time premium updates via API
 * - Descriptions from reference design
 */

const AddOnsContent: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  // Fetch quote data
  const { data: quote, isLoading, error } = useQuoteByNumber(quoteNumber) as {
    data: any;
    isLoading: boolean;
    error: any;
  };

  // Mutation for updating coverage
  const updateCoverage = useUpdateQuoteCoverage();

  // Per-vehicle add-ons state
  // Structure: { [vehicleIndex]: { rental_reimbursement, additional_equipment_amount, original_parts_replacement } }
  const [vehicleAddOns, setVehicleAddOns] = useState<Record<number, {
    rental_reimbursement: boolean;
    additional_equipment_amount: number | null;
    original_parts_replacement: boolean;
  }>>({});

  const [isInitialized, setIsInitialized] = useState(false);
  const [lastInitializedQuoteNumber, setLastInitializedQuoteNumber] = useState<string | null>(null);

  // Get vehicles from quote
  const vehicles = quote?.vehicles || [];

  // Initialize add-ons from quote (load saved selections or use defaults)
  useEffect(() => {
    // Only initialize if we have a quote with vehicles and either:
    // 1. We haven't initialized yet, OR
    // 2. The quote number has changed (user navigated back with different quote)
    const shouldInitialize = quote && vehicles.length > 0 && (
      !isInitialized ||
      (quote.quote_number && quote.quote_number !== lastInitializedQuoteNumber)
    );

    if (shouldInitialize) {
      const savedVehicleAddOns = quote.vehicleAddOns || [];

      console.log('[AddOns] Initializing from quote:', {
        quoteNumber: quote.quote_number,
        savedVehicleAddOns,
        vehicles: vehicles.length,
      });

      const initialAddOns: typeof vehicleAddOns = {};
      vehicles.forEach((_vehicle: any, index: number) => {
        // Try to find saved add-ons for this vehicle index
        const savedAddOn = savedVehicleAddOns.find((addon: any) => addon.vehicle_index === index);

        initialAddOns[index] = {
          rental_reimbursement: savedAddOn?.rental_reimbursement || false,
          additional_equipment_amount: savedAddOn?.additional_equipment_amount || null,
          original_parts_replacement: savedAddOn?.original_parts_replacement || false,
        };
      });

      console.log('[AddOns] Initialized vehicle add-ons:', initialAddOns);
      setVehicleAddOns(initialAddOns);
      setIsInitialized(true);
      setLastInitializedQuoteNumber(quote.quote_number);
    }
  }, [quote, vehicles.length, isInitialized, lastInitializedQuoteNumber]);

  // Serialize vehicleAddOns for debouncing
  const vehicleAddOnsJson = JSON.stringify(vehicleAddOns);
  const debouncedVehicleAddOnsJson = useDebounce(vehicleAddOnsJson, 300);

  // Update add-ons when debounced values change
  useEffect(() => {
    if (!quoteNumber || !isInitialized) return;

    const updateAddOns = async () => {
      try {
        // Convert vehicleAddOns object to array
        const debouncedAddOns = JSON.parse(debouncedVehicleAddOnsJson);
        const vehicleAddOnsArray = Object.keys(debouncedAddOns).map((key) => {
          const idx = parseInt(key, 10);
          return {
            vehicle_index: idx,
            ...debouncedAddOns[idx],
          };
        });

        console.log('[AddOns] Updating add-ons:', vehicleAddOnsArray);

        // Preserve existing coverage data from quote
        const existingCoverages = quote?.coverages || {};

        console.log('[AddOns] Existing coverages:', existingCoverages);
        console.log('[AddOns] hasCollision:', existingCoverages.hasCollision);
        console.log('[AddOns] hasComprehensive:', existingCoverages.hasComprehensive);

        await updateCoverage.mutateAsync({
          quoteNumber,
          coverageData: {
            // Preserve all existing coverage selections
            coverage_bodily_injury_limit: existingCoverages.bodilyInjuryLimit,
            coverage_property_damage_limit: existingCoverages.propertyDamageLimit,
            coverage_medical_payments_limit: existingCoverages.medicalPaymentsLimit,
            coverage_uninsured_motorist_bodily_injury: existingCoverages.uninsuredMotoristBodilyInjury,
            coverage_underinsured_motorist_bodily_injury: existingCoverages.underinsuredMotoristBodilyInjury,
            coverage_collision: existingCoverages.hasCollision || existingCoverages.collision,
            coverage_comprehensive: existingCoverages.hasComprehensive || existingCoverages.comprehensive,
            coverage_roadside_assistance: true, // Always included
            // Add vehicle-specific coverages if they exist
            vehicle_coverages: existingCoverages.vehicleCoverages,
            // Add the vehicle add-ons
            vehicle_add_ons: vehicleAddOnsArray.length > 0 ? vehicleAddOnsArray : undefined,
          }
        });
      } catch (err) {
        console.error('[AddOns] Error updating add-ons:', err);
      }
    };

    updateAddOns();
  }, [debouncedVehicleAddOnsJson, quoteNumber, isInitialized]);

  const handleContinue = () => {
    navigate(`/quote-v2/loading-validation/${quoteNumber}`);
  };

  const handleBack = () => {
    navigate(`/quote-v2/coverage/${quoteNumber}`);
  };

  // Toggle rental reimbursement for a specific vehicle
  const toggleRental = (vehicleIndex: number) => {
    setVehicleAddOns(prev => ({
      ...prev,
      [vehicleIndex]: {
        ...prev[vehicleIndex],
        rental_reimbursement: !prev[vehicleIndex]?.rental_reimbursement,
      }
    }));
  };

  // Set additional equipment amount for a specific vehicle
  const setAdditionalEquipment = (vehicleIndex: number, amount: number | null) => {
    setVehicleAddOns(prev => ({
      ...prev,
      [vehicleIndex]: {
        ...prev[vehicleIndex],
        additional_equipment_amount: amount,
      }
    }));
  };

  // Toggle original parts replacement for a specific vehicle
  const toggleOriginalParts = (vehicleIndex: number) => {
    setVehicleAddOns(prev => ({
      ...prev,
      [vehicleIndex]: {
        ...prev[vehicleIndex],
        original_parts_replacement: !prev[vehicleIndex]?.original_parts_replacement,
      }
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={7} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center" flexJustify="center">
            <Title variant="title-2">Loading add-ons...</Title>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  // Error state
  if (error || !quote) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={7} totalScreens={19} />
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

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={7} totalScreens={19} />

      <Container padding="large">
        <Layout display="flex" gap="large">
          {/* Main Content */}
          <div style={{ flex: 1 }}>
            <Layout display="flex-column" gap="large">
              <Title variant="display-2">Add Ons</Title>

              {/* Rental Reimbursement */}
              <Layout display="flex-column" gap="medium" padding="medium" style={{ border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                <Title variant="title-3">Rental Reimbursement</Title>
                <Text variant="body-regular" color="subtle">
                  When it costs to repair your car, this coverage helps provide alternate transportation. It's optional but if something happens to your car, ask yourself if you really want to count on your buddy getting you to work.
                </Text>

                <Layout display="flex-column" gap="small">
                  {vehicles.map((vehicle: any, index: number) => (
                    <Layout
                      key={index}
                      display="flex"
                      flexJustify="space-between"
                      flexAlign="center"
                      padding="medium"
                      style={{
                        backgroundColor: '#f7fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <Layout display="flex" gap="small" flexAlign="center">
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: '#667eea',
                          color: 'white',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          Vehicle {index + 1}
                        </span>
                        <Text variant="body-regular">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </Text>
                      </Layout>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={vehicleAddOns[index]?.rental_reimbursement || false}
                          onChange={() => toggleRental(index)}
                          style={{
                            width: '48px',
                            height: '28px',
                            cursor: 'pointer',
                            accentColor: '#667eea'
                          }}
                        />
                      </label>
                    </Layout>
                  ))}
                </Layout>
              </Layout>

              {/* Additional Equipment Coverage */}
              <Layout display="flex-column" gap="medium" padding="medium" style={{ border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                <Title variant="title-3">Additional Equipment Coverage</Title>
                <Text variant="body-regular" color="subtle">
                  This coverage is included if your vehicle has comprehensive or collision coverage.
                </Text>

                <Layout display="flex-column" gap="medium">
                  {vehicles.map((vehicle: any, index: number) => (
                    <Layout key={index} display="flex-column" gap="small">
                      <Layout
                        display="flex"
                        flexJustify="space-between"
                        flexAlign="center"
                        padding="medium"
                        style={{
                          backgroundColor: '#f7fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <Layout display="flex" gap="small" flexAlign="center">
                          <span style={{
                            padding: '4px 12px',
                            backgroundColor: '#5eead4',
                            color: '#1a202c',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            Vehicle {index + 1}
                          </span>
                          <Text variant="body-regular">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </Text>
                        </Layout>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={!!vehicleAddOns[index]?.additional_equipment_amount}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAdditionalEquipment(index, 1000); // Default to $1,000
                              } else {
                                setAdditionalEquipment(index, null);
                              }
                            }}
                            style={{
                              width: '48px',
                              height: '28px',
                              cursor: 'pointer',
                              accentColor: '#667eea'
                            }}
                          />
                        </label>
                      </Layout>

                      {/* Amount selector (only show if enabled) */}
                      {vehicleAddOns[index]?.additional_equipment_amount !== null && (
                        <Layout display="flex" gap="small">
                          <Text variant="body-small" color="subtle">
                            Okay, select your additional equipment coverage amount:
                          </Text>
                          <Layout display="flex" gap="small">
                            <button
                              onClick={() => setAdditionalEquipment(index, 1000)}
                              style={{
                                padding: '8px 20px',
                                backgroundColor: vehicleAddOns[index]?.additional_equipment_amount === 1000 ? '#667eea' : '#e2e8f0',
                                color: vehicleAddOns[index]?.additional_equipment_amount === 1000 ? 'white' : '#718096',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              $1,000
                            </button>
                            <button
                              onClick={() => setAdditionalEquipment(index, 5000)}
                              style={{
                                padding: '8px 20px',
                                backgroundColor: vehicleAddOns[index]?.additional_equipment_amount === 5000 ? '#667eea' : '#e2e8f0',
                                color: vehicleAddOns[index]?.additional_equipment_amount === 5000 ? 'white' : '#718096',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              $5,000
                            </button>
                          </Layout>
                        </Layout>
                      )}
                    </Layout>
                  ))}
                </Layout>
              </Layout>

              {/* Original Parts Replacement */}
              <Layout display="flex-column" gap="medium" padding="medium" style={{ border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                <Title variant="title-3">Original Parts Replacement</Title>
                <Text variant="body-regular" color="subtle">
                  If you're passionate about your car (it has a name) and want only factory part replacements in the event of an accident, then this is the coverage for you (and Penelope Prius or Prisk).
                </Text>

                <Layout display="flex-column" gap="small">
                  {vehicles.map((vehicle: any, index: number) => (
                    <Layout
                      key={index}
                      display="flex"
                      flexJustify="space-between"
                      flexAlign="center"
                      padding="medium"
                      style={{
                        backgroundColor: '#f7fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <Layout display="flex" gap="small" flexAlign="center">
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: '#667eea',
                          color: 'white',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          Vehicle {index + 1}
                        </span>
                        <Text variant="body-regular">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </Text>
                      </Layout>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={vehicleAddOns[index]?.original_parts_replacement || false}
                          onChange={() => toggleOriginalParts(index)}
                          style={{
                            width: '48px',
                            height: '28px',
                            cursor: 'pointer',
                            accentColor: '#667eea'
                          }}
                        />
                      </label>
                    </Layout>
                  ))}
                </Layout>
              </Layout>

              {/* Always On Section */}
              <Layout display="flex-column" gap="medium" padding="medium" style={{
                backgroundColor: '#f7fafc',
                borderRadius: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <Title variant="title-3">Always On</Title>
                <Text variant="body-regular" color="subtle">
                  These additional perks are included with every Toggle auto policy.
                </Text>

                <Layout display="flex-column" gap="small">
                  <Title variant="title-4">Roadside Assistance</Title>
                  <Text variant="body-regular" color="subtle">
                    Getting stranded with a flat is no fun. Especially if you don't know a jack from a lug wrench.
                  </Text>

                  <Layout
                    display="flex"
                    flexJustify="space-between"
                    flexAlign="center"
                    padding="medium"
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Text variant="body-regular" style={{ fontWeight: 600 }}>
                      All Vehicles
                    </Text>
                    <label style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        style={{
                          width: '48px',
                          height: '28px',
                          cursor: 'not-allowed',
                          accentColor: '#667eea'
                        }}
                      />
                    </label>
                  </Layout>
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
                  Go back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="large"
                  onClick={handleContinue}
                >
                  Next: Review & Pay
                </Button>
              </Layout>
            </Layout>
          </div>

          {/* Price Sidebar */}
          <div style={{ width: '320px' }}>
            <PriceSidebar quote={quote} isLoading={updateCoverage.isPending} />
          </div>
        </Layout>
      </Container>
    </TechStartupLayout>
  );
};

/**
 * AddOns Component Wrapper with QuoteProvider
 */
const AddOns: React.FC = () => {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const { data: quote } = useQuoteByNumber(quoteNumber);

  if (!quote) {
    return <AddOnsContent />;
  }

  return (
    <QuoteProvider quoteId={quote.quoteId}>
      <AddOnsContent />
    </QuoteProvider>
  );
};

export default AddOns;
