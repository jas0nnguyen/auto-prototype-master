/**
 * Processing Screen (Screen 15 of 16) - Everest Design
 *
 * Loading screen showing payment processing and policy binding progress.
 *
 * Features:
 * - Everest-styled loading animation
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
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestCard } from '../../components/everest/core/EverestCard';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestLoadingAnimation } from '../../components/everest/specialized/EverestLoadingAnimation';
import { bindQuote } from '../../services/policy-api';
import './Processing.css';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Step {
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
}

const Processing: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  const [steps, setSteps] = useState<Step[]>([
    { label: 'Payment authorized', status: 'loading' },
    { label: 'Binding policy', status: 'pending' },
    { label: 'Generating documents', status: 'pending' },
  ]);

  const [currentMessage, setCurrentMessage] = useState('Authorizing payment...');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Step 1: Payment authorized (immediate)
        setCurrentMessage('Authorizing payment...');
        await delay(1000);

        setSteps([
          { label: 'Payment authorized', status: 'completed' },
          { label: 'Binding policy', status: 'loading' },
          { label: 'Generating documents', status: 'pending' },
        ]);
        setCurrentMessage('Binding your policy...');

        // Step 2: Binding policy
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
        setCurrentMessage('Generating your policy documents...');

        await delay(2000);

        // Step 3: Documents already generated during binding
        setSteps([
          { label: 'Payment authorized', status: 'completed' },
          { label: 'Binding policy', status: 'completed' },
          { label: 'Generating documents', status: 'completed' },
        ]);
        setCurrentMessage('All done! Redirecting...');

        await delay(500);

        // Navigate to success screen
        navigate(`/quote-v2/success/${quoteNumber}`);
      } catch (error) {
        console.error('Policy binding failed:', error);
        setHasError(true);
        setCurrentMessage('Failed to process your payment. Please contact support.');
        setSteps((prev) =>
          prev.map((step) =>
            step.status === 'loading' ? { ...step, status: 'error' as const } : step
          )
        );
      }
    };

    processPayment();
  }, [quoteNumber, navigate]);

  return (
    <EverestLayout>
      <EverestContainer>
        <EverestCard>
          <div className="processing-container">
            {/* Header */}
            <div className="processing-header">
              <EverestTitle variant="h2">
                {hasError ? 'Processing Failed' : 'Processing Your Policy'}
              </EverestTitle>
              <EverestText variant="subtitle">
                {hasError
                  ? 'We encountered an issue processing your payment'
                  : 'Please wait while we finalize your insurance policy'}
              </EverestText>
            </div>

            {/* Loading Animation */}
            <div className="processing-animation">
              <EverestLoadingAnimation message={currentMessage} />
            </div>

            {/* Steps List */}
            <div className="processing-steps">
              {steps.map((step, index) => (
                <div key={index} className={`processing-step processing-step-${step.status}`}>
                  <div className="processing-step-icon">
                    {step.status === 'completed' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {step.status === 'loading' && (
                      <div className="processing-step-spinner"></div>
                    )}
                    {step.status === 'pending' && (
                      <div className="processing-step-pending"></div>
                    )}
                    {step.status === 'error' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M18 6L6 18M6 6L18 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <EverestText
                    variant="body"
                    className={`processing-step-label ${
                      step.status === 'completed' ? 'processing-step-label-completed' : ''
                    }`}
                  >
                    {step.label}
                  </EverestText>
                </div>
              ))}
            </div>
          </div>
        </EverestCard>
      </EverestContainer>
    </EverestLayout>
  );
};

export default Processing;
