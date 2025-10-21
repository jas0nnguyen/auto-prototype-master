import React, { useState } from 'react';
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

const AutoInsuranceCoveragePage: React.FC = () => {
  const navigate = useNavigate();
  const [coverageDate, setCoverageDate] = useState<Date | undefined>(undefined);
  const [hasCollision, setHasCollision] = useState(true);
  const [hasComprehensive, setHasComprehensive] = useState(true);
  const [hasUninsured, setHasUninsured] = useState(true);
  const [hasRoadside, setHasRoadside] = useState(false);
  const [hasRental, setHasRental] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/auto-insurance/checkout');
  };

  // Calculate price
  const calculatePrice = () => {
    let basePrice = 95;
    if (hasCollision) basePrice += 32;
    if (hasComprehensive) basePrice += 28;
    if (hasUninsured) basePrice += 15;
    if (hasRoadside) basePrice += 5;
    if (hasRental) basePrice += 8;
    return basePrice;
  };

  const monthlyPrice = calculatePrice();
  const sixMonthPrice = monthlyPrice * 6;

  return (
    <AppTemplate preset="purchase-flow">
      <PageHeader>
        <AppHeader
          logo={logoSrc}
          logoHref="/auto-insurance/landing"
        />
      </PageHeader>

      <Main>
        <Content>
          <AppTemplate.Title>
            <Header
              breadcrumbs={
                <Button
                  href="/auto-insurance/getting-started"
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

          <Form
            onSubmit={handleSubmit}
            buttonLabel="Continue to Checkout"
          >
            <Section>
              <DateInput
                id="coverage-start-date"
                label="When do you want coverage to start?"
                placeholder="MM/DD/YYYY"
                size="small"
                date={coverageDate}
                setDate={setCoverageDate}
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
                  other people's medical expenses and property damage. Most states require minimum
                  liability coverage.
                </Text>
                <Form.Row layout="1-1">
                  <Select
                    id="bodily-injury"
                    label="Bodily Injury Limit"
                    size="small"
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
                supportText="Repairs your car after an accident, regardless of who's at fault. +$32/month"
                tooltipText="Covers damage from colliding with another vehicle or object"
                controls={
                  <Switch
                    id="collision-switch"
                    name="collision"
                    checked={hasCollision}
                    onChange={(e) => setHasCollision(e.target.checked)}
                  />
                }
              >
                {hasCollision && (
                  <>
                    <Text color="normal" variant="body-small" style={{ marginBottom: '0.75rem' }}>
                      Collision coverage pays to repair or replace your vehicle if it's damaged in
                      an accident with another vehicle or object (like a tree or guardrail).
                    </Text>
                    <Select
                      id="collision-deductible"
                      label="Deductible"
                      size="small"
                      options={[
                        { label: '$250', value: '250' },
                        { label: '$500', value: '500' },
                        { label: '$1,000', value: '1000' },
                        { label: '$2,500', value: '2500' },
                      ]}
                      helpText="The amount you pay out-of-pocket before insurance covers the rest"
                    />
                  </>
                )}
              </Block>

              <Block
                title="Comprehensive Coverage"
                supportText="Covers theft, vandalism, weather, and other non-collision damage. +$28/month"
                tooltipText="Protects against damage not caused by a collision"
                controls={
                  <Switch
                    id="comprehensive-switch"
                    name="comprehensive"
                    checked={hasComprehensive}
                    onChange={(e) => setHasComprehensive(e.target.checked)}
                  />
                }
              >
                {hasComprehensive && (
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
                      options={[
                        { label: '$250', value: '250' },
                        { label: '$500', value: '500' },
                        { label: '$1,000', value: '1000' },
                        { label: '$2,500', value: '2500' },
                      ]}
                      helpText="The amount you pay out-of-pocket before insurance covers the rest"
                    />
                  </>
                )}
              </Block>

              <Block
                title="Uninsured/Underinsured Motorist Coverage"
                supportText="Protects you if hit by a driver with no or insufficient insurance. +$15/month"
                tooltipText="Covers your medical bills and vehicle damage"
                controls={
                  <Switch
                    id="uninsured-switch"
                    name="uninsured"
                    checked={hasUninsured}
                    onChange={(e) => setHasUninsured(e.target.checked)}
                  />
                }
              >
                {hasUninsured && (
                  <Text color="normal" variant="body-small">
                    This coverage steps in when you're hit by a driver who doesn't have insurance
                    or doesn't have enough insurance to cover your medical bills and vehicle repairs.
                    It's highly recommended since many drivers are underinsured.
                  </Text>
                )}
              </Block>
            </Section>

            <Section title="Additional Protection">
              <Block
                title="24/7 Roadside Assistance"
                supportText="Towing, jump starts, lockout service, and flat tire changes. +$5/month"
                controls={
                  <Switch
                    id="roadside-switch"
                    name="roadside"
                    checked={hasRoadside}
                    onChange={(e) => setHasRoadside(e.target.checked)}
                  />
                }
              >
                {hasRoadside && (
                  <Text color="normal" variant="body-small">
                    Get help anytime, anywhere. Includes unlimited towing to the nearest qualified
                    repair facility, jump starts, lockout service, flat tire changes, and fuel delivery.
                    Average service arrival time: 30 minutes.
                  </Text>
                )}
              </Block>

              <Block
                title="Rental Car Reimbursement"
                supportText="Covers rental car costs while your vehicle is being repaired. +$8/month"
                controls={
                  <Switch
                    id="rental-switch"
                    name="rental"
                    checked={hasRental}
                    onChange={(e) => setHasRental(e.target.checked)}
                  />
                }
              >
                {hasRental && (
                  <>
                    <Text color="normal" variant="body-small" style={{ marginBottom: '0.75rem' }}>
                      If your car is in the shop due to a covered claim, this pays for a rental car
                      so you can keep your life moving. Choose your daily limit below.
                    </Text>
                    <Select
                      id="rental-limit"
                      label="Daily Rental Limit"
                      size="small"
                      options={[
                        { label: '$30 per day', value: '30' },
                        { label: '$50 per day', value: '50' },
                        { label: '$75 per day', value: '75' },
                      ]}
                    />
                  </>
                )}
              </Block>
            </Section>
          </Form>
        </Content>

        <Aside>
          <QuoteCard price={monthlyPrice.toString()} total={sixMonthPrice.toString()}>
            <Button emphasis="strong" href="#" size="xsmall" variant="support">
              View sample policy
            </Button>
            <List title="Liability Coverage">
              <List.Row>
                <List.Item>Bodily Injury: $100k/$300k</List.Item>
              </List.Row>
              <List.Row>
                <List.Item>Property Damage: $50k</List.Item>
              </List.Row>
            </List>
            {hasCollision && (
              <List title="Collision">
                <List.Row>
                  <List.Item>$500 deductible</List.Item>
                </List.Row>
              </List>
            )}
            {hasComprehensive && (
              <List title="Comprehensive">
                <List.Row>
                  <List.Item>$500 deductible</List.Item>
                </List.Row>
              </List>
            )}
            {hasUninsured && (
              <List title="Uninsured Motorist">
                <List.Row>
                  <List.Item>$50k/$100k coverage</List.Item>
                </List.Row>
              </List>
            )}
            {hasRoadside && (
              <List title="Roadside Assistance">
                <List.Row>
                  <List.Item>24/7 service</List.Item>
                </List.Row>
              </List>
            )}
            {hasRental && (
              <List title="Rental Reimbursement">
                <List.Row>
                  <List.Item>$50/day limit</List.Item>
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
              <Link href="/" size="xsmall">
                Privacy Policy
              </Link>
              <Link href="/" size="xsmall">
                Terms of Use
              </Link>
            </>
          }
        >
          <>
            <Text variant="caption-small">
              Coverage descriptions are for informational purposes only. Actual coverage subject
              to policy terms, conditions, and exclusions. Not all coverage available in all states.
            </Text>
            <Text variant="caption-small">
              Deductible is the amount you pay out-of-pocket before insurance coverage applies.
              Higher deductibles typically result in lower premiums.
            </Text>
          </>
        </AppFooter>
      </PageFooter>
    </AppTemplate>
  );
};

export default AutoInsuranceCoveragePage;
