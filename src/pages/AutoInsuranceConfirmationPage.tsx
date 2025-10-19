import React from 'react';
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
  PaymentBadge,
  Button,
  Text,
  Link,
  QuoteCard,
  Visa,
} from '@sureapp/canary-design-system';

const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

const AutoInsuranceConfirmationPage: React.FC = () => {
  const policyData = {
    policyNumber: 'AUTO-2024-789456',
    effectiveDate: '10/20/2024',
    expirationDate: '04/20/2025',
    policyholder: 'John Smith',
    email: 'john.smith@example.com',
    cardLastFour: '3456',
    vehicle: '2023 Toyota Camry',
    vin: 'VIN: 4T1B11HK7JU123456',
  };

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
              hasBorder={false}
              hasPadding={false}
              title={`You're all set, ${policyData.policyholder.split(' ')[0]}!`}
              titleSize="title-1"
            />
          </AppTemplate.Title>

          <Section
            title={`Policy #${policyData.policyNumber} is effective ${policyData.effectiveDate}`}
            supportText={`Your policy documents and digital ID cards have been sent to ${policyData.email}.`}
          >
            <Card padding="medium">
              <Layout grid="1-1">
                <List title="Policyholder">
                  <List.Row>
                    <List.Item>{policyData.policyholder}</List.Item>
                  </List.Row>
                  <List.Row>
                    <List.Item>{policyData.email}</List.Item>
                  </List.Row>
                </List>

                <List title="Vehicle Covered">
                  <List.Row>
                    <List.Item>{policyData.vehicle}</List.Item>
                  </List.Row>
                  <List.Row>
                    <List.Item>{policyData.vin}</List.Item>
                  </List.Row>
                </List>

                <List title="Policy Period">
                  <List.Row>
                    <List.Item>Effective: {policyData.effectiveDate}</List.Item>
                  </List.Row>
                  <List.Row>
                    <List.Item>Expires: {policyData.expirationDate}</List.Item>
                  </List.Row>
                </List>

                <List title="Payment Method">
                  <List.Row>
                    <List.Item>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PaymentBadge svgString={Visa} size="small" />
                        <Text variant="body-regular">Ending in {policyData.cardLastFour}</Text>
                      </div>
                    </List.Item>
                  </List.Row>
                  <List.Row>
                    <List.Item>Monthly automatic payments</List.Item>
                  </List.Row>
                </List>
              </Layout>
            </Card>
          </Section>

          <Section title="What's Next?">
            <Card padding="medium" background="1">
              <Layout display="flex-column" gap="medium">
                <div>
                  <Text variant="body-regular" weight="bold" style={{ marginBottom: '0.5rem' }}>
                    📧 Check Your Email
                  </Text>
                  <Text variant="body-small" color="subtle">
                    We've sent your policy documents, digital ID cards, and welcome guide to your email.
                    Save your ID cards to your phone for easy access.
                  </Text>
                </div>

                <div>
                  <Text variant="body-regular" weight="bold" style={{ marginBottom: '0.5rem' }}>
                    🚗 Your Coverage Starts {policyData.effectiveDate}
                  </Text>
                  <Text variant="body-small" color="subtle">
                    You're covered! Keep your digital ID cards handy when driving. If you need proof
                    of insurance before your effective date, we can provide that.
                  </Text>
                </div>

                <div>
                  <Text variant="body-regular" weight="bold" style={{ marginBottom: '0.5rem' }}>
                    💳 First Payment Processed
                  </Text>
                  <Text variant="body-small" color="subtle">
                    Your first month's premium of $175.00 has been charged. Future payments will be
                    automatically charged monthly on the 20th.
                  </Text>
                </div>

                <div>
                  <Text variant="body-regular" weight="bold" style={{ marginBottom: '0.5rem' }}>
                    📱 Manage Your Policy Online
                  </Text>
                  <Text variant="body-small" color="subtle">
                    Access your account 24/7 to update coverage, add vehicles or drivers, make
                    payments, or file a claim.
                  </Text>
                </div>
              </Layout>
            </Card>
          </Section>

          <Layout display="flex" gap="small">
            <Button isFullWidth size="medium" variant="primary">
              View My Policy
            </Button>
            <Button isFullWidth size="medium" variant="support">
              Download ID Cards
            </Button>
          </Layout>
        </Content>

        <Aside>
          <QuoteCard price="175.00" total="1050.00" name="Your Premium">
            <List title="Coverage Details">
              <List.Row>
                <List.Item>Bodily Injury: $100k/$300k</List.Item>
              </List.Row>
              <List.Row>
                <List.Item>Property Damage: $50k</List.Item>
              </List.Row>
              <List.Row>
                <List.Item>Collision: $500 deductible</List.Item>
              </List.Row>
              <List.Row>
                <List.Item>Comprehensive: $500 deductible</List.Item>
              </List.Row>
              <List.Row>
                <List.Item>Uninsured Motorist: $50k/$100k</List.Item>
              </List.Row>
            </List>

            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
              <Text variant="caption-small" color="subtle" align="center">
                Need help? Our support team is available 24/7 at 1-800-555-AUTO or support@autoprotect.com
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
              <Link href="/" size="xsmall">
                Privacy Policy
              </Link>
              <Link href="/" size="xsmall">
                Terms of Use
              </Link>
              <Link href="/" size="xsmall">
                Contact Us
              </Link>
            </>
          }
        >
          <>
            <Text variant="caption-small">
              Thank you for choosing AutoProtect Insurance Services, LLC. Your auto insurance
              policy is now active. Coverage subject to policy terms, conditions, and exclusions.
            </Text>
            <Text variant="caption-small">
              Remember to keep your digital insurance ID cards accessible while driving. You can
              always access your policy documents and ID cards through your online account.
            </Text>
          </>
        </AppFooter>
      </PageFooter>
    </AppTemplate>
  );
};

export default AutoInsuranceConfirmationPage;
