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
} from '@sureapp/canary-design-system';

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

const DriverInfo: React.FC = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    // Check if vehicle info exists
    const quoteData = sessionStorage.getItem('quoteData');
    if (!quoteData) {
      // Redirect back to vehicle info if no data
      navigate('/quote/vehicle-info');
    }
  }, [navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateZip = (zip: string): boolean => {
    const zipRegex = /^\d{5}$/;
    return zipRegex.test(zip);
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    // Merge with existing quote data
    const existingData = JSON.parse(sessionStorage.getItem('quoteData') || '{}');
    const updatedData = {
      ...existingData,
      driver: formData,
    };
    sessionStorage.setItem('quoteData', JSON.stringify(updatedData));

    // Navigate to coverage selection
    navigate('/quote/coverage-selection');
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
                  href="/quote/vehicle-info"
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
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                  required
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
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
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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

            <Form.Actions>
              <Button
                type="submit"
                size="large"
                variant="primary"
                isFullWidth
              >
                Continue to Coverage
              </Button>
            </Form.Actions>
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

export default DriverInfo;
