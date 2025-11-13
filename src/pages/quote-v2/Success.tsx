/**
 * Success Screen (Screen 14 of 19) - T138
 *
 * Confirmation screen displaying policy details and next steps.
 *
 * Features:
 * - Display policy number (DZXXXXXXXX format)
 * - Display effective date
 * - Display coverage term (6 months)
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
import {
  Layout,
  Container,
  Title,
  Text,
  Card,
  Button
} from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { ScreenProgress } from './components/ScreenProgress';
import { QuoteProvider } from './contexts/QuoteContext';
import { useQuoteByNumber } from '../../hooks/useQuote';
import { clearActiveFlow } from '../../utils/flowTracker';

const SuccessContent: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const { data: quote, isLoading } = useQuoteByNumber(quoteNumber);

  // T158: Get policy data from sessionStorage (set by Processing screen)
  const policyNumber = sessionStorage.getItem('policyNumber') || `DZ${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const policyId = sessionStorage.getItem('policyId');

  // Clear active flow on mount (T161)
  useEffect(() => {
    clearActiveFlow();
  }, []);

  if (isLoading) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={14} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center">
            <Title variant="title-2">Loading...</Title>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  // T158: Calculate dates from policy data
  const effectiveDate = quote?.effective_date
    ? new Date(quote.effective_date).toLocaleDateString('en-US')
    : new Date().toLocaleDateString('en-US');
  const expirationDate = quote?.effective_date
    ? new Date(new Date(quote.effective_date).setMonth(new Date(quote.effective_date).getMonth() + 6)).toLocaleDateString('en-US')
    : new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US');

  // T159: Navigate to portal
  const handleAccessPortal = () => {
    navigate(`/portal/${policyNumber}`);
  };

  // T160: Download declarations document
  const handleDownloadDeclarations = () => {
    if (!policyId) {
      alert('Policy ID not found. Please contact support.');
      return;
    }

    // Mock document download for demo mode
    // In production, this would call GET /api/v1/policies/:id/documents/declarations
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`Policy Declarations\n\nPolicy Number: ${policyNumber}\nEffective Date: ${effectiveDate}\nExpiration Date: ${expirationDate}\n\nThis is a mock document for demo purposes.`)}`;
    link.download = `declarations-${policyNumber}.txt`;
    link.click();
  };

  // T160: Download ID cards document
  const handleDownloadIDCards = () => {
    if (!policyId) {
      alert('Policy ID not found. Please contact support.');
      return;
    }

    // Mock document download for demo mode
    // In production, this would call GET /api/v1/policies/:id/documents/id-cards
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`Insurance ID Card\n\nPolicy Number: ${policyNumber}\nEffective: ${effectiveDate}\nExpires: ${expirationDate}\n\nThis is a mock document for demo purposes.`)}`;
    link.download = `id-cards-${policyNumber}.txt`;
    link.click();
  };

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={14} totalScreens={19} />
      <Container padding="large">
        <Layout display="flex-column" gap="large" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Success Message */}
          <Layout display="flex-column" gap="medium" flexAlign="center" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#48BB78',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <Title variant="display-2">Congratulations!</Title>
            <Text variant="body-regular" color="subtle" style={{ fontSize: '18px' }}>
              Your auto insurance policy is now active.
            </Text>
          </Layout>

          {/* Policy Summary Card */}
          <Card padding="large">
            <Layout display="flex-column" gap="medium">
              <Title variant="title-3">Policy Details</Title>

              <Layout display="flex" flexJustify="space-between">
                <Text variant="body-regular" color="subtle">
                  Policy Number
                </Text>
                <Text variant="body-regular" style={{ fontWeight: 600, fontSize: '18px' }}>
                  {policyNumber}
                </Text>
              </Layout>

              <Layout display="flex" flexJustify="space-between">
                <Text variant="body-regular" color="subtle">
                  Effective Date
                </Text>
                <Text variant="body-regular" style={{ fontWeight: 600 }}>
                  {effectiveDate}
                </Text>
              </Layout>

              <Layout display="flex" flexJustify="space-between">
                <Text variant="body-regular" color="subtle">
                  Coverage Term
                </Text>
                <Text variant="body-regular" style={{ fontWeight: 600 }}>
                  6 months
                </Text>
              </Layout>

              <Layout display="flex" flexJustify="space-between">
                <Text variant="body-regular" color="subtle">
                  Expiration Date
                </Text>
                <Text variant="body-regular" style={{ fontWeight: 600 }}>
                  {expirationDate}
                </Text>
              </Layout>
            </Layout>
          </Card>

          {/* Next Steps */}
          <Layout display="flex-column" gap="medium">
            <Title variant="title-3">Next Steps</Title>

            <Card padding="medium">
              <Layout display="flex" flexJustify="space-between" flexAlign="center">
                <Layout display="flex-column" gap="small">
                  <Text variant="body-regular" style={{ fontWeight: 600 }}>
                    Access Your Policy
                  </Text>
                  <Text variant="body-small" color="subtle">
                    View your policy details, make changes, and manage payments
                  </Text>
                </Layout>
                <Button variant="primary" onClick={handleAccessPortal}>
                  Go to Portal
                </Button>
              </Layout>
            </Card>

            <Card padding="medium">
              <Layout display="flex" flexJustify="space-between" flexAlign="center">
                <Layout display="flex-column" gap="small">
                  <Text variant="body-regular" style={{ fontWeight: 600 }}>
                    Download Documents
                  </Text>
                  <Text variant="body-small" color="subtle">
                    Get your declarations page and insurance ID cards
                  </Text>
                </Layout>
                <Layout display="flex" gap="small">
                  <Button variant="secondary" onClick={handleDownloadDeclarations}>
                    Declarations
                  </Button>
                  <Button variant="secondary" onClick={handleDownloadIDCards}>
                    ID Cards
                  </Button>
                </Layout>
              </Layout>
            </Card>
          </Layout>

          {/* Return Home */}
          <Layout display="flex" flexJustify="center">
            <Button variant="secondary" onClick={() => navigate('/')}>
              Return to Homepage
            </Button>
          </Layout>
        </Layout>
      </Container>
    </TechStartupLayout>
  );
};

export const Success: React.FC = () => {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  return (
    <QuoteProvider quoteNumber={quoteNumber}>
      <SuccessContent />
    </QuoteProvider>
  );
};
