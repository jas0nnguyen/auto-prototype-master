import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Layout,
  Container,
  Title,
  Text,
  Button
} from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { PriceSidebar } from './components/PriceSidebar';
import { ScreenProgress } from './components/ScreenProgress';
import { QuoteProvider } from './contexts/QuoteContext';
import { useQuoteByNumber, useUpdateQuoteCoverage } from '../../hooks/useQuote';

/**
 * AddOns Screen (Screen 07 of 19) - T097
 *
 * Optional coverage add-ons:
 * - Rental Reimbursement (per vehicle, toggle)
 * - Roadside Assistance (always included, disabled toggle)
 *
 * Features:
 * - Toggle switches for add-ons
 * - Roadside shown as included (checked + disabled)
 * - Real-time premium updates via API
 */

const AddOnsContent: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  // Fetch quote data
  const { data: quote, isLoading, error } = useQuoteByNumber(quoteNumber);

  // Mutation for updating coverage
  const updateCoverage = useUpdateQuoteCoverage();

  // Add-ons state
  const [rentalReimbursement, setRentalReimbursement] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const roadsideAssistance = true; // Always included

  // Initialize add-ons from quote
  useEffect(() => {
    if (quote && !isInitialized) {
      if (quote.coverage?.rental_reimbursement !== undefined) {
        setRentalReimbursement(quote.coverage.rental_reimbursement);
      }
      setIsInitialized(true);
    }
  }, [quote, isInitialized]);

  // Update add-ons when rental reimbursement changes
  useEffect(() => {
    if (!quoteNumber || !isInitialized) return;

    const updateAddOns = async () => {
      try {
        await updateCoverage.mutateAsync({
          quoteNumber,
          coverageData: {
            coverage_rental_reimbursement: rentalReimbursement,
            coverage_rental_limit: rentalReimbursement ? 1200 : 0, // $40/day, up to $1200
            coverage_roadside_assistance: true, // Always included
          }
        });
      } catch (err) {
        console.error('[AddOns] Error updating add-ons:', err);
      }
    };

    updateAddOns();
  }, [rentalReimbursement, quoteNumber, isInitialized, updateCoverage]);

  const handleContinue = () => {
    navigate(`/quote-v2/loading-validation/${quoteNumber}`);
  };

  const handleBack = () => {
    navigate(`/quote-v2/coverage/${quoteNumber}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={7} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center" flexJustify="center">
            <Title variant="title-2">Loading add-ons...</Title>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  // Error state
  if (error || !quote) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={7} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center">
            <Title variant="title-2" color="error">Error Loading Quote</Title>
            <Button variant="primary" onClick={() => navigate('/quote-v2/get-started')}>
              Start Over
            </Button>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={7} totalScreens={19} />

      <Container padding="large">
        <Layout display="flex" gap="large">
          {/* Main Content */}
          <div style={{ flex: 1 }}>
            <Layout display="flex-column" gap="large">
              <Title variant="display-2">Enhance Your Coverage</Title>

              <Text variant="body-large" color="subtle">
                Add extra protection with optional coverage
              </Text>

              {/* Add-ons List */}
              <Layout display="flex-column" gap="medium">
                {/* Rental Reimbursement */}
                <Layout
                  display="flex"
                  flexJustify="space-between"
                  flexAlign="center"
                  padding="medium"
                  style={{ border: '1px solid #e2e8f0', borderRadius: '16px' }}
                >
                  <Layout display="flex-column" gap="small" style={{ flex: 1 }}>
                    <Title variant="title-4">Rental Reimbursement</Title>
                    <Text variant="body-regular" color="subtle">
                      Covers rental car costs while your vehicle is being repaired after a covered claim
                    </Text>
                    <Text variant="body-small" color="subtle">
                      $40/day, up to $1,200 per claim
                    </Text>
                  </Layout>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rentalReimbursement}
                      onChange={(e) => setRentalReimbursement(e.target.checked)}
                      style={{
                        width: '48px',
                        height: '28px',
                        cursor: 'pointer',
                        accentColor: '#667eea'
                      }}
                    />
                  </label>
                </Layout>

                {/* Roadside Assistance */}
                <Layout
                  display="flex"
                  flexJustify="space-between"
                  flexAlign="center"
                  padding="medium"
                  style={{
                    border: '1px solid #667eea',
                    borderRadius: '16px',
                    backgroundColor: '#f7fafc'
                  }}
                >
                  <Layout display="flex-column" gap="small" style={{ flex: 1 }}>
                    <Layout display="flex" gap="small" flexAlign="center">
                      <Title variant="title-4">Roadside Assistance</Title>
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        Always Included
                      </span>
                    </Layout>
                    <Text variant="body-regular" color="subtle">
                      24/7 emergency towing, flat tire changes, lockout service, and more
                    </Text>
                    <Text variant="body-small" color="subtle">
                      Included at no additional cost
                    </Text>
                  </Layout>
                  <label style={{ display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                    <input
                      type="checkbox"
                      checked={roadsideAssistance}
                      disabled
                      style={{
                        width: '48px',
                        height: '28px',
                        cursor: 'not-allowed',
                        accentColor: '#667eea'
                      }}
                    />
                  </label>
                </Layout>
              </Layout>

              {/* Info Box */}
              <Layout
                padding="medium"
                style={{
                  backgroundColor: '#f7fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Text variant="body-regular">
                  💡 <strong>Good to know:</strong> You can add or remove these coverages anytime after purchasing your policy.
                </Text>
              </Layout>

              {/* Navigation Buttons */}
              <Layout display="flex" gap="medium" flexJustify="space-between" padding={{ top: 'medium' }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="large"
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              </Layout>
            </Layout>
          </div>

          {/* Price Sidebar */}
          <div style={{ width: '320px' }}>
            <PriceSidebar />
          </div>
        </Layout>
      </Container>
    </TechStartupLayout>
  );
};

/**
 * AddOns Component Wrapper with QuoteProvider
 */
const AddOns: React.FC = () => {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const { data: quote } = useQuoteByNumber(quoteNumber);

  if (!quote) {
    return <AddOnsContent />;
  }

  return (
    <QuoteProvider quoteId={quote.quoteId}>
      <AddOnsContent />
    </QuoteProvider>
  );
};

export default AddOns;
