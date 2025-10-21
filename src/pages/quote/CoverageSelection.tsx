import React, { useState, useEffect, useMemo } from 'react';
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
  Skeleton,
} from '@sureapp/canary-design-system';
import { useCreateQuote } from '../../hooks/useQuote';
import type { CreateQuoteRequest } from '../../services/quote-api';

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
  const createQuote = useCreateQuote();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPricingLoading, setIsPricingLoading] = useState(false);

  useEffect(() => {
    // Check if previous steps completed
    const quoteData = sessionStorage.getItem('quoteData');
    if (!quoteData) {
      navigate('/quote/driver-info');
      return;
    }

    const parsedData = JSON.parse(quoteData);
    // Check for new data structure (primaryDriver + vehicles) or old structure (driver + vehicle)
    const hasDriver = parsedData.primaryDriver || parsedData.driver;
    const hasVehicle = (parsedData.vehicles && parsedData.vehicles.length > 0) || parsedData.vehicle;

    if (!hasDriver || !hasVehicle) {
      navigate('/quote/driver-info');
    }
  }, [navigate]);

  // Simulate API latency when coverage changes
  useEffect(() => {
    setIsPricingLoading(true);
    const timer = setTimeout(() => {
      setIsPricingLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [coverage]);

  // Calculate premium based on selections - updates in real-time as coverage changes
  const { monthly, sixMonth } = useMemo(() => {
    let basePrice = 95; // Base liability coverage

    // Add coverage limits adjustments
    const biLimitAdjustment = {
      '25/50': 0,
      '50/100': 15,
      '100/300': 30,
      '250/500': 50,
      '500/1000': 75,
    }[coverage.bodilyInjuryLimit] || 0;
    basePrice += biLimitAdjustment;

    const pdLimitAdjustment = {
      '25000': 0,
      '50000': 10,
      '100000': 20,
      '250000': 35,
      '500000': 50,
    }[coverage.propertyDamageLimit] || 0;
    basePrice += pdLimitAdjustment;

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
  }, [coverage]); // Recalculates whenever coverage state changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coverage.coverageStartDate) {
      alert('Please select a coverage start date');
      return;
    }

    // Get data from previous steps
    const storedData = sessionStorage.getItem('quoteData');
    if (!storedData) {
      alert('Session data lost. Please start over.');
      navigate('/quote/vehicle-info');
      return;
    }

    const quoteData = JSON.parse(storedData);

    // Handle both old and new data structures
    const primaryDriver = quoteData.primaryDriver || quoteData.driver;
    const additionalDrivers = quoteData.additionalDrivers || [];
    const allVehicles = quoteData.vehicles || (quoteData.vehicle ? [quoteData.vehicle] : []);

    if (!primaryDriver || allVehicles.length === 0) {
      alert('Missing driver or vehicle information. Please start over.');
      navigate('/quote/driver-info');
      return;
    }

    // Build drivers array for API (NEW FORMAT)
    const driversArray = [
      {
        first_name: primaryDriver.firstName,
        last_name: primaryDriver.lastName,
        birth_date: primaryDriver.dob,
        email: primaryDriver.email,
        phone: primaryDriver.phone || '555-0100',
        gender: primaryDriver.gender,
        marital_status: primaryDriver.maritalStatus,
        years_licensed: primaryDriver.yearsLicensed,
        is_primary: true,
      },
      ...additionalDrivers.map((d: any) => ({
        first_name: d.firstName,
        last_name: d.lastName,
        birth_date: d.dob,
        email: d.email,
        phone: d.phone || '555-0100',
        gender: d.gender,
        marital_status: d.maritalStatus,
        years_licensed: d.yearsLicensed,
        relationship: d.relationship,
        is_primary: false,
      })),
    ];

    // Build vehicles array for API (NEW FORMAT)
    const vehiclesArray = allVehicles.map((v: any) => ({
      year: parseInt(v.year),
      make: v.make,
      model: v.model,
      vin: v.vin || undefined,
      annual_mileage: v.annualMileage,
      body_type: v.bodyType,
      primary_driver_id: v.primaryDriverId,
    }));

    // Map frontend data to API request format
    const quoteRequest: CreateQuoteRequest = {
      // NEW: Send all drivers and vehicles
      drivers: driversArray,
      vehicles: vehiclesArray,

      // Address (for PNI)
      address_line_1: primaryDriver.address,
      address_line_2: primaryDriver.apt || undefined,
      address_city: primaryDriver.city,
      address_state: primaryDriver.state,
      address_zip: primaryDriver.zip,

      // Coverage selections (NEW field names)
      coverage_start_date: coverage.coverageStartDate?.toISOString().split('T')[0],
      coverage_bodily_injury_limit: coverage.bodilyInjuryLimit,
      coverage_property_damage_limit: coverage.propertyDamageLimit,
      coverage_has_collision: coverage.hasCollision,
      coverage_collision_deductible: coverage.hasCollision ? parseInt(coverage.collisionDeductible) : undefined,
      coverage_has_comprehensive: coverage.hasComprehensive,
      coverage_comprehensive_deductible: coverage.hasComprehensive ? parseInt(coverage.comprehensiveDeductible) : undefined,
      coverage_has_uninsured: coverage.hasUninsured,
      coverage_has_roadside: coverage.hasRoadside,
      coverage_has_rental: coverage.hasRental,
      coverage_rental_limit: coverage.hasRental ? parseInt(coverage.rentalLimit) : undefined,
    };

    try {
      setIsSubmitting(true);

      // Call the API to create the quote
      const createdQuote = await createQuote.mutateAsync(quoteRequest);

      // Store the quote ID and navigate to results
      sessionStorage.setItem('quoteId', createdQuote.quoteId);
      sessionStorage.setItem('quoteNumber', createdQuote.quoteNumber);

      // Navigate to quote results
      navigate('/quote/results');
    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Failed to create quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
                  onClick={() => navigate('/quote/vehicle-confirmation')}
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
                    onChange={(value) => setCoverage({ ...coverage, bodilyInjuryLimit: value })}
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
                    onChange={(value) => setCoverage({ ...coverage, propertyDamageLimit: value })}
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
                      onChange={(value) => setCoverage({ ...coverage, collisionDeductible: value })}
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
                      onChange={(value) => setCoverage({ ...coverage, comprehensiveDeductible: value })}
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
                      onChange={(value) => setCoverage({ ...coverage, rentalLimit: value })}
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

            <div style={{ marginTop: '2rem' }}>
              <Button
                type="submit"
                size="large"
                variant="primary"
                isFullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Your Quote...' : 'See My Quote'}
              </Button>
            </div>
          </Form>
        </Content>

        <Aside>
          <QuoteCard
            price={monthly.toString()}
            total={sixMonth.toString()}
            isLoading={isPricingLoading}
          >
            <Button emphasis="strong" href="#" size="xsmall" variant="support">
              View sample policy
            </Button>
            <List title="Liability Coverage">
              <List.Row>
                <List.Item>
                  {isPricingLoading ? (
                    <Skeleton variant="text" width={150} />
                  ) : (
                    `Bodily Injury: ${coverage.bodilyInjuryLimit.replace('/', ' / ')}`
                  )}
                </List.Item>
              </List.Row>
              <List.Row>
                <List.Item>
                  {isPricingLoading ? (
                    <Skeleton variant="text" width={180} />
                  ) : (
                    `Property Damage: $${parseInt(coverage.propertyDamageLimit).toLocaleString()}`
                  )}
                </List.Item>
              </List.Row>
            </List>
            {coverage.hasCollision && (
              <List title="Collision">
                <List.Row>
                  <List.Item>
                    {isPricingLoading ? (
                      <Skeleton variant="text" width={120} />
                    ) : (
                      `$${coverage.collisionDeductible} deductible`
                    )}
                  </List.Item>
                </List.Row>
              </List>
            )}
            {coverage.hasComprehensive && (
              <List title="Comprehensive">
                <List.Row>
                  <List.Item>
                    {isPricingLoading ? (
                      <Skeleton variant="text" width={120} />
                    ) : (
                      `$${coverage.comprehensiveDeductible} deductible`
                    )}
                  </List.Item>
                </List.Row>
              </List>
            )}
            {coverage.hasUninsured && (
              <List title="Uninsured Motorist">
                <List.Row>
                  <List.Item>
                    {isPricingLoading ? (
                      <Skeleton variant="text" width={100} />
                    ) : (
                      '50k/100k coverage'
                    )}
                  </List.Item>
                </List.Row>
              </List>
            )}
            {coverage.hasRoadside && (
              <List title="Roadside Assistance">
                <List.Row>
                  <List.Item>
                    {isPricingLoading ? (
                      <Skeleton variant="text" width={80} />
                    ) : (
                      '24/7 service'
                    )}
                  </List.Item>
                </List.Row>
              </List>
            )}
            {coverage.hasRental && (
              <List title="Rental Reimbursement">
                <List.Row>
                  <List.Item>
                    {isPricingLoading ? (
                      <Skeleton variant="text" width={100} />
                    ) : (
                      `$${coverage.rentalLimit}/day limit`
                    )}
                  </List.Item>
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
