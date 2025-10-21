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
  Form,
  Section,
  TextInput,
  Select,
  Link,
  Text,
  ChevronLeft,
  Card,
} from '@sureapp/canary-design-system';

const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

interface AdditionalDriverData {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  relationship: string; // spouse, child, parent, sibling, other
  yearsLicensed?: number;
}

const AdditionalDrivers: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<AdditionalDriverData[]>([]);
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<AdditionalDriverData, 'id'>>({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    relationship: '',
    yearsLicensed: undefined,
  });

  // Check if primary driver exists (this is second step)
  useEffect(() => {
    const quoteData = sessionStorage.getItem('quoteData');
    if (!quoteData) {
      // Redirect back to driver info if no data
      navigate('/quote/driver-info');
      return;
    }

    const parsedData = JSON.parse(quoteData);
    if (!parsedData.primaryDriver) {
      navigate('/quote/driver-info');
      return;
    }

    // Load existing additional drivers if any
    if (parsedData.additionalDrivers && Array.isArray(parsedData.additionalDrivers)) {
      setDrivers(parsedData.additionalDrivers);
    }
  }, [navigate]);

  const handleAddDriver = () => {
    setIsAddingDriver(true);
    setEditingDriverId(null);
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      relationship: '',
      yearsLicensed: undefined,
    });
  };

  const handleEditDriver = (driver: AdditionalDriverData) => {
    setIsAddingDriver(true);
    setEditingDriverId(driver.id);
    setFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      dob: driver.dob,
      gender: driver.gender,
      relationship: driver.relationship,
      yearsLicensed: driver.yearsLicensed,
    });
  };

  const handleRemoveDriver = (driverId: string) => {
    const updatedDrivers = drivers.filter(d => d.id !== driverId);
    setDrivers(updatedDrivers);

    // Update sessionStorage
    const existingData = JSON.parse(sessionStorage.getItem('quoteData') || '{}');
    const updatedData = {
      ...existingData,
      additionalDrivers: updatedDrivers,
    };
    sessionStorage.setItem('quoteData', JSON.stringify(updatedData));
  };

  const handleCancelForm = () => {
    setIsAddingDriver(false);
    setEditingDriverId(null);
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      relationship: '',
      yearsLicensed: undefined,
    });
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDriverId) {
      // Update existing driver
      const updatedDrivers = drivers.map(d =>
        d.id === editingDriverId
          ? { ...formData, id: editingDriverId }
          : d
      );
      setDrivers(updatedDrivers);

      // Update sessionStorage
      const existingData = JSON.parse(sessionStorage.getItem('quoteData') || '{}');
      const updatedData = {
        ...existingData,
        additionalDrivers: updatedDrivers,
      };
      sessionStorage.setItem('quoteData', JSON.stringify(updatedData));
    } else {
      // Add new driver
      const newDriver: AdditionalDriverData = {
        ...formData,
        id: `driver-${Date.now()}`, // Simple unique ID
      };
      const updatedDrivers = [...drivers, newDriver];
      setDrivers(updatedDrivers);

      // Update sessionStorage
      const existingData = JSON.parse(sessionStorage.getItem('quoteData') || '{}');
      const updatedData = {
        ...existingData,
        additionalDrivers: updatedDrivers,
      };
      sessionStorage.setItem('quoteData', JSON.stringify(updatedData));
    }

    // Reset form
    handleCancelForm();
  };

  const handleContinue = () => {
    // Save current state to sessionStorage (already saved when adding/removing drivers)
    // Navigate to vehicles page (next step)
    navigate('/quote/vehicles');
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
                  onClick={() => navigate('/quote/driver-info')}
                  emphasis="text"
                  startIcon={ChevronLeft}
                >
                  Back
                </Button>
              }
              hasBorder={false}
              hasPadding={false}
              supportText="Add any additional drivers who will be using the vehicles on this policy."
              title="Additional Drivers"
              titleSize="title-1"
            />
          </AppTemplate.Title>

          {/* List of existing drivers */}
          {drivers.length > 0 && !isAddingDriver && (
            <Section title={`Additional Drivers (${drivers.length})`}>
              {drivers.map((driver) => (
                <Card key={driver.id} style={{ marginBottom: '1rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <Text variant="body-medium" style={{ fontWeight: 600 }}>
                        {driver.firstName} {driver.lastName}
                      </Text>
                      <Text variant="body-small" style={{ color: '#666', marginTop: '0.25rem' }}>
                        {driver.relationship.charAt(0).toUpperCase() + driver.relationship.slice(1)} • DOB: {driver.dob} • {driver.gender}
                      </Text>
                      {driver.yearsLicensed && (
                        <Text variant="body-small" style={{ color: '#666' }}>
                          {driver.yearsLicensed} years licensed
                        </Text>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        size="small"
                        emphasis="text"
                        onClick={() => handleEditDriver(driver)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        emphasis="text"
                        onClick={() => handleRemoveDriver(driver.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </Section>
          )}

          {/* Add/Edit Driver Form */}
          {isAddingDriver ? (
            <Form onSubmit={handleSaveDriver}>
              <Section title={editingDriverId ? 'Edit Driver' : 'Add Driver'}>
                <Form.Row layout="1-1">
                  <TextInput
                    id="first-name"
                    label="First name"
                    size="small"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  <TextInput
                    id="last-name"
                    label="Last name"
                    size="small"
                    placeholder="Smith"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </Form.Row>

                <TextInput
                  id="dob"
                  label="Date of birth"
                  size="small"
                  placeholder="MM/DD/YYYY"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  helpText="Must be at least 16 years old"
                />

                <Form.Row layout="1-1">
                  <Select
                    id="gender"
                    label="Gender"
                    size="small"
                    placeholder="Select gender"
                    value={formData.gender}
                    onChange={(value) => setFormData({ ...formData, gender: value })}
                    options={[
                      { label: 'Male', value: 'male' },
                      { label: 'Female', value: 'female' },
                      { label: 'Other', value: 'other' },
                    ]}
                  />
                  <Select
                    id="relationship"
                    label="Relationship to primary driver"
                    size="small"
                    placeholder="Select relationship"
                    required
                    value={formData.relationship}
                    onChange={(value) => setFormData({ ...formData, relationship: value })}
                    options={[
                      { label: 'Spouse', value: 'spouse' },
                      { label: 'Child', value: 'child' },
                      { label: 'Parent', value: 'parent' },
                      { label: 'Sibling', value: 'sibling' },
                      { label: 'Other', value: 'other' },
                    ]}
                  />
                </Form.Row>

                <TextInput
                  id="years-licensed"
                  label="Years licensed (optional)"
                  size="small"
                  type="number"
                  placeholder="5"
                  value={formData.yearsLicensed?.toString() || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    yearsLicensed: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                />

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <Button
                    type="submit"
                    size="medium"
                    variant="primary"
                  >
                    {editingDriverId ? 'Update Driver' : 'Add Driver'}
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
              {/* Add Another Driver Button */}
              <div style={{ marginTop: '1.5rem' }}>
                <Button
                  size="medium"
                  emphasis="outlined"
                  onClick={handleAddDriver}
                  isFullWidth
                >
                  + Add Another Driver
                </Button>
              </div>

              {/* Continue Button */}
              <div style={{ marginTop: '2rem' }}>
                <Button
                  onClick={handleContinue}
                  size="large"
                  variant="primary"
                  isFullWidth
                >
                  Continue to Vehicles
                </Button>
              </div>

              {/* Skip Link */}
              {drivers.length === 0 && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleContinue();
                    }}
                  >
                    Skip - No additional drivers
                  </Link>
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
              All drivers with access to your vehicles should be listed on your policy.
              This helps ensure accurate pricing and coverage.
            </Text>
          </>
        </AppFooter>
      </PageFooter>
    </AppTemplate>
  );
};

export default AdditionalDrivers;
