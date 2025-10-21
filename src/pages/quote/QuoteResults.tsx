import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppTemplate,
  PageHeader,
  AppHeader,
  Main,
  PageFooter,
  AppFooter,
  Content,
  Aside,
  Header,
  Button,
  Section,
  Card,
  Layout,
  Text,
  Link,
  QuoteCard,
  List,
  ChevronLeft,
} from '@sureapp/canary-design-system';
import PremiumBreakdown from '../../components/insurance/PremiumBreakdown';
import { useQuote } from '../../hooks/useQuote';

const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

interface QuoteData {
  vehicle: {
    year: string;
    make: string;
    model: string;
    vin?: string;
  };
  driver: {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    state: string;
  };
  coverage: {
    bodilyInjuryLimit: string;
    propertyDamageLimit: string;
    hasCollision: boolean;
    collisionDeductible: string;
    hasComprehensive: boolean;
    comprehensiveDeductible: string;
    hasUninsured: boolean;
    hasRoadside: boolean;
    hasRental: boolean;
    rentalLimit: string;
    coverageStartDate: Date;
  };
  premium: {
    monthly: number;
    sixMonth: number;
  };
}

const QuoteResults: React.FC = () => {
  const navigate = useNavigate();
  const [quoteId, setQuoteId] = useState<string | null>(null);

  // Get quote ID from sessionStorage on mount
  useEffect(() => {
    const storedQuoteId = sessionStorage.getItem('quoteId');
    if (!storedQuoteId) {
      // No quote ID, redirect to start
      navigate('/quote/vehicle-info');
      return;
    }
    setQuoteId(storedQuoteId);
  }, [navigate]);

  // Fetch quote data from API
  const { data: quote, isLoading, error } = useQuote(quoteId);

  // Show loading state
  if (isLoading) {
    return (
      <AppTemplate preset="purchase-flow">
        <PageHeader>
          <AppHeader logo={logoSrc} logoHref="/" />
        </PageHeader>
        <Main>
          <Content>
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <Text variant="title-1">Loading your quote...</Text>
            </div>
          </Content>
        </Main>
      </AppTemplate>
    );
  }

  // Show error state
  if (error || !quote) {
    return (
      <AppTemplate preset="purchase-flow">
        <PageHeader>
          <AppHeader logo={logoSrc} logoHref="/" />
        </PageHeader>
        <Main>
          <Content>
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <Text variant="title-1" color="danger">Failed to load quote</Text>
              <Button
                variant="primary"
                onClick={() => navigate('/quote/vehicle-info')}
                style={{ marginTop: '2rem' }}
              >
                Start Over
              </Button>
            </div>
          </Content>
        </Main>
      </AppTemplate>
    );
  }

  const handleContinue = () => {
    // Navigate to binding flow (Phase 4: US2)
    navigate('/binding/payment-info');
  };

  const handleSaveQuote = () => {
    alert(`Your quote has been saved! Reference number: ${quote.quote_number}\n\nWe've sent a copy to ${quote.driver.email}`);
  };

  // Extract data from API response
  const vehicleDisplay = quote.vehicle.description;
  const quoteRefNumber = quote.quote_number;
  const totalPremium = quote.premium?.total_premium || 0;
  const monthlyPremium = Math.round(totalPremium / 6);

  // Get stored coverage data for PremiumBreakdown component (temporary until backend returns full coverage details)
  const storedData = sessionStorage.getItem('quoteData');
  const localCoverage = storedData ? JSON.parse(storedData).coverage : null;

  return (
    <AppTemplate preset="purchase-flow">
      <PageHeader>
        <AppHeader
          logo={logoSrc}
          logoHref="/"
        />
      </PageHeader>

      <Main>
        <Content>
          <AppTemplate.Title>
            <Header
              breadcrumbs={
                <Button
                  href="/quote/coverage-selection"
                  emphasis="text"
                  startIcon={ChevronLeft}
                >
                  Back
                </Button>
              }
              hasBorder={false}
              hasPadding={false}
              supportText={`Quote Reference: ${quoteRefNumber}`}
              title="Your Personalized Quote is Ready!"
              titleSize="title-1"
            />
          </AppTemplate.Title>

          <Section>
            <Card padding="large" background="1">
              <Layout display="flex-column" gap="medium">
                <div style={{ textAlign: 'center' }}>
                  <Text variant="display-2" weight="bold" color="primary">
                    ${monthlyPremium}
                  </Text>
                  <Text variant="body-regular" color="subtle">
                    per month
                  </Text>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Text variant="body-large">
                    ${totalPremium.toLocaleString()} for 6 months
                  </Text>
                </div>
              </Layout>
            </Card>
          </Section>

          <Section title="What's Covered">
            <Card padding="medium">
              <Layout grid="1-1">
                <div>
                  <Text variant="body-small" weight="bold" color="subtle">
                    VEHICLE
                  </Text>
                  <Text variant="body-regular">{vehicleDisplay}</Text>
                  {quote.vehicle.vin && (
                    <Text variant="caption-small" color="subtle">
                      VIN: {quote.vehicle.vin}
                    </Text>
                  )}
                </div>

                <div>
                  <Text variant="body-small" weight="bold" color="subtle">
                    POLICYHOLDER
                  </Text>
                  <Text variant="body-regular">
                    {quote.driver.full_name}
                  </Text>
                  <Text variant="caption-small" color="subtle">
                    {quote.driver.email}
                  </Text>
                </div>
              </Layout>
            </Card>
          </Section>

          {localCoverage && (
            <Section title="Premium Breakdown">
              <PremiumBreakdown
                coverage={localCoverage}
                premium={{ monthly: monthlyPremium, sixMonth: totalPremium }}
              />
            </Section>
          )}

          <Section title="Why This Rate?">
            <Card padding="medium" background="1">
              <Layout display="flex-column" gap="small">
                <Text variant="body-regular">
                  Your premium is calculated based on multiple factors including:
                </Text>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  <li>
                    <Text variant="body-small">
                      Vehicle: {vehicleDisplay} (age, make, model, safety features)
                    </Text>
                  </li>
                  <li>
                    <Text variant="body-small">
                      Driver: {quote.driver.full_name} (driving history and experience)
                    </Text>
                  </li>
                  <li>
                    <Text variant="body-small">
                      Coverage: Comprehensive auto insurance package
                    </Text>
                  </li>
                </ul>
                <Text variant="caption-small" color="subtle">
                  This quote is valid for 30 days. Quote Status: {quote.quote_status}
                </Text>
              </Layout>
            </Card>
          </Section>

          <Layout display="flex" gap="small">
            <Button
              size="large"
              variant="primary"
              isFullWidth
              onClick={handleContinue}
            >
              Continue to Purchase
            </Button>
            <Button
              size="large"
              variant="support"
              isFullWidth
              onClick={handleSaveQuote}
            >
              Save Quote
            </Button>
          </Layout>
        </Content>

        <Aside>
          <QuoteCard
            price={monthlyPremium.toString()}
            total={totalPremium.toString()}
            name="Your Quote"
          >
            {localCoverage && (
              <List title="Coverage Summary">
                <List.Row>
                  <List.Item>
                    Bodily Injury: ${localCoverage.bodilyInjuryLimit.replace('/', ' / ')}
                  </List.Item>
                </List.Row>
                <List.Row>
                  <List.Item>
                    Property Damage: ${parseInt(localCoverage.propertyDamageLimit).toLocaleString()}
                  </List.Item>
                </List.Row>
                {localCoverage.hasCollision && (
                  <List.Row>
                    <List.Item>
                      Collision: ${localCoverage.collisionDeductible} deductible
                    </List.Item>
                  </List.Row>
                )}
                {localCoverage.hasComprehensive && (
                  <List.Row>
                    <List.Item>
                      Comprehensive: ${localCoverage.comprehensiveDeductible} deductible
                    </List.Item>
                  </List.Row>
                )}
                {localCoverage.hasUninsured && (
                  <List.Row>
                    <List.Item>Uninsured Motorist: $50k/$100k</List.Item>
                  </List.Row>
                )}
                {localCoverage.hasRoadside && (
                  <List.Row>
                    <List.Item>24/7 Roadside Assistance</List.Item>
                  </List.Row>
                )}
                {localCoverage.hasRental && (
                  <List.Row>
                    <List.Item>
                      Rental Reimbursement: ${localCoverage.rentalLimit}/day
                    </List.Item>
                  </List.Row>
                )}
              </List>
            )}

            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
              <Text variant="caption-small" align="center" weight="bold" color="primary">
                Quote valid for 30 days
              </Text>
              <Text variant="caption-small" align="center" color="subtle">
                Reference: {quoteRefNumber}
              </Text>
            </div>
          </QuoteCard>
        </Aside>
      </Main>

      <PageFooter>
        <AppFooter
          logo={logoSrc}
          links={
            <>
              <Link href="/privacy" size="xsmall">
                Privacy Policy
              </Link>
              <Link href="/terms" size="xsmall">
                Terms of Use
              </Link>
              <Link href="/contact" size="xsmall">
                Contact Us
              </Link>
            </>
          }
        >
          <>
            <Text variant="caption-small">
              Quotes are estimates based on information provided and may change based on
              additional underwriting factors. Final rates determined at time of policy issuance.
            </Text>
            <Text variant="caption-small">
              Coverage subject to underwriting approval and policy terms. Not all coverage
              available in all states.
            </Text>
          </>
        </AppFooter>
      </PageFooter>
    </AppTemplate>
  );
};

export default QuoteResults;
