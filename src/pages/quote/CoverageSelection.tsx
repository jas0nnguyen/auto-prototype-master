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
  Form,
  Section,
  Select,
  Block,
  Switch,
  Text,
  Link,
  QuoteCard,
  List,
  ChevronLeft,
  DateInput,
} from '@sureapp/canary-design-system';

const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

interface CoverageData {
  coverageStartDate: Date | undefined;
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
}

const CoverageSelection: React.FC = () => {
  const navigate = useNavigate();
  const [coverage, setCoverage] = useState<CoverageData>({
    coverageStartDate: undefined,
    bodilyInjuryLimit: '100/300',
    propertyDamageLimit: '50000',
    hasCollision: true,
    collisionDeductible: '500',
    hasComprehensive: true,
    comprehensiveDeductible: '500',
    hasUninsured: true,
    hasRoadside: false,
    hasRental: false,
    rentalLimit: '50',
  });

  useEffect(() => {
    // Check if previous steps completed
    const quoteData = sessionStorage.getItem('quoteData');
    if (!quoteData) {
      navigate('/quote/vehicle-info');
    }
  }, [navigate]);

  // Calculate premium based on selections
  const calculatePremium = (): { monthly: number; sixMonth: number } => {
    let basePrice = 95; // Base liability coverage

    if (coverage.hasCollision) basePrice += 32;
    if (coverage.hasComprehensive) basePrice += 28;
    if (coverage.hasUninsured) basePrice += 15;
    if (coverage.hasRoadside) basePrice += 5;
    if (coverage.hasRental) basePrice += 8;

    // Adjust for deductibles (higher deductible = lower premium)
    if (coverage.hasCollision) {
      const deductibleDiscount = {
        '250': 0,
        '500': -5,
        '1000': -10,
        '2500': -15,
      }[coverage.collisionDeductible] || 0;
      basePrice += deductibleDiscount;
    }

    if (coverage.hasComprehensive) {
      const deductibleDiscount = {
        '250': 0,
        '500': -3,
        '1000': -6,
        '2500': -10,
      }[coverage.comprehensiveDeductible] || 0;
      basePrice += deductibleDiscount;
    }

    return {
      monthly: Math.max(basePrice, 50), // Minimum $50/month
      sixMonth: Math.max(basePrice * 6, 300),
    };
  };

  const { monthly, sixMonth } = calculatePremium();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!coverage.coverageStartDate) {
      alert('Please select a coverage start date');
      return;
    }

    // Save coverage data
    const existingData = JSON.parse(sessionStorage.getItem('quoteData') || '{}');
    const updatedData = {
      ...existingData,
      coverage,
      premium: { monthly, sixMonth },
    };
    sessionStorage.setItem('quoteData', JSON.stringify(updatedData));

    // Navigate to quote results
    navigate('/quote/results');
  };

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
                  href="/quote/driver-info"
                  emphasis="text"
                  startIcon={ChevronLeft}
                >
                  Back
                </Button>
              }
              hasBorder={false}
              hasPadding={false}
              supportText="Choose the coverage that's right for you. You can always adjust this later."
              title="Customize Your Coverage"
              titleSize="title-1"
            />
          </AppTemplate.Title>

          <Form onSubmit={handleSubmit}>
            <Section>
              <DateInput
                id="coverage-start-date"
                label="When do you want coverage to start?"
                placeholder="MM/DD/YYYY"
                size="small"
                required
                date={coverage.coverageStartDate}
                setDate={(date) => setCoverage({ ...coverage, coverageStartDate: date })}
                helpText="Coverage can start as soon as today or up to 60 days in the future"
              />
            </Section>

            <Section title="Required Coverage">
              <Block
                title="Bodily Injury & Property Damage Liability"
                supportText="Required by law. Covers injuries and damage you cause to others."
              >
                <Text color="normal" variant="body-small" style={{ marginBottom: '1rem' }}>
                  Liability coverage protects you if you're at fault in an accident. It pays for
                  other people's medical expenses and property damage.
                </Text>
                <Form.Row layout="1-1">
                  <Select
                    id="bodily-injury"
                    label="Bodily Injury Limit"
                    size="small"
                    required
                    value={coverage.bodilyInjuryLimit}
                    onChange={(e) => setCoverage({ ...coverage, bodilyInjuryLimit: e.target.value })}
                    options={[
                      { label: '$25,000 / $50,000', value: '25/50' },
                      { label: '$50,000 / $100,000', value: '50/100' },
                      { label: '$100,000 / $300,000', value: '100/300' },
                      { label: '$250,000 / $500,000', value: '250/500' },
                    ]}
                  />
                  <Select
                    id="property-damage"
                    label="Property Damage Limit"
                    size="small"
                    required
                    value={coverage.propertyDamageLimit}
                    onChange={(e) => setCoverage({ ...coverage, propertyDamageLimit: e.target.value })}
                    options={[
                      { label: '$25,000', value: '25000' },
                      { label: '$50,000', value: '50000' },
                      { label: '$100,000', value: '100000' },
                    ]}
                  />
                </Form.Row>
              </Block>
            </Section>

            <Section title="Recommended Coverage">
              <Block
                title="Collision Coverage"
                supportText={`Repairs your car after an accident, regardless of who's at fault. ${coverage.hasCollision ? '+$32/month' : ''}`}
                tooltipText="Covers damage from colliding with another vehicle or object"
                controls={
                  <Switch
                    id="collision-switch"
                    name="collision"
                    checked={coverage.hasCollision}
                    onChange={(e) => setCoverage({ ...coverage, hasCollision: e.target.checked })}
                  />
                }
              >
                {coverage.hasCollision && (
                  <>
                    <Text color="normal" variant="body-small" style={{ marginBottom: '0.75rem' }}>
                      Collision coverage pays to repair or replace your vehicle if it's damaged in
                      an accident with another vehicle or object (like a tree or guardrail).
                    </Text>
                    <Select
                      id="collision-deductible"
                      label="Deductible"
                      size="small"
                      value={coverage.collisionDeductible}
                      onChange={(e) => setCoverage({ ...coverage, collisionDeductible: e.target.value })}
                      options={[
                        { label: '$250', value: '250' },
                        { label: '$500 (Recommended)', value: '500' },
                        { label: '$1,000', value: '1000' },
                        { label: '$2,500', value: '2500' },
                      ]}
                      helpText="The amount you pay out-of-pocket before insurance covers the rest. Higher deductible = lower premium."
                    />
                  </>
                )}
              </Block>

              <Block
                title="Comprehensive Coverage"
                supportText={`Covers theft, vandalism, weather, and other non-collision damage. ${coverage.hasComprehensive ? '+$28/month' : ''}`}
                tooltipText="Protects against damage not caused by a collision"
                controls={
                  <Switch
                    id="comprehensive-switch"
                    name="comprehensive"
                    checked={coverage.hasComprehensive}
                    onChange={(e) => setCoverage({ ...coverage, hasComprehensive: e.target.checked })}
                  />
                }
              >
                {coverage.hasComprehensive && (
                  <>
                    <Text color="normal" variant="body-small" style={{ marginBottom: '0.75rem' }}>
                      Comprehensive coverage protects your vehicle from damage caused by events other
                      than collisions, including theft, vandalism, fire, weather, falling objects,
                      and animal strikes.
                    </Text>
                    <Select
                      id="comprehensive-deductible"
                      label="Deductible"
                      size="small"
                      value={coverage.comprehensiveDeductible}
                      onChange={(e) => setCoverage({ ...coverage, comprehensiveDeductible: e.target.value })}
                      options={[
                        { label: '$250', value: '250' },
                        { label: '$500 (Recommended)', value: '500' },
                        { label: '$1,000', value: '1000' },
                        { label: '$2,500', value: '2500' },
                      ]}
                      helpText="Higher deductible = lower premium"
                    />
                  </>
                )}
              </Block>

              <Block
                title="Uninsured/Underinsured Motorist Coverage"
                supportText={`Protects you if hit by a driver with no or insufficient insurance. ${coverage.hasUninsured ? '+$15/month' : ''}`}
                tooltipText="Covers your medical bills and vehicle damage"
                controls={
                  <Switch
                    id="uninsured-switch"
                    name="uninsured"
                    checked={coverage.hasUninsured}
                    onChange={(e) => setCoverage({ ...coverage, hasUninsured: e.target.checked })}
                  />
                }
              >
                {coverage.hasUninsured && (
                  <Text color="normal" variant="body-small">
                    This coverage steps in when you're hit by a driver who doesn't have insurance
                    or doesn't have enough insurance to cover your medical bills and vehicle repairs.
                    Highly recommended since many drivers are underinsured.
                  </Text>
                )}
              </Block>
            </Section>

            <Section title="Additional Protection">
              <Block
                title="24/7 Roadside Assistance"
                supportText={`Towing, jump starts, lockout service, and flat tire changes. ${coverage.hasRoadside ? '+$5/month' : ''}`}
                controls={
                  <Switch
                    id="roadside-switch"
                    name="roadside"
                    checked={coverage.hasRoadside}
                    onChange={(e) => setCoverage({ ...coverage, hasRoadside: e.target.checked })}
                  />
                }
              >
                {coverage.hasRoadside && (
                  <Text color="normal" variant="body-small">
                    Get help anytime, anywhere. Includes unlimited towing to the nearest qualified
                    repair facility, jump starts, lockout service, flat tire changes, and fuel delivery.
                  </Text>
                )}
              </Block>

              <Block
                title="Rental Car Reimbursement"
                supportText={`Covers rental car costs while your vehicle is being repaired. ${coverage.hasRental ? '+$8/month' : ''}`}
                controls={
                  <Switch
                    id="rental-switch"
                    name="rental"
                    checked={coverage.hasRental}
                    onChange={(e) => setCoverage({ ...coverage, hasRental: e.target.checked })}
                  />
                }
              >
                {coverage.hasRental && (
                  <>
                    <Text color="normal" variant="body-small" style={{ marginBottom: '0.75rem' }}>
                      If your car is in the shop due to a covered claim, this pays for a rental car.
                    </Text>
                    <Select
                      id="rental-limit"
                      label="Daily Rental Limit"
                      size="small"
                      value={coverage.rentalLimit}
                      onChange={(e) => setCoverage({ ...coverage, rentalLimit: e.target.value })}
                      options={[
                        { label: '$30 per day', value: '30' },
                        { label: '$50 per day (Recommended)', value: '50' },
                        { label: '$75 per day', value: '75' },
                      ]}
                    />
                  </>
                )}
              </Block>
            </Section>

            <Form.Actions>
              <Button
                type="submit"
                size="large"
                variant="primary"
                isFullWidth
              >
                See My Quote
              </Button>
            </Form.Actions>
          </Form>
        </Content>

        <Aside>
          <QuoteCard price={monthly.toString()} total={sixMonth.toString()}>
            <Button emphasis="strong" href="#" size="xsmall" variant="support">
              View sample policy
            </Button>
            <List title="Liability Coverage">
              <List.Row>
                <List.Item>Bodily Injury: {coverage.bodilyInjuryLimit.replace('/', ' / ')}</List.Item>
              </List.Row>
              <List.Row>
                <List.Item>Property Damage: ${parseInt(coverage.propertyDamageLimit).toLocaleString()}</List.Item>
              </List.Row>
            </List>
            {coverage.hasCollision && (
              <List title="Collision">
                <List.Row>
                  <List.Item>${coverage.collisionDeductible} deductible</List.Item>
                </List.Row>
              </List>
            )}
            {coverage.hasComprehensive && (
              <List title="Comprehensive">
                <List.Row>
                  <List.Item>${coverage.comprehensiveDeductible} deductible</List.Item>
                </List.Row>
              </List>
            )}
            {coverage.hasUninsured && (
              <List title="Uninsured Motorist">
                <List.Row>
                  <List.Item>50k/100k coverage</List.Item>
                </List.Row>
              </List>
            )}
            {coverage.hasRoadside && (
              <List title="Roadside Assistance">
                <List.Row>
                  <List.Item>24/7 service</List.Item>
                </List.Row>
              </List>
            )}
            {coverage.hasRental && (
              <List title="Rental Reimbursement">
                <List.Row>
                  <List.Item>${coverage.rentalLimit}/day limit</List.Item>
                </List.Row>
              </List>
            )}
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
            </>
          }
        >
          <>
            <Text variant="caption-small">
              Coverage descriptions are for informational purposes only. Actual coverage subject
              to policy terms, conditions, and exclusions.
            </Text>
          </>
        </AppFooter>
      </PageFooter>
    </AppTemplate>
  );
};

export default CoverageSelection;
