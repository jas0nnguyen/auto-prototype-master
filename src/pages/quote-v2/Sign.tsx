/**
 * Sign Screen (Screen 10 of 16) - Everest Design
 *
 * Signature ceremony screen where users sign their insurance application.
 *
 * Features:
 * - Everest-styled signature pad with expanded canvas
 * - Signature date auto-populated to today
 * - Blue signature stroke matching Everest brand
 * - Clear and save functionality
 * - Validation before proceeding
 *
 * Flow:
 * 1. User draws signature on canvas
 * 2. User can clear and redraw
 * 3. User clicks "Sign & Continue"
 * 4. Signature validated (not empty)
 * 5. Signature saved to database via Signature API
 * 6. Navigate to Checkout screen
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestCard } from '../../components/everest/core/EverestCard';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestButton } from '../../components/everest/core/EverestButton';
import { EverestTextInput } from '../../components/everest/core/EverestTextInput';
import { EverestSignaturePad } from '../../components/everest/specialized/EverestSignaturePad';
import { useQuoteByNumber } from '../../hooks/useQuote';
import { useCreateSignature } from '../../hooks/useSignature';
import './Sign.css';

const Sign: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const { data: quote, isLoading } = useQuoteByNumber(quoteNumber);
  const createSignatureMutation = useCreateSignature();

  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate today's date
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSignatureChange = (dataUrl: string | null) => {
    setSignatureData(dataUrl);
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
      // Save signature to database via Signature API
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
      <EverestLayout>
        <EverestContainer>
          <div className="sign-loading">
            <EverestText variant="body">Loading...</EverestText>
          </div>
        </EverestContainer>
      </EverestLayout>
    );
  }

  return (
    <EverestLayout>
      <EverestContainer>
        <EverestCard>
          <div className="sign-container">
            {/* Header */}
            <div className="sign-header">
              <EverestTitle variant="h2">Almost done! We need your signature</EverestTitle>
              <EverestText variant="subtitle">
                By signing below, you agree to the terms and conditions of your insurance policy.
              </EverestText>
            </div>

            {/* Signature Date */}
            <div className="sign-date-section">
              <EverestText variant="label" className="sign-label">
                Signature Date
              </EverestText>
              <EverestTextInput
                value={today}
                readOnly
                className="sign-date-input"
              />
            </div>

            {/* Signature Pad */}
            <div className="sign-signature-section">
              <EverestSignaturePad
                onSignatureChange={handleSignatureChange}
                label="Your Signature"
                placeholder="Sign here"
                width={800}
                height={300}
              />
            </div>

            {/* Action Buttons */}
            <div className="sign-actions">
              <EverestButton
                variant="secondary"
                onClick={() => navigate(`/quote-v2/review/${quoteNumber}`)}
              >
                Back
              </EverestButton>

              <div className="sign-actions-right">
                <EverestButton
                  variant="secondary"
                  onClick={() => alert('Terms and conditions...')}
                >
                  Review Terms
                </EverestButton>
                <EverestButton
                  variant="primary"
                  onClick={handleContinue}
                  disabled={isSubmitting || !signatureData}
                >
                  {isSubmitting ? 'Saving...' : 'Sign & Continue'}
                </EverestButton>
              </div>
            </div>
          </div>
        </EverestCard>
      </EverestContainer>
    </EverestLayout>
  );
};

export default Sign;
