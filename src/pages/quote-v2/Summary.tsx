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

      console.log('[Summary] Saving vehicle:', updatedVehicle);

      // Check if this is a new vehicle (ID starts with "vehicle-new-")
      const isNewVehicle = updatedVehicle.id.startsWith('vehicle-new-');

      let allVehicles = [];

      if (isNewVehicle) {
        // Add new vehicle to existing vehicles
        const existingVehicles = (quote.vehicles || []).map(v => ({
          year: v.year,
          make: v.make,
          model: v.model,
          vin: v.vin,
          bodyType: v.bodyType,
          annualMileage: v.annualMileage
        }));

        const newVehicleData = {
          year: updatedVehicle.year,
          make: updatedVehicle.make,
          model: updatedVehicle.model,
          vin: updatedVehicle.vin,
          bodyType: updatedVehicle.bodyType,
          annualMileage: updatedVehicle.annualMileage
        };

        allVehicles = [...existingVehicles, newVehicleData];
      } else {
        // Update existing vehicle
        const vehicleIndex = parseInt(updatedVehicle.id.replace('vehicle-', ''));
        allVehicles = (quote.vehicles || []).map((v, index) => {
          if (index === vehicleIndex) {
            return {
              year: updatedVehicle.year,
              make: updatedVehicle.make,
              model: updatedVehicle.model,
              vin: updatedVehicle.vin,
              bodyType: updatedVehicle.bodyType,
              annualMileage: updatedVehicle.annualMileage
            };
          }
          return {
            year: v.year,
            make: v.make,
            model: v.model,
            vin: v.vin,
            bodyType: v.bodyType,
            annualMileage: v.annualMileage
          };
        });
      }

      await updateVehicles.mutateAsync({
        quoteNumber,
        vehicles: allVehicles
      });

      setIsVehicleModalOpen(false);
      setSelectedVehicle(null);
    } catch (err) {
      console.error('[Summary] Error saving vehicle:', err);
      alert('Failed to save vehicle. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDriver = async (updatedDriver: Driver) => {
    if (!quoteNumber || !quote) return;

    try {
      setIsSaving(true);

      console.log('[Summary] Saving driver:', updatedDriver);

      // Check if this is a new driver (ID starts with "driver-new-")
      const isNewDriver = updatedDriver.id.startsWith('driver-new-');
      const isPrimaryDriver = updatedDriver.id === 'driver-0';

      if (isPrimaryDriver) {
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
            driver_license_number: updatedDriver.licenseNumber,
            driver_license_state: updatedDriver.licenseState,
            address_line_1: quote.address?.addressLine1 || '',
            address_line_2: quote.address?.addressLine2 || '',
            address_city: quote.address?.city || '',
            address_state: quote.address?.state || '',
            address_zip: quote.address?.zipCode || ''
          }
        });
      } else if (isNewDriver) {
        // Add new additional driver
        const existingDrivers = (quote.additionalDrivers || []).map(d => ({
          first_name: d.firstName,
          last_name: d.lastName,
          birth_date: d.birthDate,
          email: d.email || '',
          phone: d.phone || '',
          gender: d.gender,
          marital_status: d.maritalStatus,
          relationship: d.relationship,
          license_number: d.licenseNumber,
          license_state: d.licenseState
        }));

        // Add the new driver
        const newDriverData = {
          first_name: updatedDriver.firstName,
          last_name: updatedDriver.lastName,
          birth_date: updatedDriver.birthDate,
          email: '', // New drivers don't have email yet
          phone: '',
          gender: updatedDriver.genderCode,
          marital_status: updatedDriver.maritalStatus,
          relationship: updatedDriver.relationshipType || 'SPOUSE',
          license_number: updatedDriver.licenseNumber,
          license_state: updatedDriver.licenseState
        };

        await updateAdditionalDrivers.mutateAsync({
          quoteNumber,
          additionalDrivers: [...existingDrivers, newDriverData]
        });
      } else {
        // Update existing additional driver
        const driverIndex = parseInt(updatedDriver.id.replace('driver-', '')) - 1;
        const additionalDrivers = (quote.additionalDrivers || []).map((d, index) => {
          if (index === driverIndex) {
            return {
              first_name: updatedDriver.firstName,
              last_name: updatedDriver.lastName,
              birth_date: updatedDriver.birthDate,
              email: d.email || '',
              phone: d.phone || '',
              gender: updatedDriver.genderCode,
              marital_status: updatedDriver.maritalStatus,
              relationship: updatedDriver.relationshipType,
              license_number: updatedDriver.licenseNumber,
              license_state: updatedDriver.licenseState
            };
          }
          return {
            first_name: d.firstName,
            last_name: d.lastName,
            birth_date: d.birthDate,
            email: d.email || '',
            phone: d.phone || '',
            gender: d.gender,
            marital_status: d.maritalStatus,
            relationship: d.relationship,
            license_number: d.licenseNumber,
            license_state: d.licenseState
          };
        });

        await updateAdditionalDrivers.mutateAsync({
          quoteNumber,
          additionalDrivers
        });
      }

      setIsDriverModalOpen(false);
      setSelectedDriver(null);
    } catch (err) {
      console.error('[Summary] Error saving driver:', err);
      alert('Failed to save driver. Please try again.');
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

  const handleAddVehicle = () => {
    // TODO: Implement add vehicle functionality
    // For now, open modal with empty vehicle
    const newVehicle: Vehicle = {
      id: `vehicle-new-${Date.now()}`,
      year: new Date().getFullYear(),
      make: '',
      model: '',
      vin: '',
      bodyType: '',
      annualMileage: 12000
    };
    setSelectedVehicle(newVehicle);
    setIsVehicleModalOpen(true);
  };

  const handleAddDriver = () => {
    // TODO: Implement add driver functionality
    // For now, open modal with empty driver
    const newDriver: Driver = {
      id: `driver-new-${Date.now()}`,
      firstName: '',
      lastName: '',
      birthDate: '',
      genderCode: '',
      maritalStatus: '',
      licenseNumber: '',
      licenseState: '',
      relationshipType: 'SPOUSE'
    };
    setSelectedDriver(newDriver);
    setIsDriverModalOpen(true);
  };

  const handleRemoveVehicle = async (vehicleId: string) => {
    if (!quoteNumber || !quote) return;

    // Prevent removing the last vehicle (must have at least one)
    if (vehicles.length <= 1) {
      alert('You must have at least one vehicle on your policy.');
      return;
    }

    // Confirm deletion
    if (!confirm('Are you sure you want to remove this vehicle?')) {
      return;
    }

    try {
      setIsSaving(true);

      // Get the vehicle index to remove
      const vehicleIndex = parseInt(vehicleId.replace('vehicle-', ''));

      // Filter out the vehicle to remove
      const remainingVehicles = (quote.vehicles || [])
        .filter((_, index) => index !== vehicleIndex)
        .map(v => ({
          year: v.year,
          make: v.make,
          model: v.model,
          vin: v.vin,
          bodyType: v.bodyType,
          annualMileage: v.annualMileage
        }));

      await updateVehicles.mutateAsync({
        quoteNumber,
        vehicles: remainingVehicles
      });

      console.log('[Summary] Vehicle removed successfully');
    } catch (err) {
      console.error('[Summary] Error removing vehicle:', err);
      alert('Failed to remove vehicle. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveDriver = async (driverId: string) => {
    if (!quoteNumber || !quote) return;

    // Prevent removing primary driver
    if (driverId === 'driver-0') {
      alert('Cannot remove the primary driver.');
      return;
    }

    // Confirm deletion
    if (!confirm('Are you sure you want to remove this driver?')) {
      return;
    }

    try {
      setIsSaving(true);

      // Get the driver index to remove (subtract 1 because primary driver is driver-0)
      const driverIndex = parseInt(driverId.replace('driver-', '')) - 1;

      // Filter out the driver to remove
      const remainingDrivers = (quote.additionalDrivers || [])
        .filter((_, index) => index !== driverIndex)
        .map(d => ({
          first_name: d.firstName,
          last_name: d.lastName,
          birth_date: d.birthDate,
          email: d.email || '',
          phone: d.phone || '',
          gender: d.gender,
          marital_status: d.maritalStatus,
          relationship: d.relationship,
          license_number: d.licenseNumber,
          license_state: d.licenseState
        }));

      await updateAdditionalDrivers.mutateAsync({
        quoteNumber,
        additionalDrivers: remainingDrivers
      });

      console.log('[Summary] Driver removed successfully');
    } catch (err) {
      console.error('[Summary] Error removing driver:', err);
      alert('Failed to remove driver. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
  // The API returns camelCase snapshot data without database IDs
  console.log('[Summary] Quote data:', quote);

  const vehicles: Vehicle[] = [];

  // Try vehicles array first (multi-vehicle quotes)
  if (quote.vehicles && quote.vehicles.length > 0) {
    quote.vehicles.forEach((v: any, index: number) => {
      vehicles.push({
        id: `vehicle-${index}`, // Generate temporary ID since API doesn't return DB IDs
        year: v.year,
        make: v.make,
        model: v.model,
        vin: v.vin || '',
        bodyType: v.bodyType,
        annualMileage: v.annualMileage
      });
    });
  }
  // Fallback to single vehicle (legacy format)
  else if (quote.vehicle) {
    vehicles.push({
      id: 'vehicle-0',
      year: quote.vehicle.year,
      make: quote.vehicle.make,
      model: quote.vehicle.model,
      vin: quote.vehicle.vin || '',
      bodyType: quote.vehicle.bodyType,
      annualMileage: quote.vehicle.annualMileage
    });
  }

  console.log('[Summary] Mapped vehicles:', vehicles);

  const drivers: Driver[] = [];

  // Add primary driver (API uses camelCase)
  if (quote.driver) {
    drivers.push({
      id: 'driver-0', // Generate temporary ID
      firstName: quote.driver.firstName,
      lastName: quote.driver.lastName,
      birthDate: quote.driver.birthDate || '',
      genderCode: quote.driver.gender,
      maritalStatus: quote.driver.maritalStatus,
      licenseNumber: quote.driver.licenseNumber || undefined,
      licenseState: quote.driver.licenseState || undefined,
    });
  }

  // Add additional drivers (API uses camelCase)
  if (quote.additionalDrivers && quote.additionalDrivers.length > 0) {
    quote.additionalDrivers.forEach((driver: any, index: number) => {
      drivers.push({
        id: `driver-${index + 1}`, // Generate temporary ID
        firstName: driver.firstName,
        lastName: driver.lastName,
        birthDate: driver.birthDate || '',
        genderCode: driver.gender,
        maritalStatus: driver.maritalStatus,
        licenseNumber: driver.licenseNumber || undefined,
        licenseState: driver.licenseState || undefined,
        relationshipType: driver.relationship
      });
    });
  }

  console.log('[Summary] Mapped drivers:', drivers);

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
                        <Layout display="flex" gap="small">
                          <Button
                            variant="secondary"
                            size="medium"
                            onClick={() => handleEditVehicle(vehicle)}
                            style={{ backgroundColor: '#667eea', color: 'white', border: 'none' }}
                          >
                            Edit
                          </Button>
                          {vehicles.length > 1 && (
                            <Button
                              variant="secondary"
                              size="medium"
                              onClick={() => handleRemoveVehicle(vehicle.id)}
                              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                              disabled={isSaving}
                            >
                              Remove
                            </Button>
                          )}
                        </Layout>
                      </Layout>
                    </Card>
                  ))
                ) : (
                  <Text variant="body-regular" color="subtle">
                    No vehicles found. Please add a vehicle.
                  </Text>
                )}

                <Button
                  variant="secondary"
                  size="medium"
                  onClick={handleAddVehicle}
                  style={{ backgroundColor: '#667eea', color: 'white', border: 'none' }}
                >
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
                        <Layout display="flex" gap="small">
                          <Button
                            variant="secondary"
                            size="medium"
                            onClick={() => handleEditDriver(driver)}
                            style={{ backgroundColor: '#667eea', color: 'white', border: 'none' }}
                          >
                            Edit
                          </Button>
                          {index !== 0 && (
                            <Button
                              variant="secondary"
                              size="medium"
                              onClick={() => handleRemoveDriver(driver.id)}
                              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                              disabled={isSaving}
                            >
                              Remove
                            </Button>
                          )}
                        </Layout>
                      </Layout>
                    </Card>
                  ))
                ) : (
                  <Text variant="body-regular" color="subtle">
                    No drivers found.
                  </Text>
                )}

                <Button
                  variant="secondary"
                  size="medium"
                  onClick={handleAddDriver}
                  style={{ backgroundColor: '#667eea', color: 'white', border: 'none' }}
                >
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
            <PriceSidebar quote={quote} />
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
 *
 * NOTE: We don't use QuoteProvider here because it expects a quote UUID,
 * but we only have the quote number. Instead, SummaryContent fetches
 * the quote directly using useQuoteByNumber and passes it to PriceSidebar.
 */
const Summary: React.FC = () => {
  return <SummaryContent />;
};

export default Summary;
