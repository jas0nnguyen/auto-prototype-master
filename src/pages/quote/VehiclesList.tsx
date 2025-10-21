import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Form,
  Section,
  TextInput,
  Select,
  Link,
  Text,
  ChevronLeft,
  Card,
} from '@sureapp/canary-design-system';
import { useQuoteByNumber, useUpdateQuoteVehicles } from '../../hooks/useQuote';

const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

interface VehicleData {
  id: string;
  year: string;
  make: string;
  model: string;
  vin?: string;
  primaryDriverId: string; // ID of driver assigned as primary for this vehicle
}

interface DriverOption {
  label: string;
  value: string;
}

const VehiclesList: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const updateQuoteVehicles = useUpdateQuoteVehicles();
  const { data: quote, isLoading: isLoadingQuote } = useQuoteByNumber(quoteNumber);

  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [driverOptions, setDriverOptions] = useState<DriverOption[]>([]);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<VehicleData, 'id'>>({
    year: '',
    make: '',
    model: '',
    vin: '',
    primaryDriverId: '',
  });
  const [vinError, setVinError] = useState<string>('');

  // Load quote data and build driver options
  useEffect(() => {
    if (!quoteNumber) {
      navigate('/quote/driver-info');
      return;
    }

    if (!quote) return;

    // Build driver options from quote data
    const options: DriverOption[] = [];

    // Add primary driver from quote.driver object
    if (quote.driver) {
      options.push({
        label: `${quote.driver.firstName} ${quote.driver.lastName} (Primary)`,
        value: 'primary',
      });
    }

    // Add additional drivers
    if (quote.additionalDrivers && Array.isArray(quote.additionalDrivers)) {
      quote.additionalDrivers.forEach((driver: any, index: number) => {
        options.push({
          label: `${driver.firstName} ${driver.lastName}`,
          value: driver.id || `driver-${index + 1}`,
        });
      });
    }

    setDriverOptions(options);

    // Load existing vehicles from quote if any, filtering out placeholder vehicles
    if (quote.vehicles && Array.isArray(quote.vehicles)) {
      const realVehicles = quote.vehicles
        .filter((v: any) => v.make !== 'Placeholder' && !v.vin?.startsWith('PLACEHOLDER'))
        .map((v: any) => ({
          id: v.id || 'vehicle-' + v.vin,
          year: v.year?.toString() || '',
          make: v.make || '',
          model: v.model || '',
          vin: v.vin || '',
          primaryDriverId: v.primary_driver_id || 'primary',
        }));
      setVehicles(realVehicles);
    }
  }, [navigate, quoteNumber, quote]);

  const validateVIN = (vin: string): boolean => {
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin.trim().toUpperCase());
  };

  const handleVinChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setFormData({ ...formData, vin: upperValue });

    if (upperValue.length > 0 && upperValue.length < 17) {
      setVinError('VIN must be exactly 17 characters');
    } else if (upperValue.length === 17 && !validateVIN(upperValue)) {
      setVinError('Invalid VIN format');
    } else {
      setVinError('');
    }
  };

  const handleAddVehicle = () => {
    setIsAddingVehicle(true);
    setEditingVehicleId(null);
    setFormData({
      year: '',
      make: '',
      model: '',
      vin: '',
      primaryDriverId: driverOptions[0]?.value || '', // Default to first driver
    });
    setVinError('');
  };

  const handleEditVehicle = (vehicle: VehicleData) => {
    setIsAddingVehicle(true);
    setEditingVehicleId(vehicle.id);
    setFormData({
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      vin: vehicle.vin || '',
      primaryDriverId: vehicle.primaryDriverId,
    });
    setVinError('');
  };

  const handleRemoveVehicle = (vehicleId: string) => {
    const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
    setVehicles(updatedVehicles);
  };

  const handleCancelForm = () => {
    setIsAddingVehicle(false);
    setEditingVehicleId(null);
    setFormData({
      year: '',
      make: '',
      model: '',
      vin: '',
      primaryDriverId: '',
    });
    setVinError('');
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate VIN if provided
    if (formData.vin && !validateVIN(formData.vin)) {
      setVinError('Please enter a valid 17-character VIN');
      return;
    }

    if (editingVehicleId) {
      // Update existing vehicle
      const updatedVehicles = vehicles.map(v =>
        v.id === editingVehicleId
          ? { ...formData, id: editingVehicleId }
          : v
      );
      setVehicles(updatedVehicles);
    } else {
      // Add new vehicle
      const newVehicle: VehicleData = {
        ...formData,
        id: `vehicle-${Date.now()}`, // Simple unique ID
      };
      const updatedVehicles = [...vehicles, newVehicle];
      setVehicles(updatedVehicles);
    }

    // Reset form
    handleCancelForm();
  };

  const handleContinue = async () => {
    if (vehicles.length === 0) {
      alert('Please add at least one vehicle');
      return;
    }

    if (!quoteNumber) return;

    try {
      // Convert local vehicle format to API format
      const apiVehicles = vehicles.map(vehicle => ({
        year: parseInt(vehicle.year),
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin || undefined,
        body_type: 'sedan', // Default
        annual_mileage: 12000, // Default
        primary_driver_id: vehicle.primaryDriverId,
      }));

      // Update quote with vehicles via API
      await updateQuoteVehicles.mutateAsync({
        quoteNumber,
        vehicles: apiVehicles,
      });

      // Navigate to coverage selection (skip vehicle confirmation for now)
      navigate(`/quote/coverage-selection/${quoteNumber}`);
    } catch (error) {
      console.error('Failed to update vehicles:', error);
      alert('Failed to update vehicles. Please try again.');
    }
  };

  const getDriverName = (driverId: string): string => {
    const driver = driverOptions.find(d => d.value === driverId);
    return driver ? driver.label : 'Unknown Driver';
  };

  return (
    <AppTemplate preset="purchase-flow">
      <PageHeader>
        <AppHeader
          logo={logoSrc}
          logoHref="/"
        />
      </PageHeader>

      <Main>
        <Content>
          <AppTemplate.Title>
            <Header
              breadcrumbs={
                <Button
                  onClick={() => navigate(`/quote/additional-drivers/${quoteNumber}`)}
                  emphasis="text"
                  startIcon={ChevronLeft}
                >
                  Back
                </Button>
              }
              hasBorder={false}
              hasPadding={false}
              supportText="Add all vehicles that will be covered under this policy."
              title="Your Vehicles"
              titleSize="title-1"
            />
          </AppTemplate.Title>

          {/* List of existing vehicles */}
          {vehicles.length > 0 && !isAddingVehicle && (
            <Section title={`Vehicles (${vehicles.length})`}>
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} style={{ marginBottom: '1rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <Text variant="body-medium" style={{ fontWeight: 600 }}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        size="small"
                        emphasis="text"
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        emphasis="text"
                        onClick={() => handleRemoveVehicle(vehicle.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </Section>
          )}

          {/* Add/Edit Vehicle Form */}
          {isAddingVehicle ? (
            <Form onSubmit={handleSaveVehicle}>
              <Section title={editingVehicleId ? 'Edit Vehicle' : 'Add Vehicle'}>
                <Form.Row layout="1-1">
                  <Select
                    id="vehicle-year"
                    label="Year"
                    size="small"
                    placeholder="Select year"
                    value={formData.year}
                    onChange={(value) => setFormData({ ...formData, year: value })}
                    options={[
                      { label: '2024', value: '2024' },
                      { label: '2023', value: '2023' },
                      { label: '2022', value: '2022' },
                      { label: '2021', value: '2021' },
                      { label: '2020', value: '2020' },
                      { label: '2019', value: '2019' },
                      { label: '2018', value: '2018' },
                      { label: '2017', value: '2017' },
                      { label: '2016', value: '2016' },
                      { label: '2015', value: '2015' },
                      { label: '2014', value: '2014' },
                      { label: '2013', value: '2013' },
                      { label: '2012', value: '2012' },
                      { label: '2011', value: '2011' },
                      { label: '2010', value: '2010' },
                    ]}
                  />
                  <Select
                    id="vehicle-make"
                    label="Make"
                    size="small"
                    placeholder="Select make"
                    value={formData.make}
                    onChange={(value) => setFormData({ ...formData, make: value })}
                    options={[
                      { label: 'Toyota', value: 'Toyota' },
                      { label: 'Honda', value: 'Honda' },
                      { label: 'Ford', value: 'Ford' },
                      { label: 'Chevrolet', value: 'Chevrolet' },
                      { label: 'Nissan', value: 'Nissan' },
                      { label: 'Tesla', value: 'Tesla' },
                      { label: 'BMW', value: 'BMW' },
                      { label: 'Mercedes-Benz', value: 'Mercedes-Benz' },
                      { label: 'Audi', value: 'Audi' },
                      { label: 'Subaru', value: 'Subaru' },
                    ]}
                  />
                </Form.Row>

                <TextInput
                  id="vehicle-model"
                  label="Model"
                  size="small"
                  placeholder="e.g., Camry, Civic, F-150"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />

                <TextInput
                  id="vehicle-vin"
                  label="VIN (Optional)"
                  size="small"
                  placeholder="17-character VIN"
                  value={formData.vin}
                  onChange={(e) => handleVinChange(e.target.value)}
                  helpText="Vehicle Identification Number - helps us get you the most accurate quote"
                  error={vinError}
                />

                <Select
                  id="primary-driver"
                  label="Primary driver for this vehicle"
                  size="small"
                  placeholder="Select primary driver"
                  required
                  value={formData.primaryDriverId}
                  onChange={(value) => setFormData({ ...formData, primaryDriverId: value })}
                  options={driverOptions}
                  helpText="Who drives this vehicle most often?"
                />

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <Button
                    type="submit"
                    size="medium"
                    variant="primary"
                  >
                    {editingVehicleId ? 'Update Vehicle' : 'Add Vehicle'}
                  </Button>
                  <Button
                    type="button"
                    size="medium"
                    emphasis="text"
                    onClick={handleCancelForm}
                  >
                    Cancel
                  </Button>
                </div>
              </Section>
            </Form>
          ) : (
            <>
              {/* Add Another Vehicle Button */}
              <div style={{ marginTop: '1.5rem' }}>
                <Button
                  size="medium"
                  emphasis="outlined"
                  onClick={handleAddVehicle}
                  isFullWidth
                >
                  + Add Another Vehicle
                </Button>
              </div>

              {/* Continue Button */}
              {vehicles.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <Button
                    onClick={handleContinue}
                    size="large"
                    variant="primary"
                    isFullWidth
                    disabled={updateQuoteVehicles.isPending || isLoadingQuote}
                  >
                    {updateQuoteVehicles.isPending ? 'Updating vehicles...' : 'Continue to Coverage Selection'}
                  </Button>

                  {/* Multi-car discount indicator */}
                  {vehicles.length >= 2 && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                      <Text variant="body-small" style={{ color: '#0070f3' }}>
                        🎉 Multi-car discount applied! You'll save 15% on your premium.
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
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
              All vehicles garaged at your address should be listed on your policy.
              This helps ensure proper coverage and accurate pricing.
            </Text>
          </>
        </AppFooter>
      </PageFooter>
    </AppTemplate>
  );
};

export default VehiclesList;
