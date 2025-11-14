import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestCard } from '../../components/everest/core/EverestCard';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestButton } from '../../components/everest/core/EverestButton';
import { EverestPriceSidebar } from '../../components/everest/specialized/EverestPriceSidebar';
import { useQuoteByNumber } from '../../hooks/useQuote';
import './Review.css';

/**
 * Review Screen (Screen 09 of 16) - Everest Design
 *
 * Comprehensive quote summary displaying:
 * - Drivers with license information
 * - Vehicles with VINs
 * - Coverage details organized by section
 * - Add-ons and included features
 *
 * Design:
 * - Two-column layout with EverestPriceSidebar
 * - Review sections in cards with label-value rows
 * - Make Changes + Looks Good buttons
 */

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber?: string;
  licenseState?: string;
}

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  vin: string;
}

const Review: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  // Fetch quote data
  const { data: quote, isLoading, error } = useQuoteByNumber(quoteNumber) as {
    data: any;
    isLoading: boolean;
    error: any;
  };

  const handleMakeChanges = () => {
    navigate(`/quote-v2/summary/${quoteNumber}`);
  };

  const handleContinue = () => {
    navigate(`/quote-v2/sign/${quoteNumber}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <EverestLayout>
        <EverestContainer>
          <div className="review-loading">
            <EverestTitle variant="h2">Loading your quote...</EverestTitle>
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
          <div className="review-error">
            <EverestTitle variant="h2">Error Loading Quote</EverestTitle>
            <EverestText variant="body">
              {error ? 'Unable to load quote details. Please try again.' : 'Quote not found.'}
            </EverestText>
            <EverestButton variant="primary" onClick={() => navigate('/quote-v2/get-started')}>
              Start Over
            </EverestButton>
          </div>
        </EverestContainer>
      </EverestLayout>
    );
  }

  // Map API response to display format
  const drivers: Driver[] = [];

  // Add primary driver
  if (quote.driver) {
    drivers.push({
      id: (quote.driver as any).party_id || (quote.driver as any).partyId || 'primary',
      firstName: quote.driver.firstName,
      lastName: quote.driver.lastName,
      licenseNumber: (quote.driver as any).license_number || (quote.driver as any).licenseNumber,
      licenseState: (quote.driver as any).license_state_code || (quote.driver as any).licenseState,
    });
  }

  // Add additional drivers
  if (quote.additionalDrivers && Array.isArray(quote.additionalDrivers)) {
    quote.additionalDrivers.forEach((driver: any, index: number) => {
      drivers.push({
        id: driver.party_id || driver.partyId || `additional-${index}`,
        firstName: driver.firstName || driver.first_name,
        lastName: driver.lastName || driver.last_name,
        licenseNumber: driver.license_number || driver.licenseNumber,
        licenseState: driver.license_state_code || driver.licenseState,
      });
    });
  }

  // Map vehicles
  const vehicles: Vehicle[] = quote.vehicles?.map((v: any, index: number) => ({
    id: v.vehicle_id || v.vehicleId || `vehicle-${index}`,
    year: v.year,
    make: v.make,
    model: v.model,
    vin: v.vin || 'N/A',
  })) || [];

  // Extract coverages
  const coverages = quote.coverages || {};
  const vehicleCoverages = coverages.vehicleCoverages || [];
  const vehicleAddOns = quote.vehicleAddOns || [];

  return (
    <EverestLayout>
      <EverestContainer>
        <div className="review-layout">
          {/* Main Content */}
          <div className="review-main">
            <div className="review-header">
              <EverestTitle variant="h2">Review Your Quote</EverestTitle>
              <EverestText variant="subtitle">
                Everything looks good? Review your coverage details below.
              </EverestText>
            </div>

            {/* Drivers Section */}
            <EverestCard>
              <div className="review-section">
                <EverestTitle variant="h3">Drivers</EverestTitle>

                <div className="review-items">
                  {drivers.map((driver, index) => (
                    <div key={driver.id} className="review-item">
                      <div className="review-row">
                        <EverestText variant="label">
                          {index === 0 ? 'Named Insured' : `Additional Driver ${index}`}
                        </EverestText>
                        <EverestText variant="body">
                          {driver.firstName} {driver.lastName}
                        </EverestText>
                      </div>
                      <div className="review-row">
                        <EverestText variant="label">License</EverestText>
                        <EverestText variant="body">
                          {driver.licenseNumber} ({driver.licenseState})
                        </EverestText>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </EverestCard>

            {/* Vehicles Section */}
            <EverestCard>
              <div className="review-section">
                <EverestTitle variant="h3">Vehicles</EverestTitle>

                <div className="review-items">
                  {vehicles.map((vehicle, index) => (
                    <div key={vehicle.id} className="review-item">
                      <div className="review-row">
                        <EverestText variant="label">Vehicle {index + 1}</EverestText>
                        <EverestText variant="body">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </EverestText>
                      </div>
                      <div className="review-row">
                        <EverestText variant="label">VIN</EverestText>
                        <EverestText variant="body">{vehicle.vin}</EverestText>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </EverestCard>

            {/* Protect You & Loved Ones */}
            <EverestCard>
              <div className="review-section">
                <EverestTitle variant="h3">Protect You & Loved Ones</EverestTitle>

                <div className="review-items">
                  <div className="review-row">
                    <EverestText variant="label">Bodily Injury Liability</EverestText>
                    <EverestText variant="body">{coverages.bodilyInjuryLimit || '$100,000 / $300,000'}</EverestText>
                  </div>
                  <div className="review-row">
                    <EverestText variant="label">Medical Payments</EverestText>
                    <EverestText variant="body">{coverages.medicalPaymentsLimit || '$5,000 per person'}</EverestText>
                  </div>
                  {coverages.uninsuredMotoristBodilyInjury && (
                    <div className="review-row">
                      <EverestText variant="label">Uninsured Motorist Bodily Injury</EverestText>
                      <EverestText variant="body">{coverages.uninsuredMotoristBodilyInjury}</EverestText>
                    </div>
                  )}
                  {coverages.underinsuredMotoristBodilyInjury && (
                    <div className="review-row">
                      <EverestText variant="label">Underinsured Motorist Bodily Injury</EverestText>
                      <EverestText variant="body">{coverages.underinsuredMotoristBodilyInjury}</EverestText>
                    </div>
                  )}
                </div>
              </div>
            </EverestCard>

            {/* Protect Your Assets */}
            <EverestCard>
              <div className="review-section">
                <EverestTitle variant="h3">Protect Your Assets</EverestTitle>

                <div className="review-items">
                  <div className="review-row">
                    <EverestText variant="label">Property Damage Liability</EverestText>
                    <EverestText variant="body">
                      {coverages.propertyDamageLimit?.startsWith('$')
                        ? coverages.propertyDamageLimit
                        : `$${coverages.propertyDamageLimit || '50,000'}`}
                    </EverestText>
                  </div>
                </div>
              </div>
            </EverestCard>

            {/* Protect Your Vehicles */}
            <EverestCard>
              <div className="review-section">
                <EverestTitle variant="h3">Protect Your Vehicles</EverestTitle>

                <div className="review-items">
                  {vehicles.map((vehicle, index) => {
                    const vehicleCoverage = vehicleCoverages[index] || {};
                    return (
                      <div key={vehicle.id} className="review-vehicle-coverage">
                        <EverestText variant="body" style={{ fontWeight: 600, marginBottom: '12px' }}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </EverestText>

                        {vehicleCoverage.comprehensiveDeductible && (
                          <div className="review-row">
                            <EverestText variant="label">Comprehensive</EverestText>
                            <EverestText variant="body">${vehicleCoverage.comprehensiveDeductible} deductible</EverestText>
                          </div>
                        )}

                        {vehicleCoverage.collisionDeductible && (
                          <div className="review-row">
                            <EverestText variant="label">Collision</EverestText>
                            <EverestText variant="body">${vehicleCoverage.collisionDeductible} deductible</EverestText>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </EverestCard>

            {/* Add-Ons */}
            <EverestCard>
              <div className="review-section">
                <EverestTitle variant="h3">Add-Ons & Included Features</EverestTitle>

                <div className="review-items">
                  {/* Roadside Assistance (always included) */}
                  <div className="review-row">
                    <EverestText variant="label">Roadside Assistance</EverestText>
                    <EverestText variant="body">Included (All Vehicles)</EverestText>
                  </div>

                  {/* Per-vehicle add-ons */}
                  {vehicles.map((vehicle, index) => {
                    const addOns = vehicleAddOns.find((addon: any) => addon.vehicle_index === index);
                    if (!addOns) return null;

                    const hasAddOns = addOns.rental_reimbursement ||
                      addOns.additional_equipment_amount ||
                      addOns.original_parts_replacement;

                    if (!hasAddOns) return null;

                    return (
                      <div key={vehicle.id} className="review-vehicle-addons">
                        <EverestText variant="body" style={{ fontWeight: 600, marginBottom: '8px' }}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </EverestText>

                        {addOns.rental_reimbursement && (
                          <div className="review-row">
                            <EverestText variant="label">Rental Reimbursement</EverestText>
                            <EverestText variant="body">Included</EverestText>
                          </div>
                        )}

                        {addOns.additional_equipment_amount && (
                          <div className="review-row">
                            <EverestText variant="label">Additional Equipment</EverestText>
                            <EverestText variant="body">${addOns.additional_equipment_amount.toLocaleString()} limit</EverestText>
                          </div>
                        )}

                        {addOns.original_parts_replacement && (
                          <div className="review-row">
                            <EverestText variant="label">Original Parts Replacement</EverestText>
                            <EverestText variant="body">Included</EverestText>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </EverestCard>

            {/* Navigation Buttons */}
            <div className="review-actions">
              <EverestButton
                type="button"
                variant="secondary"
                size="large"
                onClick={handleMakeChanges}
              >
                Make Changes
              </EverestButton>
              <EverestButton
                type="button"
                variant="primary"
                size="large"
                onClick={handleContinue}
              >
                Looks Good! Continue
              </EverestButton>
            </div>
          </div>

          {/* Price Sidebar */}
          <div className="review-sidebar">
            <EverestPriceSidebar quote={quote} />
          </div>
        </div>
      </EverestContainer>
    </EverestLayout>
  );
};

export default Review;
