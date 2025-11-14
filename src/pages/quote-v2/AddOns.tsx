import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestCard } from '../../components/everest/core/EverestCard';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestButton } from '../../components/everest/core/EverestButton';
import { EverestBadge } from '../../components/everest/core/EverestBadge';
import { EverestToggleSwitch } from '../../components/everest/specialized/EverestToggleSwitch';
import { EverestPriceSidebar } from '../../components/everest/specialized/EverestPriceSidebar';
import { useQuoteByNumber, useUpdateQuoteCoverage } from '../../hooks/useQuote';
import './AddOns.css';

/**
 * AddOns Screen (Screen 07 of 16) - Everest Design
 *
 * Optional coverage add-ons (per-vehicle):
 * - Rental Reimbursement (toggle per vehicle)
 * - Additional Equipment Coverage (toggle + amount selector per vehicle)
 * - Original Parts Replacement (toggle per vehicle)
 * - Roadside Assistance (always included, shown for all vehicles)
 *
 * Design:
 * - Two-column layout with EverestPriceSidebar
 * - Add-on sections in EverestCards
 * - EverestToggleSwitch for enabling/disabling add-ons
 * - EverestButton for amount selection ($1,000 or $5,000)
 * - "Always On" section for included features
 * - Real-time premium updates with debouncing (300ms)
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

const AddOns: React.FC = () => {
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
  const [vehicleAddOns, setVehicleAddOns] = useState<Record<number, {
    rental_reimbursement: boolean;
    additional_equipment_amount: number | null;
    original_parts_replacement: boolean;
  }>>({});

  const [isInitialized, setIsInitialized] = useState(false);
  const [lastInitializedQuoteNumber, setLastInitializedQuoteNumber] = useState<string | null>(null);

  // Get vehicles from quote
  const vehicles = quote?.vehicles || [];

  // Initialize add-ons from quote
  useEffect(() => {
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

        await updateCoverage.mutateAsync({
          quoteNumber,
          coverageData: {
            coverage_bodily_injury_limit: existingCoverages.bodilyInjuryLimit,
            coverage_property_damage_limit: existingCoverages.propertyDamageLimit,
            coverage_medical_payments_limit: existingCoverages.medicalPaymentsLimit,
            coverage_uninsured_motorist_bodily_injury: existingCoverages.uninsuredMotoristBodilyInjury,
            coverage_underinsured_motorist_bodily_injury: existingCoverages.underinsuredMotoristBodilyInjury,
            coverage_collision: existingCoverages.hasCollision || existingCoverages.collision,
            coverage_comprehensive: existingCoverages.hasComprehensive || existingCoverages.comprehensive,
            coverage_roadside_assistance: true,
            vehicle_coverages: existingCoverages.vehicleCoverages,
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

  const toggleRental = (vehicleIndex: number) => {
    setVehicleAddOns(prev => ({
      ...prev,
      [vehicleIndex]: {
        ...prev[vehicleIndex],
        rental_reimbursement: !prev[vehicleIndex]?.rental_reimbursement,
      }
    }));
  };

  const setAdditionalEquipment = (vehicleIndex: number, amount: number | null) => {
    setVehicleAddOns(prev => ({
      ...prev,
      [vehicleIndex]: {
        ...prev[vehicleIndex],
        additional_equipment_amount: amount,
      }
    }));
  };

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
      <EverestLayout>
        <EverestContainer>
          <div className="addons-loading">
            <EverestTitle variant="h2">Loading add-ons...</EverestTitle>
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
          <div className="addons-error">
            <EverestTitle variant="h2">Error Loading Quote</EverestTitle>
            <EverestButton variant="primary" onClick={() => navigate('/quote-v2/get-started')}>
              Start Over
            </EverestButton>
          </div>
        </EverestContainer>
      </EverestLayout>
    );
  }

  return (
    <EverestLayout>
      <EverestContainer>
        <EverestCard>
          <div className="addons-layout">
            {/* Main Content */}
            <div className="addons-main">
              <div className="addons-header">
                <EverestTitle variant="h2">Add Ons</EverestTitle>
                <EverestText variant="subtitle">
                  Customize your policy with optional coverages
                </EverestText>
              </div>

            {/* Rental Reimbursement */}
            <EverestCard>
              <div className="addons-section">
                <EverestTitle variant="h3">Rental Reimbursement</EverestTitle>
                <EverestText variant="body">
                  When it costs to repair your car, this coverage helps provide alternate transportation.
                </EverestText>

                <div className="addons-vehicles">
                  {vehicles.map((vehicle: any, index: number) => (
                    <div key={index} className="addons-vehicle-row">
                      <div className="addons-vehicle-info">
                        <EverestBadge variant="info">Vehicle {index + 1}</EverestBadge>
                        <EverestText variant="body">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </EverestText>
                      </div>
                      <EverestToggleSwitch
                        checked={vehicleAddOns[index]?.rental_reimbursement || false}
                        onChange={() => toggleRental(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </EverestCard>

            {/* Additional Equipment Coverage */}
            <EverestCard>
              <div className="addons-section">
                <EverestTitle variant="h3">Additional Equipment Coverage</EverestTitle>
                <EverestText variant="body">
                  This coverage is included if your vehicle has comprehensive or collision coverage.
                </EverestText>

                <div className="addons-vehicles">
                  {vehicles.map((vehicle: any, index: number) => (
                    <div key={index} className="addons-vehicle-item">
                      <div className="addons-vehicle-row">
                        <div className="addons-vehicle-info">
                          <EverestBadge variant="success">Vehicle {index + 1}</EverestBadge>
                          <EverestText variant="body">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </EverestText>
                        </div>
                        <EverestToggleSwitch
                          checked={!!vehicleAddOns[index]?.additional_equipment_amount}
                          onChange={(checked) => {
                            if (checked) {
                              setAdditionalEquipment(index, 1000); // Default to $1,000
                            } else {
                              setAdditionalEquipment(index, null);
                            }
                          }}
                        />
                      </div>

                      {/* Amount selector (only show if enabled) */}
                      {vehicleAddOns[index]?.additional_equipment_amount !== null && (
                        <div className="addons-amount-selector">
                          <EverestText variant="small">
                            Select your coverage amount:
                          </EverestText>
                          <div className="addons-amount-buttons">
                            <EverestButton
                              variant={vehicleAddOns[index]?.additional_equipment_amount === 1000 ? 'primary' : 'secondary'}
                              size="medium"
                              onClick={() => setAdditionalEquipment(index, 1000)}
                            >
                              $1,000
                            </EverestButton>
                            <EverestButton
                              variant={vehicleAddOns[index]?.additional_equipment_amount === 5000 ? 'primary' : 'secondary'}
                              size="medium"
                              onClick={() => setAdditionalEquipment(index, 5000)}
                            >
                              $5,000
                            </EverestButton>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </EverestCard>

            {/* Original Parts Replacement */}
            <EverestCard>
              <div className="addons-section">
                <EverestTitle variant="h3">Original Parts Replacement</EverestTitle>
                <EverestText variant="body">
                  If you're passionate about your car and want only factory part replacements in the event of an accident, then this is the coverage for you.
                </EverestText>

                <div className="addons-vehicles">
                  {vehicles.map((vehicle: any, index: number) => (
                    <div key={index} className="addons-vehicle-row">
                      <div className="addons-vehicle-info">
                        <EverestBadge variant="info">Vehicle {index + 1}</EverestBadge>
                        <EverestText variant="body">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </EverestText>
                      </div>
                      <EverestToggleSwitch
                        checked={vehicleAddOns[index]?.original_parts_replacement || false}
                        onChange={() => toggleOriginalParts(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </EverestCard>

            {/* Always On Section */}
            <div className="addons-always-on">
              <EverestCard>
                <div className="addons-section">
                  <EverestTitle variant="h3">Always On</EverestTitle>
                  <EverestText variant="body">
                    These additional perks are included with every policy.
                  </EverestText>

                  <div className="addons-always-on-item">
                    <EverestTitle variant="h4">Roadside Assistance</EverestTitle>
                    <EverestText variant="body">
                      Getting stranded with a flat is no fun. Especially if you don't know a jack from a lug wrench.
                    </EverestText>

                    <div className="addons-vehicle-row addons-vehicle-row-disabled">
                      <EverestText variant="label">All Vehicles</EverestText>
                      <EverestToggleSwitch
                        checked={true}
                        onChange={() => {}}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </EverestCard>
            </div>

            {/* Navigation Buttons */}
            <div className="addons-actions">
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
          <div className="addons-sidebar">
            <EverestPriceSidebar
              monthlyPrice={quote?.premium?.monthly ? `$${Math.round(quote.premium.monthly)}` : '$147'}
              sixMonthPrice={quote?.premium?.sixMonth ? `$${Math.round(quote.premium.sixMonth)}` : '$882'}
              coverageDetails={[
                { label: 'Bodily Injury', value: quote?.coverages?.bodilyInjuryLimit || '100/300' },
                { label: 'Property Damage', value: quote?.coverages?.propertyDamageLimit || '$50,000' },
                { label: 'Comprehensive', value: quote?.coverages?.hasComprehensive ? 'Included' : 'Not included' },
                { label: 'Collision', value: quote?.coverages?.hasCollision ? 'Included' : 'Not included' },
              ]}
              isSticky={true}
            />
          </div>
        </div>
        </EverestCard>
      </EverestContainer>
    </EverestLayout>
  );
};

export default AddOns;
