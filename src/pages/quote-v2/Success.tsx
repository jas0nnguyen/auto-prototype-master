/**
 * Success Screen (Screen 16 of 16) - Everest Design
 *
 * Confirmation screen displaying policy details and next steps.
 *
 * Features:
 * - Everest-styled success message with checkmark icon
 * - Display policy number (DZXXXXXXXX format)
 * - Display effective date and coverage term
 * - "Access your policy" link to portal
 * - "Download documents" buttons for declarations/ID cards
 * - Clears active flow on mount (allows returning to HomePage)
 *
 * Flow:
 * 1. Display policy information
 * 2. User can access portal or download documents
 * 3. User returns to homepage (flow cleared)
 */

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestCard } from '../../components/everest/core/EverestCard';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestButton } from '../../components/everest/core/EverestButton';
import { useQuoteByNumber } from '../../hooks/useQuote';
import { clearActiveFlow } from '../../utils/flowTracker';
import './Success.css';

const Success: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const { data: quote, isLoading } = useQuoteByNumber(quoteNumber) as {
    data: any;
    isLoading: boolean;
  };

  // Get policy data from sessionStorage (set by Processing screen)
  const policyNumber =
    sessionStorage.getItem('policyNumber') ||
    `DZ${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const policyId = sessionStorage.getItem('policyId');

  // Clear active flow on mount
  useEffect(() => {
    clearActiveFlow();
  }, []);

  if (isLoading) {
    return (
      <EverestLayout>
        <EverestContainer>
          <div className="success-loading">
            <EverestText variant="body">Loading...</EverestText>
          </div>
        </EverestContainer>
      </EverestLayout>
    );
  }

  // Calculate dates from policy data
  const effectiveDate = quote?.effective_date
    ? new Date(quote.effective_date).toLocaleDateString('en-US')
    : new Date().toLocaleDateString('en-US');
  const expirationDate = quote?.effective_date
    ? new Date(
        new Date(quote.effective_date).setMonth(new Date(quote.effective_date).getMonth() + 6)
      ).toLocaleDateString('en-US')
    : new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US');

  // Navigate to portal
  const handleAccessPortal = () => {
    navigate(`/portal/${policyNumber}`);
  };

  // Download declarations document
  const handleDownloadDeclarations = () => {
    if (!policyId) {
      alert('Policy ID not found. Please contact support.');
      return;
    }

    // Mock document download for demo mode
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(
      `Policy Declarations\n\nPolicy Number: ${policyNumber}\nEffective Date: ${effectiveDate}\nExpiration Date: ${expirationDate}\n\nThis is a mock document for demo purposes.`
    )}`;
    link.download = `declarations-${policyNumber}.txt`;
    link.click();
  };

  // Download ID cards document
  const handleDownloadIDCards = () => {
    if (!policyId) {
      alert('Policy ID not found. Please contact support.');
      return;
    }

    // Mock document download for demo mode
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(
      `Insurance ID Card\n\nPolicy Number: ${policyNumber}\nEffective: ${effectiveDate}\nExpires: ${expirationDate}\n\nThis is a mock document for demo purposes.`
    )}`;
    link.download = `id-cards-${policyNumber}.txt`;
    link.click();
  };

  return (
    <EverestLayout>
      <EverestContainer>
        <div className="success-container">
          {/* Success Message */}
          <div className="success-message">
            <div className="success-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <EverestTitle variant="h1">Congratulations!</EverestTitle>
            <EverestText variant="subtitle" className="success-subtitle">
              Your auto insurance policy is now active.
            </EverestText>
          </div>

          {/* Policy Summary Card */}
          <EverestCard className="success-policy-card">
            <div className="success-policy-details">
              <EverestTitle variant="h3">Policy Details</EverestTitle>

              <div className="success-policy-info">
                <div className="success-policy-row">
                  <EverestText variant="body">Policy Number</EverestText>
                  <EverestText variant="body" className="success-policy-value">
                    {policyNumber}
                  </EverestText>
                </div>

                <div className="success-policy-row">
                  <EverestText variant="body">Effective Date</EverestText>
                  <EverestText variant="body" className="success-policy-value">
                    {effectiveDate}
                  </EverestText>
                </div>

                <div className="success-policy-row">
                  <EverestText variant="body">Coverage Term</EverestText>
                  <EverestText variant="body" className="success-policy-value">
                    6 months
                  </EverestText>
                </div>

                <div className="success-policy-row">
                  <EverestText variant="body">Expiration Date</EverestText>
                  <EverestText variant="body" className="success-policy-value">
                    {expirationDate}
                  </EverestText>
                </div>
              </div>
            </div>
          </EverestCard>

          {/* Next Steps */}
          <div className="success-next-steps">
            <EverestTitle variant="h3">Next Steps</EverestTitle>

            <EverestCard className="success-action-card">
              <div className="success-action">
                <div className="success-action-info">
                  <EverestText variant="body" className="success-action-title">
                    Access Your Policy
                  </EverestText>
                  <EverestText variant="small" className="success-action-description">
                    View your policy details, make changes, and manage payments
                  </EverestText>
                </div>
                <EverestButton variant="primary" onClick={handleAccessPortal}>
                  Go to Portal
                </EverestButton>
              </div>
            </EverestCard>

            <EverestCard className="success-action-card">
              <div className="success-action">
                <div className="success-action-info">
                  <EverestText variant="body" className="success-action-title">
                    Download Documents
                  </EverestText>
                  <EverestText variant="small" className="success-action-description">
                    Get your declarations page and insurance ID cards
                  </EverestText>
                </div>
                <div className="success-action-buttons">
                  <EverestButton variant="secondary" onClick={handleDownloadDeclarations}>
                    Declarations
                  </EverestButton>
                  <EverestButton variant="secondary" onClick={handleDownloadIDCards}>
                    ID Cards
                  </EverestButton>
                </div>
              </div>
            </EverestCard>
          </div>

          {/* Return Home */}
          <div className="success-footer">
            <EverestButton variant="secondary" onClick={() => navigate('/')}>
              Return to Homepage
            </EverestButton>
          </div>
        </div>
      </EverestContainer>
    </EverestLayout>
  );
};

export default Success;
