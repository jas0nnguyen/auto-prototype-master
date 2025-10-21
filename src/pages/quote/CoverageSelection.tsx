import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { useQuoteByNumber, useUpdateQuoteCoverage } from '../../hooks/useQuote';
import { useQueryClient } from '@tanstack/react-query';

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
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const queryClient = useQueryClient();
  const updateQuoteCoverage = useUpdateQuoteCoverage();
  const { data: quote, isLoading: isLoadingQuote, refetch } = useQuoteByNumber(quoteNumber);

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
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!quoteNumber) {
      navigate('/quote/driver-info');
      return;
    }
  }, [navigate, quoteNumber]);

  // Load initial coverage from quote when it loads
  useEffect(() => {
    if (quote && quote.coverages && isInitialLoadRef.current) {
      setCoverage({
        coverageStartDate: quote.coverages.startDate ? new Date(quote.coverages.startDate) : undefined,
        bodilyInjuryLimit: quote.coverages.bodilyInjuryLimit || '100/300',
        propertyDamageLimit: quote.coverages.propertyDamageLimit || '50000',
        hasCollision: quote.coverages.hasCollision || false,
        collisionDeductible: quote.coverages.collisionDeductible?.toString() || '500',
        hasComprehensive: quote.coverages.hasComprehensive || false,
        comprehensiveDeductible: quote.coverages.comprehensiveDeductible?.toString() || '500',
        hasUninsured: quote.coverages.hasUninsured || false,
        hasRoadside: quote.coverages.hasRoadside || false,
        hasRental: quote.coverages.hasRental || false,
        rentalLimit: quote.coverages.rentalLimit?.toString() || '50',
      });
      isInitialLoadRef.current = false; // Mark that initial data has been loaded
    }
  }, [quote?.quote_number]); // Only run when quote first loads

  // Auto-update premium when coverage changes (with debounce)
  useEffect(() => {
    // Skip API call if this is the initial load
    if (!quoteNumber || !coverage.coverageStartDate || isInitialLoadRef.current) return;

    setIsPricingLoading(true);

    // Debounce API calls - wait 300ms after user stops making changes
    const timer = setTimeout(async () => {
      try {
        await updateQuoteCoverage.mutateAsync({
          quoteNumber,
          coverageData: {
            coverage_start_date: coverage.coverageStartDate.toISOString().split('T')[0],
            coverage_bodily_injury_limit: coverage.bodilyInjuryLimit,
            coverage_property_damage_limit: coverage.propertyDamageLimit,
            coverage_collision: coverage.hasCollision,
            coverage_collision_deductible: coverage.hasCollision ? parseInt(coverage.collisionDeductible) : undefined,
            coverage_comprehensive: coverage.hasComprehensive,
            coverage_comprehensive_deductible: coverage.hasComprehensive ? parseInt(coverage.comprehensiveDeductible) : undefined,
            coverage_uninsured_motorist: coverage.hasUninsured,
            coverage_roadside_assistance: coverage.hasRoadside,
            coverage_rental_reimbursement: coverage.hasRental,
            coverage_rental_limit: coverage.hasRental ? parseInt(coverage.rentalLimit) : undefined,
          },
        });
        // Explicitly refetch the quote to get the updated premium
        await refetch();
      } catch (error) {
        console.error('Failed to update coverage:', error);
      } finally {
        setIsPricingLoading(false);
      }
    }, 300); // Wait 300ms after last change for snappier updates

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverage, quoteNumber]); // Re-run when coverage or quoteNumber changes (refetch and updateQuoteCoverage are stable)

  // Get premium from API quote - this is the actual calculated premium from the backend
  const { monthly, sixMonth } = useMemo(() => {
    if (!quote || !quote.premium) {
      // Fallback to basic values while loading
      return {
        monthly: 100,
        sixMonth: 600,
      };
    }

    const calculated = {
      monthly: quote.premium.monthly || Math.round((quote.premium.total || 0) / 6),
      sixMonth: quote.premium.sixMonth || quote.premium.total || 0,
    };

    console.log('[CoverageSelection] Premium updated:', {
      monthly: calculated.monthly,
      sixMonth: calculated.sixMonth,
      total: quote.premium.total,
      quoteNumber: quote.quote_number,
    });

    return calculated;
  }, [quote]); // Updates when quote data changes from API

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coverage.coverageStartDate) {
      alert('Please select a coverage start date');
      return;
    }

    if (!quoteNumber) return;

    try {
      setIsSubmitting(true);

      // Update quote with coverage selections
      const updatedQuote = await updateQuoteCoverage.mutateAsync({
        quoteNumber,
        coverageData: {
          coverage_start_date: coverage.coverageStartDate?.toISOString().split('T')[0],
          coverage_bodily_injury_limit: coverage.bodilyInjuryLimit,
          coverage_property_damage_limit: coverage.propertyDamageLimit,
          coverage_collision: coverage.hasCollision,
          coverage_collision_deductible: coverage.hasCollision ? parseInt(coverage.collisionDeductible) : undefined,
          coverage_comprehensive: coverage.hasComprehensive,
          coverage_comprehensive_deductible: coverage.hasComprehensive ? parseInt(coverage.comprehensiveDeductible) : undefined,
          coverage_uninsured_motorist: coverage.hasUninsured,
          coverage_roadside_assistance: coverage.hasRoadside,
          coverage_rental_reimbursement: coverage.hasRental,
          coverage_rental_limit: coverage.hasRental ? parseInt(coverage.rentalLimit) : undefined,
        },
      });

      // Navigate to quote results with quote number in URL
      navigate(`/quote/results/${quoteNumber}`);
    } catch (error) {
      console.error('Error finalizing quote:', error);
      alert('Failed to finalize quote. Please try again.');
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
                  onClick={() => navigate(`/quote/vehicles/${quoteNumber}`)}
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
                    value={coverage.bodilyInjuryLimit}
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
                    value={coverage.propertyDamageLimit}
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
                      value={coverage.collisionDeductible}
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
                      value={coverage.comprehensiveDeductible}
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
                      value={coverage.rentalLimit}
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
                disabled={isSubmitting || updateQuoteCoverage.isPending || isLoadingQuote}
              >
                {isSubmitting || updateQuoteCoverage.isPending ? 'Finalizing Your Quote...' : 'See My Quote'}
              </Button>
            </div>
          </Form>
        </Content>

        <Aside>
          <QuoteCard
            price={monthly.toFixed(2)}
            total={sixMonth.toFixed(2)}
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
