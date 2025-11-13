/**
 * Sign Screen (Screen 10 of 19) - T134
 *
 * Signature ceremony screen where users sign their insurance application.
 *
 * Features:
 * - Collapsed signature pad with "Click to sign" placeholder
 * - Signature date auto-populated to today
 * - SignatureCanvas component for drawing signature
 * - SignatureModal for expanded signature view
 * - "Review Terms" button (future enhancement)
 * - "Sign & Continue" button validates signature before proceeding
 *
 * Flow:
 * 1. User clicks collapsed pad or draws signature
 * 2. User can clear and redraw
 * 3. User clicks "Sign & Continue"
 * 4. Signature validated (not empty)
 * 5. Signature saved to database via Signature API
 * 6. Navigate to Checkout screen
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { SignatureCanvas } from './components/SignatureCanvas';
import { QuoteProvider } from './contexts/QuoteContext';
import { useQuoteByNumber } from '../../hooks/useQuote';
import { useCreateSignature } from '../../hooks/useSignature';

const SignContent: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const { data: quote, isLoading } = useQuoteByNumber(quoteNumber);
  const createSignatureMutation = useCreateSignature();

  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate today's date
  const today = new Date().toISOString().split('T')[0];

  const handleSaveSignature = (data: string) => {
    setSignatureData(data);
    setShowModal(false);
  };

  const handleContinue = async () => {
    if (!signatureData) {
      alert('Please provide a signature');
      return;
    }

    if (!quote) {
      alert('Quote data not found');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save signature to database via Signature API (T147)
      // Note: For demo, we use policy_id as both quote_id and party_id
      // In production, get the primary insured party_id from the quote data
      await createSignatureMutation.mutateAsync({
        quote_id: quote.policy_id || quote.quote_number,
        party_id: quote.policy_id || quote.quote_number, // Mock: using policy_id as party_id for demo
        signature_image_data: signatureData,
        signature_format: 'PNG',
      });

      // Navigate to checkout on success
      navigate(`/quote-v2/checkout/${quoteNumber}`);
    } catch (error) {
      console.error('Failed to save signature:', error);
      alert('Failed to save signature. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={10} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center">
            <Title variant="title-2">Loading...</Title>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={10} totalScreens={19} />
      <Container padding="large">
        <Layout display="flex-column" gap="large" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title variant="display-2">Sign Your Application</Title>
          <Text variant="body-regular" color="subtle">
            By signing below, you agree to the terms and conditions of your insurance policy.
          </Text>

          {/* Signature Date */}
          <Layout display="flex-column" gap="small">
            <Text variant="body-regular" style={{ fontWeight: 600 }}>
              Signature Date
            </Text>
            <TextInput
              value={today}
              readOnly
              style={{ backgroundColor: '#f7fafc', cursor: 'not-allowed' }}
            />
          </Layout>

          {/* Signature Pad */}
          <Layout display="flex-column" gap="small">
            <Text variant="body-regular" style={{ fontWeight: 600 }}>
              Your Signature
            </Text>

            {signatureData ? (
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: 'white',
                  textAlign: 'center',
                }}
                onClick={() => setShowModal(true)}
              >
                <img
                  src={signatureData}
                  alt="Your signature"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                <Text variant="body-small" color="subtle" style={{ marginTop: '8px' }}>
                  Click to edit signature
                </Text>
              </div>
            ) : (
              <div
                style={{
                  border: '2px dashed #e2e8f0',
                  borderRadius: '8px',
                  padding: '32px',
                  backgroundColor: '#f7fafc',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setShowModal(true)}
              >
                <Text variant="body-regular" color="subtle">
                  Click to sign
                </Text>
              </div>
            )}
          </Layout>

          {/* Signature Modal */}
          {showModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setShowModal(false)}
            >
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '24px',
                  padding: '40px',
                  maxWidth: '900px',
                  width: '90%',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Title variant="title-3" style={{ marginBottom: '24px' }}>
                  Sign Here
                </Title>
                <SignatureCanvas onSave={handleSaveSignature} width={800} height={300} />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <Layout display="flex" gap="medium" flexJustify="space-between">
            <Button variant="secondary" onClick={() => navigate(`/quote-v2/review/${quoteNumber}`)}>
              Back
            </Button>

            <Layout display="flex" gap="medium">
              <Button variant="secondary" onClick={() => alert('Terms and conditions...')}>
                Review Terms
              </Button>
              <Button
                variant="primary"
                onClick={handleContinue}
                disabled={isSubmitting || !signatureData}
              >
                {isSubmitting ? 'Saving...' : 'Sign & Continue'}
              </Button>
            </Layout>
          </Layout>
        </Layout>
      </Container>
    </TechStartupLayout>
  );
};

export const Sign: React.FC = () => {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  return (
    <QuoteProvider quoteNumber={quoteNumber}>
      <SignContent />
    </QuoteProvider>
  );
};
