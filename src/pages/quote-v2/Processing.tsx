/**
 * Processing Screen (Screen 13 of 19) - T137
 *
 * Loading screen showing payment processing and policy binding progress.
 *
 * Features:
 * - Reuses LoadingAnimation component
 * - 3 steps: "Payment authorized", "Binding policy", "Generating documents"
 * - Calls existing payment processing and policy binding services
 * - Auto-navigates to Success screen when complete
 *
 * Flow:
 * 1. Payment authorized (immediate)
 * 2. Binding policy (3 second delay, calls POST /api/v1/policies)
 * 3. Generating documents (2 second delay, calls document generation)
 * 4. Navigate to Success screen with policy number
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container } from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { ScreenProgress } from './components/ScreenProgress';
import { LoadingAnimation } from './components/LoadingAnimation';
import { QuoteProvider } from './contexts/QuoteContext';
import { bindQuote } from '../../services/policy-api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ProcessingContent: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  const [steps, setSteps] = useState([
    { label: 'Payment authorized', status: 'loading' as const },
    { label: 'Binding policy', status: 'pending' as const },
    { label: 'Generating documents', status: 'pending' as const },
  ]);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Step 1: Payment authorized (immediate)
        setSteps([
          { label: 'Payment authorized', status: 'completed' },
          { label: 'Binding policy', status: 'loading' },
          { label: 'Generating documents', status: 'pending' },
        ]);

        await delay(1000);

        // Step 2: Binding policy (T157)
        // Call POST /api/v1/policies/bind to convert quote to policy
        // Retrieve payment data from sessionStorage
        const paymentDataStr = sessionStorage.getItem('paymentData');
        if (!paymentDataStr) {
          throw new Error('Payment data not found');
        }

        const paymentData = JSON.parse(paymentDataStr);
        const policyResult = await bindQuote({
          quoteNumber: quoteNumber!,
          paymentMethod: paymentData.paymentMethod,
          cardNumber: paymentData.cardNumber,
          cardExpiry: paymentData.cardExpiry,
          cardCvv: paymentData.cardCvv,
        });

        // Clear payment data from sessionStorage for security
        sessionStorage.removeItem('paymentData');

        // Store policy ID and number in session for Success screen
        sessionStorage.setItem('policyId', policyResult.policyId);
        sessionStorage.setItem('policyNumber', policyResult.policyNumber);

        setSteps([
          { label: 'Payment authorized', status: 'completed' },
          { label: 'Binding policy', status: 'completed' },
          { label: 'Generating documents', status: 'loading' },
        ]);

        await delay(2000);

        // Step 3: Documents already generated during binding (T157)
        setSteps([
          { label: 'Payment authorized', status: 'completed' },
          { label: 'Binding policy', status: 'completed' },
          { label: 'Generating documents', status: 'completed' },
        ]);

        await delay(500);

        // Navigate to success screen
        navigate(`/quote-v2/success/${quoteNumber}`);
      } catch (error) {
        console.error('Policy binding failed:', error);
        // TODO: Show error state and allow retry
        alert('Policy binding failed. Please contact support.');
      }
    };

    processPayment();
  }, [quoteNumber, navigate]);

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={13} totalScreens={19} />
      <Container padding="large">
        <LoadingAnimation steps={steps} />
      </Container>
    </TechStartupLayout>
  );
};

export const Processing: React.FC = () => {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  return (
    <QuoteProvider quoteNumber={quoteNumber}>
      <ProcessingContent />
    </QuoteProvider>
  );
};
