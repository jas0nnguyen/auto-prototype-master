import React, { useState } from 'react';
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
  Form,
  Section,
  TextInput,
  Select,
  Button,
  Link,
  Text,
} from '@sureapp/canary-design-system';

const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

interface VehicleFormData {
  year: string;
  make: string;
  model: string;
  vin: string;
}

const VehicleInfo: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VehicleFormData>({
    year: '',
    make: '',
    model: '',
    vin: '',
  });
  const [vinError, setVinError] = useState<string>('');

  const validateVIN = (vin: string): boolean => {
    // Basic VIN validation (17 characters, alphanumeric, no I, O, Q)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin.trim().toUpperCase());
  };

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFormData({ ...formData, vin: value });

    if (value.length > 0 && value.length < 17) {
      setVinError('VIN must be exactly 17 characters');
    } else if (value.length === 17 && !validateVIN(value)) {
      setVinError('Invalid VIN format');
    } else {
      setVinError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form data:', formData);

    // Validate required fields
    if (!formData.year || !formData.make || !formData.model) {
      alert('Please fill in all required vehicle information');
      console.log('Missing fields - year:', formData.year, 'make:', formData.make, 'model:', formData.model);
      return;
    }

    // Validate VIN if provided
    if (formData.vin && !validateVIN(formData.vin)) {
      setVinError('Please enter a valid 17-character VIN');
      return;
    }

    // Save to sessionStorage for next step
    sessionStorage.setItem('quoteData', JSON.stringify({ vehicle: formData }));

    // Navigate to driver info
    navigate('/quote/driver-info');
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
              hasBorder={false}
              hasPadding={false}
              supportText="Let's start with your vehicle information. We'll use this to calculate your personalized quote."
              title="Tell Us About Your Vehicle"
              titleSize="title-1"
            />
          </AppTemplate.Title>

          <Form onSubmit={handleSubmit}>
            <Section title="Vehicle Details">
              <Form.Row layout="1-1">
                <Select
                  id="vehicle-year"
                  label="Year"
                  size="small"
                  placeholder="Select year"
                  onChange={(value) => {
                    console.log('Year selected:', value);
                    setFormData({ ...formData, year: value });
                  }}
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
                  onChange={(value) => {
                    console.log('Make selected:', value);
                    setFormData({ ...formData, make: value });
                  }}
                  options={[
                    { label: 'Toyota', value: 'toyota' },
                    { label: 'Honda', value: 'honda' },
                    { label: 'Ford', value: 'ford' },
                    { label: 'Chevrolet', value: 'chevrolet' },
                    { label: 'Nissan', value: 'nissan' },
                    { label: 'Tesla', value: 'tesla' },
                    { label: 'BMW', value: 'bmw' },
                    { label: 'Mercedes-Benz', value: 'mercedes' },
                    { label: 'Audi', value: 'audi' },
                    { label: 'Subaru', value: 'subaru' },
                  ]}
                />
              </Form.Row>

              <TextInput
                id="vehicle-model"
                label="Model"
                size="small"
                placeholder="e.g., Camry, Civic, F-150"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />

              <TextInput
                id="vehicle-vin"
                label="VIN (Optional)"
                size="small"
                placeholder="17-character VIN"
                value={formData.vin}
                onChange={handleVinChange}
                helpText="Vehicle Identification Number - helps us get you the most accurate quote"
                error={vinError}
              />
            </Section>

            <div style={{ marginTop: '2rem' }}>
              <Button
                type="submit"
                size="large"
                variant="primary"
                isFullWidth
              >
                Continue to Driver Info
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
              Auto insurance quotes provided through AutoProtect Insurance Services, LLC,
              a licensed insurance producer. Your information is encrypted and secure.
            </Text>
          </>
        </AppFooter>
      </PageFooter>
    </AppTemplate>
  );
};

export default VehicleInfo;
