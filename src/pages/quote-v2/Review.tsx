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

interface VehicleCoverage {
  vehicleId: string;
  comprehensive: string;
  collision: string;
  rental: string;
  roadside: string;
}

const ReviewContent: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  // Fetch quote data
  const { data: quote, isLoading, error } = useQuoteByNumber(quoteNumber);

  const handleMakeChanges = () => {
    navigate(`/quote-v2/summary/${quoteNumber}`);
  };

  const handleContinue = () => {
    // Will navigate to signing ceremony in Phase 4
    alert('Signing ceremony not implemented yet (Phase 4)');
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
            <Title variant="title-2" color="error">Error Loading Quote</Title>
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

  // Add primary driver
  if (quote.driver) {
    drivers.push({
      id: quote.driver.party_id,
      firstName: quote.driver.first_name,
      lastName: quote.driver.last_name,
      licenseNumber: quote.driver.license_number,
      licenseState: quote.driver.license_state_code,
    });
  }

  // Add additional drivers
  if (quote.additionalDrivers) {
    quote.additionalDrivers.forEach(driver => {
      drivers.push({
        id: driver.party_id,
        firstName: driver.first_name,
        lastName: driver.last_name,
        licenseNumber: driver.license_number,
        licenseState: driver.license_state_code,
      });
    });
  }

  // Map vehicles
  const vehicles: Vehicle[] = quote.vehicles?.map(v => ({
    id: v.vehicle_id,
    year: v.year,
    make: v.make,
    model: v.model,
    vin: v.vin || 'N/A',
  })) || [];

  // Extract liability coverage
  const liabilityCoverage = {
    bodilyInjury: quote.coverage?.bodily_injury_limit
      ? quote.coverage.bodily_injury_limit.replace('/', ' / ')
      : '$100,000 / $300,000',
    propertyDamage: quote.coverage?.property_damage_limit
      ? `$${quote.coverage.property_damage_limit.toLocaleString()}`
      : '$50,000',
  };

  // Map vehicle coverages
  const vehicleCoverages: VehicleCoverage[] = vehicles.map(vehicle => ({
    vehicleId: vehicle.id,
    comprehensive: quote.coverage?.comprehensive_deductible
      ? `$${quote.coverage.comprehensive_deductible} deductible`
      : '$500 deductible',
    collision: quote.coverage?.collision_deductible
      ? `$${quote.coverage.collision_deductible} deductible`
      : '$500 deductible',
    rental: quote.coverage?.rental_reimbursement
      ? `$${quote.coverage.rental_limit || 1200} limit`
      : 'Not included',
    roadside: 'Always included',
  }));

  // Extract discounts
  const discounts = quote.discounts?.map(d => ({
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

              {/* Liability Coverage Section */}
              <Layout display="flex-column" gap="medium">
                <Title variant="title-3">Liability Coverage</Title>

                <Card padding="medium">
                  <Layout display="flex-column" gap="small">
                    <Layout display="flex" flexJustify="space-between">
                      <Text variant="body-regular">Bodily Injury Liability</Text>
                      <Text variant="body-regular" style={{ fontWeight: 600 }}>
                        {liabilityCoverage.bodilyInjury}
                      </Text>
                    </Layout>
                    <Layout display="flex" flexJustify="space-between">
                      <Text variant="body-regular">Property Damage Liability</Text>
                      <Text variant="body-regular" style={{ fontWeight: 600 }}>
                        {liabilityCoverage.propertyDamage}
                      </Text>
                    </Layout>
                  </Layout>
                </Card>
              </Layout>

              {/* Vehicle Coverage Section */}
              <Layout display="flex-column" gap="medium">
                <Title variant="title-3">Vehicle Coverage</Title>

                {vehicleCoverages.map((coverage, index) => (
                  <Card key={coverage.vehicleId} padding="medium">
                    <Layout display="flex-column" gap="small">
                      <Title variant="title-4">
                        {vehicles[index].year} {vehicles[index].make} {vehicles[index].model}
                      </Title>
                      <Layout display="flex" flexJustify="space-between">
                        <Text variant="body-regular">Comprehensive</Text>
                        <Text variant="body-regular" style={{ fontWeight: 600 }}>
                          {coverage.comprehensive}
                        </Text>
                      </Layout>
                      <Layout display="flex" flexJustify="space-between">
                        <Text variant="body-regular">Collision</Text>
                        <Text variant="body-regular" style={{ fontWeight: 600 }}>
                          {coverage.collision}
                        </Text>
                      </Layout>
                      <Layout display="flex" flexJustify="space-between">
                        <Text variant="body-regular">Rental Reimbursement</Text>
                        <Text variant="body-regular" style={{ fontWeight: 600 }}>
                          {coverage.rental}
                        </Text>
                      </Layout>
                      <Layout display="flex" flexJustify="space-between">
                        <Text variant="body-regular">Roadside Assistance</Text>
                        <Text variant="body-regular" style={{ fontWeight: 600 }}>
                          {coverage.roadside}
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
                      {discounts.map(discount => (
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
              <Layout display="flex" gap="medium" flexJustify="space-between" padding={{ top: 'medium' }}>
                <Button
                  type="button"
                  variant="secondary"
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
            <PriceSidebar />
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
  const { data: quote } = useQuoteByNumber(quoteNumber);

  if (!quote) {
    return <ReviewContent />;
  }

  return (
    <QuoteProvider quoteId={quote.quoteId}>
      <ReviewContent />
    </QuoteProvider>
  );
};

export default Review;
