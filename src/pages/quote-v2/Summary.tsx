import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestCard } from '../../components/everest/core/EverestCard';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestButton } from '../../components/everest/core/EverestButton';
import { EverestBadge } from '../../components/everest/core/EverestBadge';
import { EverestPriceSidebar } from '../../components/everest/specialized/EverestPriceSidebar';
import {
  useQuoteByNumber,
  useUpdateQuoteVehicles,
  useUpdatePrimaryDriver,
  useUpdateQuoteDrivers
} from '../../hooks/useQuote';
import { EditVehicleModal } from './components/modals/EditVehicleModal';
import { EditDriverModal } from './components/modals/EditDriverModal';
import './Summary.css';

/**
 * Summary Screen (Screen 05 of 16) - Everest Design
 *
 * Displays prefilled vehicle and driver information from the quote API.
 * Two-column layout: main content + EverestPriceSidebar
 *
 * Design:
 * - Two-column layout with PriceSidebar
 * - Vehicle cards grid (2 columns) with edit links
 * - "Add Another Vehicle" button (dashed border)
 * - Driver cards grid (2 columns) with badges (Named Insured, Household Member)
 * - "Add Another Driver" button
 * - Back + Continue to Coverage buttons
 *
 * Features:
 * - Vehicle cards with edit/remove buttons
 * - Driver cards with edit/remove buttons
 * - Modal editing (EditVehicleModal, EditDriverModal)
 * - Real-time price updates via PriceSidebar
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

const Summary: React.FC = () => {
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
    navigate('/quote-v2/get-started');
  };

  const handleAddVehicle = () => {
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
      <EverestLayout>
        <EverestContainer>
          <div className="summary-loading">
            <EverestTitle variant="h2">Loading your quote...</EverestTitle>
          </div>
        </EverestContainer>
      </EverestLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <EverestLayout>
        <EverestContainer>
          <div className="summary-error">
            <EverestTitle variant="h2">Error Loading Quote</EverestTitle>
            <EverestText variant="body">
              {error instanceof Error ? error.message : 'Failed to load quote data'}
            </EverestText>
            <EverestButton variant="primary" onClick={() => navigate('/quote-v2/get-started')}>
              Start Over
            </EverestButton>
          </div>
        </EverestContainer>
      </EverestLayout>
    );
  }

  // Not found state
  if (!quote) {
    return (
      <EverestLayout>
        <EverestContainer>
          <div className="summary-error">
            <EverestTitle variant="h2">Quote Not Found</EverestTitle>
            <EverestText variant="body">
              We couldn't find quote number: {quoteNumber}
            </EverestText>
            <EverestButton variant="primary" onClick={() => navigate('/quote-v2/get-started')}>
              Start Over
            </EverestButton>
          </div>
        </EverestContainer>
      </EverestLayout>
    );
  }

  // Map API response to component format
  console.log('[Summary] Quote data:', quote);

  const vehicles: Vehicle[] = [];

  // Try vehicles array first (multi-vehicle quotes)
  if (quote.vehicles && quote.vehicles.length > 0) {
    quote.vehicles.forEach((v: any, index: number) => {
      vehicles.push({
        id: `vehicle-${index}`,
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

  // Add primary driver
  if (quote.driver) {
    drivers.push({
      id: 'driver-0',
      firstName: quote.driver.firstName,
      lastName: quote.driver.lastName,
      birthDate: quote.driver.birthDate || '',
      genderCode: quote.driver.gender,
      maritalStatus: quote.driver.maritalStatus,
      licenseNumber: quote.driver.licenseNumber || undefined,
      licenseState: quote.driver.licenseState || undefined,
    });
  }

  // Add additional drivers
  if (quote.additionalDrivers && quote.additionalDrivers.length > 0) {
    quote.additionalDrivers.forEach((driver: any, index: number) => {
      drivers.push({
        id: `driver-${index + 1}`,
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
    <EverestLayout>
      <EverestContainer>
        <EverestCard>
          <div className="summary-layout">
            {/* Main Content */}
            <div className="summary-main">
              {/* Vehicles Section */}
              <div className="summary-section">
                <EverestTitle variant="h2">Your Vehicles</EverestTitle>
                <EverestText variant="body" style={{ color: '#718096', marginTop: '8px', marginBottom: '24px' }}>
                  We found these vehicles from your current policy. Feel free to add more or edit our suggestions.
                </EverestText>

              <div className="summary-cards-grid">
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle, index) => (
                    <EverestCard key={vehicle.id}>
                      <div className="summary-card-content">
                        <div className="summary-card-header">
                          <div className="summary-card-icon"></div>
                          <span className="summary-card-title">Vehicle {index + 1}</span>
                        </div>
                        <div className="summary-card-subtitle">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        <div className="summary-card-detail">
                          VIN: {vehicle.vin}
                        </div>
                        {vehicle.bodyType && (
                          <div className="summary-card-detail">
                            Body Type: {vehicle.bodyType}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                          <a
                            href="#"
                            className="summary-card-link"
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditVehicle(vehicle);
                            }}
                          >
                            Edit vehicle details →
                          </a>
                          {vehicles.length > 1 && (
                            <a
                              href="#"
                              className="summary-card-link"
                              style={{ color: '#ef4444' }}
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveVehicle(vehicle.id);
                              }}
                            >
                              Remove
                            </a>
                          )}
                        </div>
                      </div>
                    </EverestCard>
                  ))
                ) : (
                  <EverestText variant="body">
                    No vehicles found. Please add a vehicle.
                  </EverestText>
                )}
              </div>

              <EverestButton
                variant="secondary"
                size="medium"
                onClick={handleAddVehicle}
                className="summary-add-button"
              >
                + Add Another Vehicle
              </EverestButton>
            </div>

            {/* Drivers Section */}
            <div className="summary-section">
              <EverestTitle variant="h2">Your Drivers</EverestTitle>
              <EverestText variant="body" style={{ color: '#718096', marginTop: '8px', marginBottom: '24px' }}>
                Review driver information and add anyone else who will be driving your vehicles.
              </EverestText>

              <div className="summary-cards-grid">
                {drivers.length > 0 ? (
                  drivers.map((driver, index) => (
                    <EverestCard key={driver.id}>
                      <div className="summary-card-content">
                        <div className="summary-card-header">
                          <div className="summary-card-icon"></div>
                          <span className="summary-card-title">{index === 0 ? 'Primary Insured' : 'Additional Driver'}</span>
                        </div>
                        <div className="summary-card-subtitle">
                          {driver.firstName} {driver.lastName}
                        </div>
                        {driver.licenseNumber && (
                          <div className="summary-card-detail">
                            License: {driver.licenseNumber}
                          </div>
                        )}
                        <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                          {index === 0 ? (
                            <EverestBadge variant="success">Named Insured</EverestBadge>
                          ) : (
                            <EverestBadge variant="info">Household Member</EverestBadge>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                          <a
                            href="#"
                            className="summary-card-link"
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditDriver(driver);
                            }}
                          >
                            Edit driver info →
                          </a>
                          {index !== 0 && (
                            <a
                              href="#"
                              className="summary-card-link"
                              style={{ color: '#ef4444' }}
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveDriver(driver.id);
                              }}
                            >
                              Remove
                            </a>
                          )}
                        </div>
                      </div>
                    </EverestCard>
                  ))
                ) : (
                  <EverestText variant="body">
                    No drivers found.
                  </EverestText>
                )}
              </div>

              <EverestButton
                variant="secondary"
                size="medium"
                onClick={handleAddDriver}
                className="summary-add-button"
              >
                + Add Another Driver
              </EverestButton>
            </div>

            {/* Navigation Buttons */}
            <div className="summary-actions">
              <EverestButton
                type="button"
                variant="secondary"
                size="large"
                onClick={handleBack}
              >
                Start Over
              </EverestButton>
              <EverestButton
                type="button"
                variant="primary"
                size="large"
                onClick={handleContinue}
              >
                Next: Select Coverage →
              </EverestButton>
            </div>
          </div>

          {/* Price Sidebar */}
          <div className="summary-sidebar">
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

      {/* Modals */}
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
    </EverestLayout>
  );
};

export default Summary;
