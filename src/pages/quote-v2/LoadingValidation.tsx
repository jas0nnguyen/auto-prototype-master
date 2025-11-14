import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Container, Text } from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { LoadingAnimation, LoadingStep } from './components/LoadingAnimation';
import { ScreenProgress } from './components/ScreenProgress';
import { useQuoteByNumber } from '../../hooks/useQuote';

/**
 * LoadingValidation Screen (Screen 08 of 19) - T098
 *
 * Displays loading animation while finalizing the quote:
 * 1. Vehicle valuation (~2s) - simulates external lookup
 * 2. Driver records check (~2s) - simulates MVR lookup
 * 3. Finalizing premium calculation (~2s) - actual API recalculation
 *
 * This orchestrates final validation steps before Review screen
 */

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
      <TechStartupLayout>
        <ScreenProgress currentScreen={8} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center" flexJustify="center">
            <Text variant="body-regular" color="subtle">
              Loading quote...
            </Text>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={8} totalScreens={19} />

      <Container padding="large">
        <Layout display="flex-column" gap="large" flexAlign="center" flexJustify="center">
          <LoadingAnimation steps={steps} />

          {error && (
            <Layout display="flex-column" gap="small" flexAlign="center" style={{ marginTop: '32px' }}>
              <Text variant="body-regular" color="error" align="center">
                {error}
              </Text>
              <Text variant="body-small" color="subtle" align="center">
                <a href="/quote-v2/get-started" style={{ color: '#667eea', textDecoration: 'underline' }}>
                  Start over
                </a>
              </Text>
            </Layout>
          )}
        </Layout>
      </Container>
    </TechStartupLayout>
  );
};

export default LoadingValidation;
