import React, { useState } from 'react';
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
import {
  useQuoteByNumber,
  useUpdateQuoteVehicles,
  useUpdatePrimaryDriver,
  useUpdateQuoteDrivers
} from '../../hooks/useQuote';
import { EditVehicleModal } from './components/modals/EditVehicleModal';
import { EditDriverModal } from './components/modals/EditDriverModal';

/**
 * Summary Screen (Screen 05 of 19) - T090-T091
 *
 * Displays prefilled vehicle and driver information from the quote API.
 * Two-column layout: main content + PriceSidebar
 *
 * Features:
 * - Vehicle cards with edit buttons
 * - Driver cards with edit buttons
 * - "Add Another Vehicle/Driver" buttons
 * - Modal editing (EditVehicleModal, EditDriverModal)
 *
 * Data Flow:
 * 1. Get quoteNumber from URL params
 * 2. Fetch quote data using useQuoteByNumber hook
 * 3. Display vehicles and drivers from quote
 * 4. Handle loading and error states
 */

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  vin: string;
  bodyType?: string;
  annualMileage?: number;
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  genderCode?: string;
  maritalStatus?: string;
  licenseNumber?: string;
  licenseState?: string;
  relationshipType?: string;
}

const SummaryContent: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  // Fetch quote data by quote number
  const { data: quote, isLoading, error } = useQuoteByNumber(quoteNumber);

  // Mutations for updating quote
  const updateVehicles = useUpdateQuoteVehicles();
  const updatePrimaryDriver = useUpdatePrimaryDriver();
  const updateAdditionalDrivers = useUpdateQuoteDrivers();

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDriverModalOpen(true);
  };

  const handleSaveVehicle = async (updatedVehicle: Vehicle) => {
    if (!quoteNumber || !quote) return;

    try {
      setIsSaving(true);

      // Get all vehicles and update the edited one
      const allVehicles = quote.vehicles?.map(v =>
        v.vehicle_id === updatedVehicle.id
          ? {
              year: updatedVehicle.year,
              make: updatedVehicle.make,
              model: updatedVehicle.model,
              vin: updatedVehicle.vin,
              body_type: updatedVehicle.bodyType,
              annual_mileage: updatedVehicle.annualMileage
            }
          : {
              year: v.year,
              make: v.make,
              model: v.model,
              vin: v.vin,
              body_type: v.body_type,
              annual_mileage: v.annual_mileage
            }
      ) || [];

      await updateVehicles.mutateAsync({
        quoteNumber,
        vehicles: allVehicles
      });

      setIsVehicleModalOpen(false);
      setSelectedVehicle(null);
    } catch (err) {
      console.error('[Summary] Error saving vehicle:', err);
      // Could show error toast here
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDriver = async (updatedDriver: Driver) => {
    if (!quoteNumber || !quote) return;

    try {
      setIsSaving(true);

      // Determine if this is the primary driver (index 0)
      const drivers: Driver[] = [];
      if (quote.driver) {
        drivers.push({
          id: quote.driver.party_id,
          firstName: quote.driver.first_name,
          lastName: quote.driver.last_name,
          birthDate: quote.driver.birth_date,
          genderCode: quote.driver.gender_code,
          maritalStatus: quote.driver.marital_status_code,
          licenseNumber: quote.driver.license_number,
          licenseState: quote.driver.license_state_code,
        });
      }

      const isPrimary = drivers[0]?.id === updatedDriver.id;

      if (isPrimary) {
        // Update primary driver
        await updatePrimaryDriver.mutateAsync({
          quoteNumber,
          driverData: {
            driver_first_name: updatedDriver.firstName,
            driver_last_name: updatedDriver.lastName,
            driver_birth_date: updatedDriver.birthDate,
            driver_email: quote.driver?.email || '',
            driver_phone: quote.driver?.phone || '',
            driver_gender: updatedDriver.genderCode,
            driver_marital_status: updatedDriver.maritalStatus,
            address_line_1: quote.driver?.address?.line_1_address || '',
            address_line_2: quote.driver?.address?.line_2_address,
            address_city: quote.driver?.address?.municipality_name || '',
            address_state: quote.driver?.address?.state_code || '',
            address_zip: quote.driver?.address?.postal_code || ''
          }
        });
      } else {
        // Update additional driver
        const additionalDrivers = quote.additionalDrivers?.map(d =>
          d.party_id === updatedDriver.id
            ? {
                first_name: updatedDriver.firstName,
                last_name: updatedDriver.lastName,
                birth_date: updatedDriver.birthDate,
                email: d.email,
                phone: d.phone,
                gender: updatedDriver.genderCode,
                marital_status: updatedDriver.maritalStatus,
                relationship: updatedDriver.relationshipType
              }
            : {
                first_name: d.first_name,
                last_name: d.last_name,
                birth_date: d.birth_date,
                email: d.email,
                phone: d.phone,
                gender: d.gender_code,
                marital_status: d.marital_status_code,
                relationship: d.relationship_to_primary
              }
        ) || [];

        await updateAdditionalDrivers.mutateAsync({
          quoteNumber,
          additionalDrivers
        });
      }

      setIsDriverModalOpen(false);
      setSelectedDriver(null);
    } catch (err) {
      console.error('[Summary] Error saving driver:', err);
      // Could show error toast here
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    navigate(`/quote-v2/coverage/${quoteNumber}`);
  };

  const handleBack = () => {
    navigate('/quote-v2/loading-prefill');
  };

  // Loading state
  if (isLoading) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={5} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center" flexJustify="center">
            <Title variant="title-2">Loading your quote...</Title>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={5} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center">
            <Title variant="title-2" color="error">Error Loading Quote</Title>
            <Text variant="body-regular" color="subtle" align="center">
              {error instanceof Error ? error.message : 'Failed to load quote data'}
            </Text>
            <Button variant="primary" onClick={() => navigate('/quote-v2/get-started')}>
              Start Over
            </Button>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  // Not found state
  if (!quote) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={5} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center">
            <Title variant="title-2">Quote Not Found</Title>
            <Text variant="body-regular" color="subtle" align="center">
              We couldn't find quote number: {quoteNumber}
            </Text>
            <Button variant="primary" onClick={() => navigate('/quote-v2/get-started')}>
              Start Over
            </Button>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  // Map API response to component format
  const vehicles: Vehicle[] = quote.vehicles?.map(v => ({
    id: v.vehicle_id,
    year: v.year,
    make: v.make,
    model: v.model,
    vin: v.vin || '',
    bodyType: v.body_type,
    annualMileage: v.annual_mileage
  })) || [];

  const drivers: Driver[] = [];

  // Add primary driver
  if (quote.driver) {
    drivers.push({
      id: quote.driver.party_id,
      firstName: quote.driver.first_name,
      lastName: quote.driver.last_name,
      birthDate: quote.driver.birth_date,
      genderCode: quote.driver.gender_code,
      maritalStatus: quote.driver.marital_status_code,
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
        birthDate: driver.birth_date,
        genderCode: driver.gender_code,
        maritalStatus: driver.marital_status_code,
        licenseNumber: driver.license_number,
        licenseState: driver.license_state_code,
        relationshipType: driver.relationship_to_primary
      });
    });
  }

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={5} totalScreens={19} />

      <Container padding="large">
        <Layout display="flex" gap="large">
          {/* Main Content */}
          <div style={{ flex: 1 }}>
            <Layout display="flex-column" gap="large">
              <Title variant="display-2">Review Your Information</Title>

              <Text variant="body-large" color="subtle">
                We've prefilled your information. Please review and make any necessary changes.
              </Text>

              {/* Vehicles Section */}
              <Layout display="flex-column" gap="medium">
                <Title variant="title-3">Your Vehicles</Title>

                {vehicles.length > 0 ? (
                  vehicles.map(vehicle => (
                    <Card key={vehicle.id} padding="medium">
                      <Layout display="flex" flexJustify="space-between" flexAlign="center">
                        <Layout display="flex-column" gap="small">
                          <Title variant="title-4">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </Title>
                          <Text variant="body-regular" color="subtle">
                            VIN: {vehicle.vin}
                          </Text>
                          {vehicle.bodyType && (
                            <Text variant="body-small" color="subtle">
                              Body Type: {vehicle.bodyType}
                            </Text>
                          )}
                        </Layout>
                        <Button
                          variant="secondary"
                          size="medium"
                          onClick={() => handleEditVehicle(vehicle)}
                        >
                          Edit
                        </Button>
                      </Layout>
                    </Card>
                  ))
                ) : (
                  <Text variant="body-regular" color="subtle">
                    No vehicles found. Please add a vehicle.
                  </Text>
                )}

                <Button variant="secondary" size="medium">
                  + Add Another Vehicle
                </Button>
              </Layout>

              {/* Drivers Section */}
              <Layout display="flex-column" gap="medium">
                <Title variant="title-3">Your Drivers</Title>

                {drivers.length > 0 ? (
                  drivers.map((driver, index) => (
                    <Card key={driver.id} padding="medium">
                      <Layout display="flex" flexJustify="space-between" flexAlign="center">
                        <Layout display="flex-column" gap="small">
                          <Title variant="title-4">
                            {driver.firstName} {driver.lastName}
                            {index === 0 && ' (Primary)'}
                          </Title>
                          <Text variant="body-regular" color="subtle">
                            Date of Birth: {new Date(driver.birthDate).toLocaleDateString()}
                          </Text>
                          {driver.licenseNumber && (
                            <Text variant="body-small" color="subtle">
                              License: {driver.licenseNumber}
                            </Text>
                          )}
                        </Layout>
                        <Button
                          variant="secondary"
                          size="medium"
                          onClick={() => handleEditDriver(driver)}
                        >
                          Edit
                        </Button>
                      </Layout>
                    </Card>
                  ))
                ) : (
                  <Text variant="body-regular" color="subtle">
                    No drivers found.
                  </Text>
                )}

                <Button variant="secondary" size="medium">
                  + Add Another Driver
                </Button>
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
                  Continue to Coverage
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

      {/* Modals - T090-T091 */}
      {isVehicleModalOpen && selectedVehicle && (
        <EditVehicleModal
          vehicle={selectedVehicle}
          isOpen={isVehicleModalOpen}
          onClose={() => setIsVehicleModalOpen(false)}
          onSave={handleSaveVehicle}
        />
      )}

      {isDriverModalOpen && selectedDriver && (
        <EditDriverModal
          driver={selectedDriver}
          isPrimary={drivers.findIndex(d => d.id === selectedDriver.id) === 0}
          isOpen={isDriverModalOpen}
          onClose={() => setIsDriverModalOpen(false)}
          onSave={handleSaveDriver}
        />
      )}
    </TechStartupLayout>
  );
};

/**
 * Summary Component Wrapper with QuoteProvider
 *
 * Wraps SummaryContent with QuoteProvider to provide quote context.
 * This enables PriceSidebar and other components to access quote data.
 */
const Summary: React.FC = () => {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  // Get quote data to extract quoteId for QuoteProvider
  const { data: quote } = useQuoteByNumber(quoteNumber);

  if (!quote) {
    // Show loading or error without context (handled in SummaryContent)
    return <SummaryContent />;
  }

  return (
    <QuoteProvider quoteId={quote.quoteId}>
      <SummaryContent />
    </QuoteProvider>
  );
};

export default Summary;
