import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestLoadingAnimation } from '../../components/everest/specialized/EverestLoadingAnimation';
import { useQuoteByNumber } from '../../hooks/useQuote';
import './LoadingValidation.css';

/**
 * LoadingValidation Screen (Screen 08 of 16) - Everest Design
 *
 * Displays loading animation while finalizing the quote:
 * 1. Vehicle valuation (~2s) - simulates external lookup
 * 2. Driver records check (~2s) - simulates MVR lookup
 * 3. Finalizing premium calculation (~1s) - final recalculation
 *
 * Design:
 * - Centered layout with EverestLoadingAnimation
 * - Headline "Almost there! Verifying your information..."
 * - Step indicators with animations
 * - Auto-navigates to Review screen when complete
 */

interface LoadingStep {
  label: string;
  status: 'pending' | 'loading' | 'completed';
}

const LoadingValidation: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  // Get quote data to verify it exists
  const { data: quote } = useQuoteByNumber(quoteNumber);

  const [steps, setSteps] = useState<LoadingStep[]>([
    { label: 'Vehicle valuation', status: 'pending' },
    { label: 'Driver records check', status: 'pending' },
    { label: 'Finalizing premium calculation', status: 'pending' },
  ]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // T098: LoadingValidation orchestration
    // Note: Premium calculation already happened in Coverage/AddOns screens
    // This screen simulates final validation checks before Review
    const runValidation = async () => {
      try {
        if (!quote) {
          throw new Error('Quote not found. Please start over.');
        }

        // Step 1: Vehicle valuation (mock - 2s delay)
        setSteps(prev => prev.map((step, i) =>
          i === 0 ? { ...step, status: 'loading' as const } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSteps(prev => prev.map((step, i) =>
          i === 0 ? { ...step, status: 'completed' as const } : step
        ));

        // Step 2: Driver records check / MVR lookup (mock - 2s delay)
        setSteps(prev => prev.map((step, i) =>
          i === 1 ? { ...step, status: 'loading' as const } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSteps(prev => prev.map((step, i) =>
          i === 1 ? { ...step, status: 'completed' as const } : step
        ));

        // Step 3: Finalize premium calculation (mock - 1s delay)
        // Premium was already calculated by the PUT /coverage endpoint
        setSteps(prev => prev.map((step, i) =>
          i === 2 ? { ...step, status: 'loading' as const } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSteps(prev => prev.map((step, i) =>
          i === 2 ? { ...step, status: 'completed' as const } : step
        ));

        // Navigate to review screen after all steps complete
        setTimeout(() => {
          navigate(`/quote-v2/review/${quoteNumber}`);
        }, 500);

      } catch (err) {
        console.error('[LoadingValidation] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to finalize quote. Please try again.');
        setSteps(prev => prev.map(step =>
          step.status === 'loading' ? { ...step, status: 'pending' as const } : step
        ));
      }
    };

    if (quote) {
      runValidation();
    }
  }, [navigate, quote, quoteNumber]);

  // Loading state while fetching quote
  if (!quote && !error) {
    return (
      <EverestLayout>
        <EverestContainer>
          <div className="loading-validation-container">
            <EverestText variant="body">Loading quote...</EverestText>
          </div>
        </EverestContainer>
      </EverestLayout>
    );
  }

  return (
    <EverestLayout>
      <EverestContainer>
        <div className="loading-validation-container">
          <div className="loading-validation-header">
            <EverestTitle variant="h2">Almost there! Verifying your information...</EverestTitle>
            <EverestText variant="subtitle">
              We're making sure everything is just right
            </EverestText>
          </div>

          <EverestLoadingAnimation steps={steps} />

          {error && (
            <div className="loading-validation-error">
              <EverestText variant="body" style={{ color: '#ef4444', textAlign: 'center' }}>
                {error}
              </EverestText>
              <EverestText variant="body" style={{ textAlign: 'center' }}>
                <a href="/quote-v2/get-started" className="loading-validation-link">
                  Start over
                </a>
              </EverestText>
            </div>
          )}
        </div>
      </EverestContainer>
    </EverestLayout>
  );
};

export default LoadingValidation;
