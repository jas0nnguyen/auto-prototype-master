import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppTemplate,
  PageHeader,
  AppHeader,
  Main,
  PageFooter,
  AppFooter,
  Content,
  Header,
  Button,
  Section,
  Link,
  Text,
  ChevronLeft,
  Card,
  TextInput,
} from '@sureapp/canary-design-system';

const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

interface EnrichedVehicleData {
  id: string;
  year: string;
  make: string;
  model: string;
  vin?: string;
  primaryDriverId: string;
  // Mock 3rd party enriched fields
  annualMileage: number;
  safetyRating: number; // 1-5 stars
  marketValue: number;
  bodyType: string;
}

const VehicleConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [enrichedVehicles, setEnrichedVehicles] = useState<EnrichedVehicleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock 3rd party API enrichment
  useEffect(() => {
    const quoteData = sessionStorage.getItem('quoteData');
    if (!quoteData) {
      navigate('/quote/driver-info');
      return;
    }

    const parsedData = JSON.parse(quoteData);
    if (!parsedData.vehicles || parsedData.vehicles.length === 0) {
      navigate('/quote/vehicles');
      return;
    }

    // Simulate API call delay (mock 3rd party service)
    setIsLoading(true);
    setTimeout(() => {
      // Enrich each vehicle with mock data
      const enriched = parsedData.vehicles.map((vehicle: any) => {
        return {
          ...vehicle,
          // Mock annual mileage based on vehicle age and type
          annualMileage: mockAnnualMileage(vehicle.year, vehicle.make),
          // Mock safety rating
          safetyRating: mockSafetyRating(vehicle.year, vehicle.make),
          // Mock market value
          marketValue: mockMarketValue(vehicle.year, vehicle.make),
          // Mock body type
          bodyType: mockBodyType(vehicle.make, vehicle.model),
        };
      });

      setEnrichedVehicles(enriched);
      setIsLoading(false);
    }, 1500); // 1.5 second simulated API delay
  }, [navigate]);

  // Mock functions simulating 3rd party API responses
  const mockAnnualMileage = (year: string, make: string): number => {
    const age = 2024 - parseInt(year);
    const baseMileage = 12000;
    // Newer cars tend to have less accumulated mileage
    return baseMileage - (age * 500) + (Math.random() * 2000);
  };

  const mockSafetyRating = (year: string, make: string): number => {
    // Newer cars and certain brands get higher safety ratings
    const yearNum = parseInt(year);
    if (yearNum >= 2020) return Math.floor(Math.random() * 2) + 4; // 4-5 stars
    if (yearNum >= 2015) return Math.floor(Math.random() * 2) + 3; // 3-4 stars
    return Math.floor(Math.random() * 3) + 2; // 2-4 stars
  };

  const mockMarketValue = (year: string, make: string): number => {
    const yearNum = parseInt(year);
    const age = 2024 - yearNum;
    const baseValue = 35000;
    // Depreciation model: ~15% per year
    const value = baseValue * Math.pow(0.85, age);

    // Premium brands hold value better
    const premiumBrands = ['tesla', 'bmw', 'mercedes', 'audi'];
    const multiplier = premiumBrands.includes(make.toLowerCase()) ? 1.3 : 1.0;

    return Math.round(value * multiplier);
  };

  const mockBodyType = (make: string, model: string): string => {
    const modelLower = model.toLowerCase();
    if (modelLower.includes('f-150') || modelLower.includes('silverado')) return 'Pickup Truck';
    if (modelLower.includes('civic') || modelLower.includes('camry') || modelLower.includes('accord')) return 'Sedan';
    if (modelLower.includes('model') && make.toLowerCase() === 'tesla') return 'Electric Sedan';
    if (modelLower.includes('explorer') || modelLower.includes('pilot')) return 'SUV';
    return 'Sedan'; // Default
  };

  const handleMileageChange = (vehicleId: string, newMileage: string) => {
    const mileage = parseInt(newMileage) || 0;
    setEnrichedVehicles(prevVehicles =>
      prevVehicles.map(v =>
        v.id === vehicleId ? { ...v, annualMileage: mileage } : v
      )
    );
  };

  const handleContinue = () => {
    // Save enriched vehicle data to sessionStorage
    const existingData = JSON.parse(sessionStorage.getItem('quoteData') || '{}');
    const updatedData = {
      ...existingData,
      vehicles: enrichedVehicles, // Replace with enriched data
    };
    sessionStorage.setItem('quoteData', JSON.stringify(updatedData));

    // Navigate to coverage selection
    navigate('/quote/coverage-selection');
  };

  const getDriverName = (driverId: string): string => {
    const quoteData = sessionStorage.getItem('quoteData');
    if (!quoteData) return 'Unknown Driver';

    const parsedData = JSON.parse(quoteData);

    if (driverId === 'primary') {
      return `${parsedData.primaryDriver?.firstName} ${parsedData.primaryDriver?.lastName}`;
    }

    const additionalDriver = parsedData.additionalDrivers?.find((d: any) => d.id === driverId);
    if (additionalDriver) {
      return `${additionalDriver.firstName} ${additionalDriver.lastName}`;
    }

    return 'Unknown Driver';
  };

  const renderStars = (rating: number): string => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (isLoading) {
    return (
      <AppTemplate preset="purchase-flow">
        <PageHeader>
          <AppHeader logo={logoSrc} logoHref="/" />
        </PageHeader>
        <Main>
          <Content>
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <Text variant="title-2">Verifying vehicle information...</Text>
              <Text variant="body-medium" style={{ marginTop: '1rem', color: '#666' }}>
                We're checking safety ratings, market values, and mileage estimates.
              </Text>
              <div style={{ marginTop: '2rem' }}>
                <div className="loading-spinner" style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #0070f3',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }} />
              </div>
            </div>
          </Content>
        </Main>
        <PageFooter>
          <AppFooter logo={logoSrc} />
        </PageFooter>
      </AppTemplate>
    );
  }

  return (
    <AppTemplate preset="purchase-flow">
      <PageHeader>
        <AppHeader logo={logoSrc} logoHref="/" />
      </PageHeader>

      <Main>
        <Content>
          <AppTemplate.Title>
            <Header
              breadcrumbs={
                <Button
                  onClick={() => navigate('/quote/vehicles')}
                  emphasis="text"
                  startIcon={ChevronLeft}
                >
                  Back
                </Button>
              }
              hasBorder={false}
              hasPadding={false}
              supportText="Please verify the information we've gathered about your vehicles. You can update the annual mileage if needed."
              title="Confirm Vehicle Details"
              titleSize="title-1"
            />
          </AppTemplate.Title>

          <Section title={`Vehicle Information (${enrichedVehicles.length})`}>
            {enrichedVehicles.map((vehicle, index) => (
              <Card key={vehicle.id} style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <Text variant="title-3" style={{ fontWeight: 600 }}>
                    Vehicle {index + 1}: {vehicle.year} {vehicle.make} {vehicle.model}
                  </Text>
                  {vehicle.vin && (
                    <Text variant="body-small" style={{ color: '#666', marginTop: '0.25rem' }}>
                      VIN: {vehicle.vin}
                    </Text>
                  )}
                  <Text variant="body-small" style={{ color: '#666', marginTop: '0.25rem' }}>
                    Primary Driver: {getDriverName(vehicle.primaryDriverId)}
                  </Text>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <div>
                    <Text variant="body-small" style={{ color: '#666', fontWeight: 600 }}>
                      Body Type
                    </Text>
                    <Text variant="body-medium">{vehicle.bodyType}</Text>
                  </div>

                  <div>
                    <Text variant="body-small" style={{ color: '#666', fontWeight: 600 }}>
                      Estimated Market Value
                    </Text>
                    <Text variant="body-medium">${vehicle.marketValue.toLocaleString()}</Text>
                  </div>

                  <div>
                    <Text variant="body-small" style={{ color: '#666', fontWeight: 600 }}>
                      Safety Rating
                    </Text>
                    <Text variant="body-medium">{renderStars(vehicle.safetyRating)}</Text>
                  </div>

                  <div>
                    <Text variant="body-small" style={{ color: '#666', fontWeight: 600 }}>
                      Estimated Annual Mileage
                    </Text>
                    <TextInput
                      id={`mileage-${vehicle.id}`}
                      size="small"
                      type="number"
                      value={vehicle.annualMileage.toString()}
                      onChange={(e) => handleMileageChange(vehicle.id, e.target.value)}
                      helpText="You can update this if the estimate seems off"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '6px' }}>
                  <Text variant="body-small" style={{ color: '#1e40af' }}>
                    ℹ️ This information is based on industry databases and helps us provide accurate pricing.
                  </Text>
                </div>
              </Card>
            ))}
          </Section>

          <div style={{ marginTop: '2rem' }}>
            <Button
              onClick={handleContinue}
              size="large"
              variant="primary"
              isFullWidth
            >
              Continue to Coverage Selection
            </Button>
          </div>
        </Content>
      </Main>

      <PageFooter>
        <AppFooter
          logo={logoSrc}
          links={
            <>
              <Link href="/privacy" size="xsmall">
                Privacy Policy
              </Link>
              <Link href="/terms" size="xsmall">
                Terms of Use
              </Link>
            </>
          }
        >
          <>
            <Text variant="caption-small">
              Vehicle data is sourced from industry-standard databases including NHTSA safety ratings
              and NADA market values. All information is encrypted and secure.
            </Text>
          </>
        </AppFooter>
      </PageFooter>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AppTemplate>
  );
};

export default VehicleConfirmation;
