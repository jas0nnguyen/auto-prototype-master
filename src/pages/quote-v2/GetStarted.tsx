import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Container,
  Title,
  Text,
  TextInput,
  Select,
  Button
} from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { ScreenProgress } from './components/ScreenProgress';

/**
 * GetStarted Screen (Screen 01 of 19)
 *
 * Collects basic information about the primary driver/policyholder:
 * - Name (first, last)
 * - Address (line 1, line 2 optional, city, state, zip)
 * - Date of birth
 *
 * This is the entry point for the tech-startup quote flow (/quote-v2/*)
 */

interface GetStartedFormData {
  first_name: string;
  last_name: string;
  line_1_address: string;
  line_2_address: string;
  municipality_name: string;
  state_code: string;
  postal_code: string;
  birth_date: string;
}

const US_STATES = [
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
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
];

const GetStarted: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<GetStartedFormData>({
    first_name: '',
    last_name: '',
    line_1_address: '',
    line_2_address: '',
    municipality_name: '',
    state_code: '',
    postal_code: '',
    birth_date: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GetStartedFormData, string>>>({});

  const handleInputChange = (field: keyof GetStartedFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof GetStartedFormData, string>> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.line_1_address.trim()) {
      newErrors.line_1_address = 'Street address is required';
    }
    if (!formData.municipality_name.trim()) {
      newErrors.municipality_name = 'City is required';
    }
    if (!formData.state_code) {
      newErrors.state_code = 'State is required';
    }
    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'ZIP code is required';
    } else if (!/^\d{5}$/.test(formData.postal_code)) {
      newErrors.postal_code = 'ZIP code must be 5 digits';
    }
    if (!formData.birth_date) {
      newErrors.birth_date = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // T086: Store form data in sessionStorage for progressive quote flow
      // Quote-v2 uses progressive data collection - we'll create the actual quote
      // after collecting all required data (drivers, vehicles, coverage)
      sessionStorage.setItem('quote-v2-get-started', JSON.stringify(formData));

      // Initialize quote data structure in sessionStorage
      const quoteData = {
        getStarted: formData,
        effectiveDate: null,
        email: null,
        drivers: [],
        vehicles: [],
        coverage: {},
        addOns: {}
      };
      sessionStorage.setItem('quote-v2-data', JSON.stringify(quoteData));

      // Navigate to next screen
      navigate('/quote-v2/effective-date');
    }
  };

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={1} totalScreens={19} />

      <Container padding="large">
        <Layout display="flex-column" gap="large" flexAlign="center">
          <Title variant="display-2" align="center">
            Let's Get Started
          </Title>

          <Text variant="body-large" align="center" color="subtle">
            Tell us a bit about yourself to begin your quote
          </Text>

          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px' }}>
            <Layout display="flex-column" gap="medium">
              {/* Name Section */}
              <Layout display="flex-column" gap="small">
                <Title variant="title-4">Your Name</Title>

                <Layout display="flex" gap="medium">
                  <div style={{ flex: 1 }}>
                    <TextInput
                      type="text"
                      label="First Name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      error={!!errors.first_name}
                      errorMessage={errors.first_name}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <TextInput
                      type="text"
                      label="Last Name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      error={!!errors.last_name}
                      errorMessage={errors.last_name}
                      required
                    />
                  </div>
                </Layout>
              </Layout>

              {/* Address Section */}
              <Layout display="flex-column" gap="small">
                <Title variant="title-4">Your Address</Title>

                <TextInput
                  type="text"
                  label="Street Address"
                  value={formData.line_1_address}
                  onChange={(e) => handleInputChange('line_1_address', e.target.value)}
                  error={!!errors.line_1_address}
                  errorMessage={errors.line_1_address}
                  required
                />

                <TextInput
                  type="text"
                  label="Apartment, Suite, etc. (Optional)"
                  value={formData.line_2_address}
                  onChange={(e) => handleInputChange('line_2_address', e.target.value)}
                />

                <Layout display="flex" gap="medium">
                  <div style={{ flex: 2 }}>
                    <TextInput
                      type="text"
                      label="City"
                      value={formData.municipality_name}
                      onChange={(e) => handleInputChange('municipality_name', e.target.value)}
                      error={!!errors.municipality_name}
                      errorMessage={errors.municipality_name}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Select
                      id="state"
                      label="State"
                      size="small"
                      placeholder="Select state"
                      value={formData.state_code}
                      onChange={(value) => handleInputChange('state_code', value)}
                      options={US_STATES}
                      error={!!errors.state_code}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <TextInput
                      type="text"
                      label="ZIP Code"
                      value={formData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      error={!!errors.postal_code}
                      errorMessage={errors.postal_code}
                      maxLength={5}
                      required
                    />
                  </div>
                </Layout>
              </Layout>

              {/* Date of Birth */}
              <Layout display="flex-column" gap="small">
                <Title variant="title-4">Your Date of Birth</Title>
                <TextInput
                  type="date"
                  label="Date of Birth"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  error={!!errors.birth_date}
                  errorMessage={errors.birth_date}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </Layout>

              {/* Submit Button */}
              <Layout display="flex" flexJustify="flex-end" padding={{ top: 'medium' }}>
                <Button type="submit" variant="primary" size="large">
                  Continue
                </Button>
              </Layout>
            </Layout>
          </form>
        </Layout>
      </Container>
    </TechStartupLayout>
  );
};

export default GetStarted;
