import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Container,
  Title,
  Text,
  TextInput,
  Button
} from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { ScreenProgress } from './components/ScreenProgress';

/**
 * EffectiveDate Screen (Screen 02 of 19)
 *
 * Collects the desired coverage start date.
 * Defaults to tomorrow (today + 1 day) per spec.
 *
 * Business Rule: Coverage can start as early as tomorrow
 */

const EffectiveDate: React.FC = () => {
  const navigate = useNavigate();
  const [effectiveDate, setEffectiveDate] = useState('');
  const [error, setError] = useState('');

  // Set default to tomorrow on mount
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEffectiveDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleDateChange = (value: string) => {
    setEffectiveDate(value);
    if (error) {
      setError('');
    }
  };

  const validateDate = (): boolean => {
    if (!effectiveDate) {
      setError('Coverage start date is required');
      return false;
    }

    // Compare date strings directly to avoid timezone issues
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (effectiveDate < tomorrowStr) {
      setError('Coverage must start tomorrow or later');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateDate()) {
      // T087: Store effective date in unified quote-v2-data structure
      const quoteData = JSON.parse(sessionStorage.getItem('quote-v2-data') || '{}');
      quoteData.effectiveDate = effectiveDate;
      sessionStorage.setItem('quote-v2-data', JSON.stringify(quoteData));

      // Also store separately for backward compatibility
      sessionStorage.setItem('quote-v2-effective-date', effectiveDate);

      // Navigate to next screen
      navigate('/quote-v2/email-collection');
    }
  };

  const handleBack = () => {
    navigate('/quote-v2/get-started');
  };

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={2} totalScreens={19} />

      <Container padding="large">
        <Layout display="flex-column" gap="large" flexAlign="center">
          <Title variant="display-2" align="center">
            When do you want coverage to begin?
          </Title>

          <Text variant="body-large" align="center" color="subtle">
            Select the date your policy should start
          </Text>

          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
            <Layout display="flex-column" gap="large">
              <div>
                <TextInput
                  type="date"
                  label="Coverage Start Date"
                  value={effectiveDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  error={!!error}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // tomorrow
                  required
                />
                {error && (
                  <Text variant="body-small" color="error" style={{ marginTop: '4px' }}>
                    {error}
                  </Text>
                )}
              </div>

              <Layout display="flex" gap="medium" flexJustify="space-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={handleBack}
                >
                  Back
                </Button>
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

export default EffectiveDate;
