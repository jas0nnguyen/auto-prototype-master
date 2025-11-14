import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestCard } from '../../components/everest/core/EverestCard';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestTextInput } from '../../components/everest/core/EverestTextInput';
import { EverestButton } from '../../components/everest/core/EverestButton';
import './EmailCollection.css';

/**
 * EmailCollection Screen (Screen 03 of 16) - Everest Design
 *
 * Collects contact information:
 * - Email (required) - will be used for user account creation later
 * - Mobile phone (optional)
 *
 * Design:
 * - Centered layout (max-width 600px)
 * - Headline: "How can we reach you?"
 * - Email input (required)
 * - Phone input (optional)
 * - Back + Continue buttons
 *
 * These will be saved as Communication entities (type: EMAIL, MOBILE)
 */

interface EmailCollectionFormData {
  email: string;
  mobile_phone: string;
}

const EmailCollection: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EmailCollectionFormData>({
    email: '',
    mobile_phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EmailCollectionFormData, string>>>({});

  const handleInputChange = (field: keyof EmailCollectionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmailCollectionFormData, string>> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile phone validation (optional, but must be valid if provided)
    if (formData.mobile_phone.trim()) {
      const digitsOnly = formData.mobile_phone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        newErrors.mobile_phone = 'Phone number must be 10 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhoneNumber = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    }
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('mobile_phone', formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Store email data in unified quote-v2-data structure
      const quoteData = JSON.parse(sessionStorage.getItem('quote-v2-data') || '{}');
      quoteData.email = {
        email: formData.email,
        mobile: formData.mobile_phone || null
      };
      sessionStorage.setItem('quote-v2-data', JSON.stringify(quoteData));

      // Also store separately for backward compatibility
      sessionStorage.setItem('quote-v2-email-collection', JSON.stringify(formData));

      // Navigate to loading screen where quote will be created
      navigate('/quote-v2/loading-prefill');
    }
  };

  const handleBack = () => {
    navigate('/quote-v2/effective-date');
  };

  return (
    <EverestLayout>
      <EverestContainer>
        <EverestCard>
          <div className="email-collection-content">
            <EverestTitle variant="h2">
              How can we reach you?
            </EverestTitle>
            <EverestText variant="subtitle">
              We'll use this to send your quote and policy documents
            </EverestText>

            <form onSubmit={handleSubmit} className="email-collection-form">
              <div className="email-collection-inputs">
                <EverestTextInput
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="you@example.com"
                  required
                />

                <EverestTextInput
                  type="tel"
                  label="Mobile Phone (Optional)"
                  value={formData.mobile_phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  error={errors.mobile_phone}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                />

                <EverestText variant="small" className="email-collection-disclaimer">
                  By providing your email, you agree to receive quote details and policy information.
                </EverestText>
              </div>

              <div className="email-collection-actions">
                <EverestButton
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={handleBack}
                >
                  Back
                </EverestButton>
                <EverestButton type="submit" variant="primary" size="large">
                  Continue
                </EverestButton>
              </div>
            </form>
          </div>
        </EverestCard>
      </EverestContainer>
    </EverestLayout>
  );
};

export default EmailCollection;
