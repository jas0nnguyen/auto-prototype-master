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
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [quoteRefNumber, setQuoteRefNumber] = useState<string>('');

  useEffect(() => {
    // Load quote data from session storage
    const storedData = sessionStorage.getItem('quoteData');

    if (!storedData) {
      // Redirect back to start if no quote data
      navigate('/quote/vehicle-info');
      return;
    }

    const data = JSON.parse(storedData);

    // Validate that all required data is present
    if (!data.vehicle || !data.driver || !data.coverage || !data.premium) {
      navigate('/quote/vehicle-info');
      return;
    }

    setQuoteData(data);

    // Generate quote reference number (in production, this would come from backend)
    const refNumber = `QT-${Date.now().toString().slice(-8)}`;
    setQuoteRefNumber(refNumber);

    // Save quote reference number
    sessionStorage.setItem('quoteRefNumber', refNumber);
  }, [navigate]);

  const handleContinue = () => {
    // Navigate to binding flow (Phase 4: US2)
    navigate('/binding/payment-info');
  };

  const handleSaveQuote = () => {
    alert(`Your quote has been saved! Reference number: ${quoteRefNumber}\n\nWe've sent a copy to ${quoteData?.driver.email}`);
  };

  if (!quoteData) {
    return null; // Will redirect in useEffect
  }

  const { vehicle, driver, coverage, premium } = quoteData;
  const vehicleDisplay = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

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
                    ${premium.monthly}
                  </Text>
                  <Text variant="body-regular" color="subtle">
                    per month
                  </Text>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Text variant="body-large">
                    ${premium.sixMonth} for 6 months
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
                  {vehicle.vin && (
                    <Text variant="caption-small" color="subtle">
                      VIN: {vehicle.vin}
                    </Text>
                  )}
                </div>

                <div>
                  <Text variant="body-small" weight="bold" color="subtle">
                    POLICYHOLDER
                  </Text>
                  <Text variant="body-regular">
                    {driver.firstName} {driver.lastName}
                  </Text>
                  <Text variant="caption-small" color="subtle">
                    {driver.city}, {driver.state}
                  </Text>
                </div>
              </Layout>
            </Card>
          </Section>

          <Section title="Premium Breakdown">
            <PremiumBreakdown coverage={coverage} premium={premium} />
          </Section>

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
                      Location: {driver.city}, {driver.state} (local risk factors)
                    </Text>
                  </li>
                  <li>
                    <Text variant="body-small">
                      Coverage: {coverage.bodilyInjuryLimit} bodily injury, {coverage.hasCollision ? 'collision' : 'no collision'}, {coverage.hasComprehensive ? 'comprehensive' : 'no comprehensive'}
                    </Text>
                  </li>
                </ul>
                <Text variant="caption-small" color="subtle">
                  This quote is valid for 30 days from today.
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
            price={premium.monthly.toString()}
            total={premium.sixMonth.toString()}
            name="Your Quote"
          >
            <List title="Coverage Summary">
              <List.Row>
                <List.Item>
                  Bodily Injury: ${coverage.bodilyInjuryLimit.replace('/', ' / ')}
                </List.Item>
              </List.Row>
              <List.Row>
                <List.Item>
                  Property Damage: ${parseInt(coverage.propertyDamageLimit).toLocaleString()}
                </List.Item>
              </List.Row>
              {coverage.hasCollision && (
                <List.Row>
                  <List.Item>
                    Collision: ${coverage.collisionDeductible} deductible
                  </List.Item>
                </List.Row>
              )}
              {coverage.hasComprehensive && (
                <List.Row>
                  <List.Item>
                    Comprehensive: ${coverage.comprehensiveDeductible} deductible
                  </List.Item>
                </List.Row>
              )}
              {coverage.hasUninsured && (
                <List.Row>
                  <List.Item>Uninsured Motorist: $50k/$100k</List.Item>
                </List.Row>
              )}
              {coverage.hasRoadside && (
                <List.Row>
                  <List.Item>24/7 Roadside Assistance</List.Item>
                </List.Row>
              )}
              {coverage.hasRental && (
                <List.Row>
                  <List.Item>
                    Rental Reimbursement: ${coverage.rentalLimit}/day
                  </List.Item>
                </List.Row>
              )}
            </List>

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
