/**
 * Confirmation Page - Policy Binding Success
 *
 * Modeled after Canary Design Language confirmation pattern.
 * Displays success message, policy details, and next steps.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useQuoteByNumber } from '../../hooks/useQuote';
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
  Section,
  Card,
  Layout,
  List,
  Button,
  Text,
  Link,
  QuoteCard,
  PaymentBadge,
  Visa,
} from '@sureapp/canary-design-system';
import { formatDateDisplay } from '../../utils/dateFormatter';

// Logo for consistent branding
const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

export default function Confirmation() {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const navigate = useNavigate();

  // Load quote data (which now has policy info after binding)
  const { data: quote, isLoading, error } = useQuoteByNumber(quoteNumber || '');

  if (isLoading) {
    return (
      <AppTemplate preset="purchase-flow">
        <PageHeader>
          <AppHeader logo={logoSrc} logoHref="/" />
        </PageHeader>
        <Main>
          <Content>
            <Text variant="body-large">Loading policy details...</Text>
          </Content>
        </Main>
      </AppTemplate>
    );
  }

  if (error || !quote) {
    return (
      <AppTemplate preset="purchase-flow">
        <PageHeader>
          <AppHeader logo={logoSrc} logoHref="/" />
        </PageHeader>
        <Main>
          <Content>
            <Text variant="body-large" style={{ color: 'red' }}>Error loading policy details</Text>
            <Button onClick={() => navigate('/')} variant="primary" size="medium">
              Return to home
            </Button>
          </Content>
        </Main>
      </AppTemplate>
    );
  }

  const premium = quote.premium?.total || 0;
  const monthlyPremium = quote.premium?.monthly || Math.round(premium / 6);
  const driver = quote.driver;
  const firstName = driver?.first_name || 'Customer';

  // Get coverage details from quote
  const coverages = quote.coverages || {};
  const vehicles = quote.vehicles || [];
  const additionalDrivers = quote.additionalDrivers || [];

  return (
    <AppTemplate preset="purchase-flow">
      <PageHeader>
        <AppHeader logo={logoSrc} logoHref="/" />
      </PageHeader>

      <Main>
        <Content>
          <AppTemplate.Title>
            <Header
              hasBorder={false}
              hasPadding={false}
              title={`You're all set, ${firstName}`}
              titleSize="title-1"
            />
          </AppTemplate.Title>

          <Section
            title={`Policy #${quote.quote_number} is effective ${formatDateDisplay(quote.effective_date)}`}
            supportText={`Your policy details have been sent to ${driver?.email || 'your email'}.`}
          >
            <Card padding="medium">
              <Layout grid="1-1">
                <List title="Policyholder information">
                  <List.Row>
                    <List.Item>
                      {driver?.first_name} {driver?.last_name}
                    </List.Item>
                  </List.Row>
                  <List.Row>
                    <List.Item>{driver?.email}</List.Item>
                  </List.Row>
                  {driver?.phone && (
                    <List.Row>
                      <List.Item>{driver.phone}</List.Item>
                    </List.Row>
                  )}
                </List>

                <List title="Billing Details">
                  <List.Row>
                    <List.Item>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PaymentBadge svgString={Visa} size="small" />
                        <Text variant="body-regular">Ending in 4242</Text>
                      </div>
                    </List.Item>
                  </List.Row>
                </List>

                <List title="Coverage period">
                  <List.Row>
                    <List.Item>
                      {formatDateDisplay(quote.effective_date)} - {formatDateDisplay(quote.expiration_date)}
                    </List.Item>
                  </List.Row>
                </List>

                {vehicles.length > 0 && (
                  <List title="Insured vehicles">
                    {vehicles.map((vehicle: any, index: number) => (
                      <List.Row key={index}>
                        <List.Item>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </List.Item>
                      </List.Row>
                    ))}
                  </List>
                )}

                {additionalDrivers.length > 0 && (
                  <List title="Additional drivers">
                    {additionalDrivers.map((addDriver: any, index: number) => (
                      <List.Row key={index}>
                        <List.Item>
                          {addDriver.first_name} {addDriver.last_name}
                        </List.Item>
                      </List.Row>
                    ))}
                  </List>
                )}
              </Layout>
            </Card>
          </Section>

          <Button
            isFullWidth
            size="medium"
            variant="primary"
            onClick={() => navigate(`/portal/${quote.quote_number}`)}
          >
            View my policy
          </Button>
        </Content>

        <Aside>
          <QuoteCard
            price={monthlyPremium.toFixed(2)}
            total={premium.toFixed(2)}
            name="Your premium"
          >
            <Button
              emphasis="strong"
              onClick={() => {
                alert(
                  `Downloading policy documents for ${quote.quote_number}\n\nDocuments:\n- Policy Declarations PDF\n- Insurance ID Card\n\nIn production, these would be real PDF downloads.`
                );
              }}
              size="xsmall"
              variant="support"
            >
              Download documents
            </Button>

            {coverages.bodily_injury_limit && (
              <List title="Bodily Injury Liability">
                <List.Row>
                  <List.Item>{coverages.bodily_injury_limit}</List.Item>
                </List.Row>
              </List>
            )}

            {coverages.property_damage_limit && (
              <List title="Property Damage Liability">
                <List.Row>
                  <List.Item>${coverages.property_damage_limit.toLocaleString()}</List.Item>
                </List.Row>
              </List>
            )}

            {coverages.collision && (
              <List title="Collision">
                <List.Row>
                  <List.Item>${coverages.collision_deductible} deductible</List.Item>
                </List.Row>
              </List>
            )}

            {coverages.comprehensive && (
              <List title="Comprehensive">
                <List.Row>
                  <List.Item>${coverages.comprehensive_deductible} deductible</List.Item>
                </List.Row>
              </List>
            )}

            {coverages.uninsured_motorist && (
              <List title="Uninsured Motorist">
                <List.Row>
                  <List.Item>Included</List.Item>
                </List.Row>
              </List>
            )}

            <List title="Monthly Premium">
              <List.Row>
                <List.Item>${monthlyPremium.toFixed(2)}</List.Item>
              </List.Row>
            </List>

            <List title="6-Month Total">
              <List.Row>
                <List.Item>${premium.toFixed(2)}</List.Item>
              </List.Row>
            </List>
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
              This is a demo application built for testing purposes. All policy information
              is simulated and not legally binding.
            </Text>
          </>
        </AppFooter>
      </PageFooter>
    </AppTemplate>
  );
}
