import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestCard } from '../../components/everest/core/EverestCard';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestTextInput } from '../../components/everest/core/EverestTextInput';
import { EverestSelect } from '../../components/everest/core/EverestSelect';
import { EverestButton } from '../../components/everest/core/EverestButton';
import './GetStarted.css';

/**
 * GetStarted Screen (Screen 01 of 16) - Everest Design
 *
 * Collects basic information about the primary driver/policyholder:
 * - Name (first, last)
 * - Address (line 1, line 2 optional, city, state, zip)
 * - Date of birth
 *
 * Design:
 * - Hero headline: "Reach new heights with better coverage"
 * - Subtitle with value proposition
 * - 2-column form grid (responsive to 1 column on mobile)
 * - Everest blue background with car silhouette
 * - Frosted glass card design
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
      // Store form data in sessionStorage for progressive quote flow
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
    <EverestLayout>
      <EverestContainer>
        <EverestCard>
          {/* Hero Section */}
          <div className="get-started-hero">
            <EverestTitle variant="hero">
              Reach new heights with better coverage
            </EverestTitle>
            <EverestText variant="subtitle">
              Get a personalized auto insurance quote in minutes. No hidden fees, just straightforward protection.
            </EverestText>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="get-started-form">
            {/* Name Row */}
            <div className="get-started-form-row">
              <EverestTextInput
                label="First Name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                error={errors.first_name}
                required
                placeholder="John"
              />
              <EverestTextInput
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                error={errors.last_name}
                required
                placeholder="Smith"
              />
            </div>

            {/* Address Row */}
            <EverestTextInput
              label="Street Address"
              value={formData.line_1_address}
              onChange={(e) => handleInputChange('line_1_address', e.target.value)}
              error={errors.line_1_address}
              required
              placeholder="123 Main St"
            />

            <EverestTextInput
              label="Apartment, Suite, etc. (Optional)"
              value={formData.line_2_address}
              onChange={(e) => handleInputChange('line_2_address', e.target.value)}
              placeholder="Apt 4B"
            />

            {/* City, State, ZIP Row */}
            <div className="get-started-form-row get-started-form-row-3col">
              <EverestTextInput
                label="City"
                value={formData.municipality_name}
                onChange={(e) => handleInputChange('municipality_name', e.target.value)}
                error={errors.municipality_name}
                required
                placeholder="San Francisco"
              />
              <EverestSelect
                label="State"
                value={formData.state_code}
                onChange={(value) => handleInputChange('state_code', value)}
                options={US_STATES}
                error={errors.state_code}
                required
                placeholder="Select state"
              />
              <EverestTextInput
                label="ZIP Code"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                error={errors.postal_code}
                required
                placeholder="94102"
                maxLength={5}
              />
            </div>

            {/* Date of Birth */}
            <EverestTextInput
              label="Date of Birth"
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleInputChange('birth_date', e.target.value)}
              error={errors.birth_date}
              required
              max={new Date().toISOString().split('T')[0]}
            />

            {/* Submit Button */}
            <div className="get-started-form-actions">
              <EverestButton type="submit" variant="primary" size="large" fullWidth>
                Get My Quote →
              </EverestButton>
            </div>
          </form>
        </EverestCard>
      </EverestContainer>
    </EverestLayout>
  );
};

export default GetStarted;
