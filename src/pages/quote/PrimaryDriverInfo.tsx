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
} from '@sureapp/canary-design-system';
import { useCreateQuote, useQuoteByNumber, useUpdatePrimaryDriver } from '../../hooks/useQuote';

const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

const states = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Texas', value: 'TX' },
  { label: 'New York', value: 'NY' },
];

interface DriverFormData {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  email: string;
  address: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
}

const PrimaryDriverInfo: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber?: string }>();
  const createQuote = useCreateQuote();
  const updatePrimaryDriver = useUpdatePrimaryDriver();
  const { data: existingQuote, isLoading: isLoadingQuote } = useQuoteByNumber(quoteNumber);

  const [formData, setFormData] = useState<DriverFormData>({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    email: '',
    address: '',
    apt: '',
    city: '',
    state: '',
    zip: '',
  });
  const [originalData, setOriginalData] = useState<DriverFormData | null>(null);

  // Load existing quote data when navigating back
  useEffect(() => {
    if (existingQuote && existingQuote.driver) {
      const loadedData = {
        firstName: existingQuote.driver.firstName || '',
        lastName: existingQuote.driver.lastName || '',
        dob: existingQuote.driver.birthDate || '',
        gender: existingQuote.driver.gender || '',
        maritalStatus: existingQuote.driver.maritalStatus || '',
        email: existingQuote.driver.email || '',
        address: existingQuote.address?.addressLine1 || '',
        apt: existingQuote.address?.addressLine2 || '',
        city: existingQuote.address?.city || '',
        state: existingQuote.address?.state || '',
        zip: existingQuote.address?.zipCode || '',
      };
      setFormData(loadedData);
      setOriginalData(loadedData); // Store original data to detect changes
    }
  }, [existingQuote]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateZip = (zip: string): boolean => {
    const zipRegex = /^\d{5}$/;
    return zipRegex.test(zip);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate ZIP code
    if (!validateZip(formData.zip)) {
      alert('Please enter a valid 5-digit ZIP code');
      return;
    }

    try {
      let resultQuoteNumber: string;

      if (quoteNumber && originalData) {
        // Existing quote - check if email changed
        if (formData.email !== originalData.email) {
          // Email changed - create NEW quote since email is the unique identifier
          const quoteData = {
            driver_first_name: formData.firstName,
            driver_last_name: formData.lastName,
            driver_birth_date: formData.dob,
            driver_email: formData.email,
            driver_phone: '555-0000',
            driver_gender: formData.gender,
            driver_marital_status: formData.maritalStatus,
            address_line_1: formData.address,
            address_line_2: formData.apt,
            address_city: formData.city,
            address_state: formData.state,
            address_zip: formData.zip,
            vehicle_year: 2020,
            vehicle_make: 'Placeholder',
            vehicle_model: 'TBD',
            vehicle_vin: `PH${Date.now().toString().substring(3)}${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          };

          const result = await createQuote.mutateAsync(quoteData);
          resultQuoteNumber = result.quoteNumber;
        } else {
          // Email unchanged - check if other fields changed
          const hasChanges =
            formData.firstName !== originalData.firstName ||
            formData.lastName !== originalData.lastName ||
            formData.dob !== originalData.dob ||
            formData.gender !== originalData.gender ||
            formData.maritalStatus !== originalData.maritalStatus ||
            formData.address !== originalData.address ||
            formData.apt !== originalData.apt ||
            formData.city !== originalData.city ||
            formData.state !== originalData.state ||
            formData.zip !== originalData.zip;

          if (hasChanges) {
            // Update existing quote with new driver/address data
            await updatePrimaryDriver.mutateAsync({
              quoteNumber,
              driverData: {
                driver_first_name: formData.firstName,
                driver_last_name: formData.lastName,
                driver_birth_date: formData.dob,
                driver_email: formData.email,
                driver_phone: '555-0000',
                driver_gender: formData.gender,
                driver_marital_status: formData.maritalStatus,
                address_line_1: formData.address,
                address_line_2: formData.apt,
                address_city: formData.city,
                address_state: formData.state,
                address_zip: formData.zip,
              },
            });
          }
          // Use existing quote number (whether updated or not)
          resultQuoteNumber = quoteNumber;
        }
      } else {
        // New quote - create it
        const quoteData = {
          driver_first_name: formData.firstName,
          driver_last_name: formData.lastName,
          driver_birth_date: formData.dob,
          driver_email: formData.email,
          driver_phone: '555-0000',
          driver_gender: formData.gender,
          driver_marital_status: formData.maritalStatus,
          address_line_1: formData.address,
          address_line_2: formData.apt,
          address_city: formData.city,
          address_state: formData.state,
          address_zip: formData.zip,
          vehicle_year: 2020,
          vehicle_make: 'Placeholder',
          vehicle_model: 'TBD',
          vehicle_vin: `PH${Date.now().toString().substring(3)}${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        };

        const result = await createQuote.mutateAsync(quoteData);
        resultQuoteNumber = result.quoteNumber;
      }

      // Navigate to additional drivers with quote number
      navigate(`/quote/additional-drivers/${resultQuoteNumber}`);
    } catch (error) {
      console.error('Failed to save driver info:', error);
      alert('Failed to save driver information. Please try again.');
    }
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
                  onClick={() => navigate('/')}
                  emphasis="text"
                  startIcon={ChevronLeft}
                >
                  Back
                </Button>
              }
              hasBorder={false}
              hasPadding={false}
              supportText="We need some information about you to calculate your personalized rate."
              title="About You"
              titleSize="title-1"
            />
          </AppTemplate.Title>

          <Form onSubmit={handleSubmit}>
            <Section title="Personal Information">
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
                  id="marital-status"
                  label="Marital status"
                  size="small"
                  placeholder="Select marital status"
                  value={formData.maritalStatus}
                  onChange={(value) => setFormData({ ...formData, maritalStatus: value })}
                  options={[
                    { label: 'Single', value: 'single' },
                    { label: 'Married', value: 'married' },
                    { label: 'Divorced', value: 'divorced' },
                    { label: 'Widowed', value: 'widowed' },
                  ]}
                />
              </Form.Row>

              <TextInput
                id="email"
                label="Email"
                size="small"
                type="email"
                placeholder="john.smith@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                helpText="We'll send your quote and policy documents here"
              />
            </Section>

            <Section title="Where do you live?">
              <Form.Group preset="address-group">
                <TextInput
                  id="address"
                  label="Street address"
                  size="small"
                  placeholder="123 Main St"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <TextInput
                  id="apt"
                  label="Apartment, suite, etc."
                  size="small"
                  value={formData.apt}
                  onChange={(e) => setFormData({ ...formData, apt: e.target.value })}
                />
                <TextInput
                  id="city"
                  label="City"
                  size="small"
                  placeholder="Los Angeles"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <Select
                  id="state"
                  label="State"
                  size="small"
                  placeholder="Select state"
                  value={formData.state}
                  onChange={(value) => setFormData({ ...formData, state: value })}
                  options={states}
                />
                <TextInput
                  id="zip"
                  label="ZIP code"
                  size="small"
                  placeholder="90001"
                  required
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                />
              </Form.Group>
            </Section>

            <div style={{ marginTop: '2rem' }}>
              <Button
                type="submit"
                size="large"
                variant="primary"
                isFullWidth
                disabled={createQuote.isPending}
              >
                {createQuote.isPending ? 'Creating quote...' : 'Continue'}
              </Button>
            </div>
          </Form>
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
              Your information is encrypted and secure. We use industry-standard security
              to protect your personal data.
            </Text>
          </>
        </AppFooter>
      </PageFooter>
    </AppTemplate>
  );
};

export default PrimaryDriverInfo;
