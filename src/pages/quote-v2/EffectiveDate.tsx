import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestCard } from '../../components/everest/core/EverestCard';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestTextInput } from '../../components/everest/core/EverestTextInput';
import { EverestButton } from '../../components/everest/core/EverestButton';
import './EffectiveDate.css';

/**
 * EffectiveDate Screen (Screen 02 of 16) - Everest Design
 *
 * Collects the desired coverage start date.
 * Defaults to tomorrow (today + 1 day) per spec.
 *
 * Design:
 * - Centered single-field layout
 * - Large headline: "When do you want coverage to begin?"
 * - Subtitle explaining common choices
 * - Date input centered with max-width 500px
 * - Back + Continue buttons
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
      // Store effective date in unified quote-v2-data structure
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
    <EverestLayout>
      <EverestContainer>
        <EverestCard>
          {/* Centered content */}
          <div className="effective-date-content">
            <EverestTitle variant="h2">
              When do you want coverage to begin?
            </EverestTitle>
            <EverestText variant="subtitle">
              Most customers choose to start coverage tomorrow or on the first day of the month
            </EverestText>

            <form onSubmit={handleSubmit} className="effective-date-form">
              <div className="effective-date-input-wrapper">
                <EverestTextInput
                  type="date"
                  label="Coverage Start Date"
                  value={effectiveDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  error={error}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // tomorrow
                  required
                />
              </div>

              <div className="effective-date-actions">
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

export default EffectiveDate;
