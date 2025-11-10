import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Container, Text } from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { LoadingAnimation, LoadingStep } from './components/LoadingAnimation';
import { ScreenProgress } from './components/ScreenProgress';
import { useCreateQuote } from '../../hooks/useQuote';

/**
 * LoadingPrefill Screen (Screen 04 of 19) - T089
 *
 * Orchestrates mock services and creates the quote:
 * 1. Verifying insurance history (~2s) - simulates external lookup
 * 2. Retrieving vehicle information (~2s) - simulates VIN decode
 * 3. Creating your quote (~2s) - actual POST /api/v1/quotes
 *
 * After completion, navigates to Summary with quote number in URL
 */

const LoadingPrefill: React.FC = () => {
  const navigate = useNavigate();
  const createQuote = useCreateQuote();

  const [steps, setSteps] = useState<LoadingStep[]>([
    { label: 'Verifying insurance history', status: 'pending' },
    { label: 'Retrieving vehicle information', status: 'pending' },
    { label: 'Creating your quote', status: 'pending' },
  ]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // T089: Load prefill orchestration with actual quote creation
    const runPrefillFlow = async () => {
      try {
        // Get stored data from previous screens
        const quoteData = JSON.parse(sessionStorage.getItem('quote-v2-data') || '{}');

        if (!quoteData.getStarted || !quoteData.effectiveDate || !quoteData.email) {
          throw new Error('Missing required data. Please start from the beginning.');
        }

        // Step 1: Insurance history (mock - 2s delay)
        setSteps(prev => prev.map((step, i) =>
          i === 0 ? { ...step, status: 'loading' as const } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSteps(prev => prev.map((step, i) =>
          i === 0 ? { ...step, status: 'completed' as const } : step
        ));

        // Step 2: Vehicle information (mock - 2s delay)
        // In a real implementation, this would decode VIN and get vehicle details
        setSteps(prev => prev.map((step, i) =>
          i === 1 ? { ...step, status: 'loading' as const } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock vehicle data (in production, this would come from VIN decoder API)
        const mockVehicle = {
          year: 2020,
          make: 'Honda',
          model: 'Civic',
          vin: '1HGBH41JXMN109186',
          annual_mileage: 12000,
          body_type: 'Sedan'
        };

        setSteps(prev => prev.map((step, i) =>
          i === 1 ? { ...step, status: 'completed' as const } : step
        ));

        // Step 3: Create quote (actual API call)
        setSteps(prev => prev.map((step, i) =>
          i === 2 ? { ...step, status: 'loading' as const } : step
        ));

        // Format phone number for API (remove formatting)
        const phoneDigits = quoteData.email.mobile ? quoteData.email.mobile.replace(/\D/g, '') : '';
        const formattedPhone = phoneDigits ? `${phoneDigits.slice(0,3)}-${phoneDigits.slice(3,6)}-${phoneDigits.slice(6)}` : '';

        // Create quote with collected data
        const quoteResult = await createQuote.mutateAsync({
          // Primary driver info (from GetStarted)
          driver_first_name: quoteData.getStarted.first_name,
          driver_last_name: quoteData.getStarted.last_name,
          driver_birth_date: quoteData.getStarted.birth_date,
          driver_email: quoteData.email.email,
          driver_phone: formattedPhone || '',

          // Address (from GetStarted)
          address_line_1: quoteData.getStarted.line_1_address,
          address_line_2: quoteData.getStarted.line_2_address || undefined,
          address_city: quoteData.getStarted.municipality_name,
          address_state: quoteData.getStarted.state_code,
          address_zip: quoteData.getStarted.postal_code,

          // Vehicle (from mock service)
          vehicles: [mockVehicle],

          // Coverage start date (from EffectiveDate)
          coverage_start_date: quoteData.effectiveDate
        });

        setSteps(prev => prev.map((step, i) =>
          i === 2 ? { ...step, status: 'completed' as const } : step
        ));

        // Store quote number for later use
        sessionStorage.setItem('quote-v2-quoteNumber', quoteResult.quoteNumber);

        // Navigate to summary with quote number
        setTimeout(() => {
          navigate(`/quote-v2/summary/${quoteResult.quoteNumber}`);
        }, 500);

      } catch (err) {
        console.error('[LoadingPrefill] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to create quote. Please try again.');
        setSteps(prev => prev.map(step =>
          step.status === 'loading' ? { ...step, status: 'pending' as const } : step
        ));
      }
    };

    runPrefillFlow();
  }, [navigate, createQuote]);

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={4} totalScreens={19} />

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

export default LoadingPrefill;
