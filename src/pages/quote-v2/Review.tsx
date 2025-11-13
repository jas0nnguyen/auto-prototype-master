import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Layout,
  Container,
  Title,
  Text,
  Card,
  Button
} from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { PriceSidebar } from './components/PriceSidebar';
import { ScreenProgress } from './components/ScreenProgress';
import { QuoteProvider } from './contexts/QuoteContext';
import { useQuoteByNumber } from '../../hooks/useQuote';

/**
 * Review Screen (Screen 09 of 19) - T099
 *
 * Comprehensive quote summary displaying:
 * - Drivers with license numbers
 * - Vehicles with VINs
 * - Liability Coverage (BI + PD limits)
 * - Vehicle Coverage per vehicle (comprehensive, collision, rental)
 * - Full discount breakdown
 *
 * This is the final screen before signing ceremony (Phase 4)
 *
 * Data Flow:
 * 1. Get quoteNumber from URL params
 * 2. Fetch quote data using useQuoteByNumber hook
 * 3. Map API response to display format
 * 4. Render comprehensive summary with all quote details
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

interface CoverageDescription {
  name: string;
  description: string;
  value: string;
}

const ReviewContent: React.FC = () => {
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
    // Navigate to signing ceremony (Phase 4)
    navigate(`/quote-v2/sign/${quoteNumber}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={9} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center" flexJustify="center">
            <Title variant="title-2">Loading your quote...</Title>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  // Error state
  if (error || !quote) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={9} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center">
            <Title variant="title-2">Error Loading Quote</Title>
            <Text variant="body-regular" color="subtle">
              {error ? 'Unable to load quote details. Please try again.' : 'Quote not found.'}
            </Text>
            <Button variant="primary" onClick={() => navigate('/quote-v2/get-started')}>
              Start Over
            </Button>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  // Map API response to display format
  const drivers: Driver[] = [];

  // Add primary driver (note: backend returns camelCase)
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

  // Map vehicles (backend returns camelCase)
  const vehicles: Vehicle[] = quote.vehicles?.map((v: any, index: number) => ({
    id: v.vehicle_id || v.vehicleId || `vehicle-${index}`,
    year: v.year,
    make: v.make,
    model: v.model,
    vin: v.vin || 'N/A',
  })) || [];

  // Extract liability coverage (use coverages object from backend)
  const coverages = quote.coverages || {};
  const liabilityCoverage = {
    bodilyInjury: coverages.bodilyInjuryLimit || '$100,000 / $300,000',
    propertyDamage: coverages.propertyDamageLimit
      ? (coverages.propertyDamageLimit.startsWith('$') ? coverages.propertyDamageLimit : `$${coverages.propertyDamageLimit}`)
      : '$50,000',
  };

  // Coverage descriptions with detailed explanations
  const coverageDescriptions: CoverageDescription[] = [
    {
      name: 'Bodily Injury Liability',
      description: 'Covers injuries you cause to others in an accident',
      value: liabilityCoverage.bodilyInjury,
    },
    {
      name: 'Property Damage Liability',
      description: "Covers damage you cause to others' property",
      value: liabilityCoverage.propertyDamage,
    },
  ];

  if (coverages.hasCollision) {
    coverageDescriptions.push({
      name: 'Collision',
      description: 'Covers damage to your vehicle from collisions',
      value: `$${coverages.collisionDeductible} deductible`,
    });
  }

  if (coverages.hasComprehensive) {
    coverageDescriptions.push({
      name: 'Comprehensive',
      description: 'Covers damage from theft, vandalism, weather, etc.',
      value: `$${coverages.comprehensiveDeductible} deductible`,
    });
  }

  if (coverages.hasUninsured) {
    coverageDescriptions.push({
      name: 'Uninsured Motorist',
      description: 'Protects you if hit by an uninsured driver',
      value: 'Included',
    });
  }

  if (coverages.hasRental) {
    coverageDescriptions.push({
      name: 'Rental Reimbursement',
      description: 'Covers rental car costs while your car is being repaired',
      value: `$${coverages.rentalLimit} limit`,
    });
  }

  if (coverages.hasRoadside) {
    coverageDescriptions.push({
      name: 'Roadside Assistance',
      description: 'Covers towing, flat tires, lockouts, and jump starts',
      value: 'Included',
    });
  }

  // Extract discounts
  const discounts = quote.discounts?.map((d: any) => ({
    name: d.name || d.code,
    amount: Math.abs(d.amount),
  })) || [];

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={9} totalScreens={19} />

      <Container padding="large">
        <Layout display="flex" gap="large">
          {/* Main Content */}
          <div style={{ flex: 1 }}>
            <Layout display="flex-column" gap="large">
              <Title variant="display-2">Review Your Quote</Title>

              <Text variant="body-large" color="subtle">
                Everything looks good? Review your coverage details below.
              </Text>

              {/* Drivers Section */}
              <Layout display="flex-column" gap="medium">
                <Title variant="title-3">Drivers</Title>

                {drivers.map(driver => (
                  <Card key={driver.id} padding="medium">
                    <Layout display="flex-column" gap="small">
                      <Title variant="title-4">
                        {driver.firstName} {driver.lastName}
                      </Title>
                      <Text variant="body-regular" color="subtle">
                        License: {driver.licenseNumber} ({driver.licenseState})
                      </Text>
                    </Layout>
                  </Card>
                ))}
              </Layout>

              {/* Vehicles Section */}
              <Layout display="flex-column" gap="medium">
                <Title variant="title-3">Vehicles</Title>

                {vehicles.map(vehicle => (
                  <Card key={vehicle.id} padding="medium">
                    <Layout display="flex-column" gap="small">
                      <Title variant="title-4">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </Title>
                      <Text variant="body-regular" color="subtle">
                        VIN: {vehicle.vin}
                      </Text>
                    </Layout>
                  </Card>
                ))}
              </Layout>

              {/* Coverage Summary Section */}
              <Layout display="flex-column" gap="medium">
                <Title variant="title-3">Your Coverage</Title>
                <Text variant="body-regular" color="subtle">
                  Complete protection for you and your vehicle
                </Text>

                {coverageDescriptions.map((coverage, index) => (
                  <Card key={index} padding="medium">
                    <Layout display="flex-column" gap="small">
                      <Layout display="flex" flexJustify="space-between" flexAlign="center">
                        <div>
                          <Text variant="body-regular" style={{ fontWeight: 600 }}>
                            {coverage.name}
                          </Text>
                          <Text variant="body-small" color="subtle">
                            {coverage.description}
                          </Text>
                        </div>
                        <Text variant="body-regular" style={{ fontWeight: 600 }}>
                          {coverage.value}
                        </Text>
                      </Layout>
                    </Layout>
                  </Card>
                ))}
              </Layout>


              {/* Discounts Section */}
              {discounts.length > 0 && (
                <Layout display="flex-column" gap="medium">
                  <Title variant="title-3">Your Discounts</Title>

                  <Card padding="medium">
                    <Layout display="flex-column" gap="small">
                      {discounts.map((discount: { name: string; amount: number }) => (
                        <Layout key={discount.name} display="flex" flexJustify="space-between">
                          <Text variant="body-regular">{discount.name}</Text>
                          <Text variant="body-regular" style={{ fontWeight: 600, color: '#10b981' }}>
                            ${Math.abs(discount.amount)}
                          </Text>
                        </Layout>
                      ))}
                    </Layout>
                  </Card>
                </Layout>
              )}

              {/* Navigation Buttons */}
              <Layout display="flex" gap="medium" flexJustify="space-between">
                <Button
                  type="button"
                  size="large"
                  onClick={handleMakeChanges}
                >
                  Make Changes
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="large"
                  onClick={handleContinue}
                >
                  Looks Good! Continue
                </Button>
              </Layout>
            </Layout>
          </div>

          {/* Price Sidebar */}
          <div style={{ width: '320px' }}>
            <PriceSidebar quote={quote} isLoading={false} />
          </div>
        </Layout>
      </Container>
    </TechStartupLayout>
  );
};

/**
 * Review Component Wrapper with QuoteProvider
 *
 * Wraps ReviewContent with QuoteProvider to provide quote context.
 * This enables PriceSidebar and other components to access quote data.
 */
const Review: React.FC = () => {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const { data: quote } = useQuoteByNumber(quoteNumber) as { data: any };

  if (!quote || !quote.quoteId) {
    return <ReviewContent />;
  }

  return (
    <QuoteProvider quoteId={quote.quoteId}>
      <ReviewContent />
    </QuoteProvider>
  );
};

export default Review;
