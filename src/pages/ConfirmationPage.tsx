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

// Logo for consistent branding
const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

const ConfirmationPage: React.FC = () => {
  // Sample data for the confirmation page
  const policyData = {
    policyNumber: 'ABC12345',
    effectiveDate: '07/01/2024',
    policyholder: 'John Appleseed',
    email: 'john@example.com',
    cardLastFour: '4242',
    additionalInsureds: [
      { name: 'Jane Appleseed', relationship: 'Spouse/Domestic Partner' },
      { name: 'Jack Appleseed', relationship: 'Child dependent' },
      { name: 'Jill Appleseed', relationship: 'Child dependent' },
    ]
  };

  return (
    <AppTemplate preset="purchase-flow">
      <PageHeader>
        <AppHeader 
          logo={logoSrc}
          logoHref="/examples/landing-page"
        />
      </PageHeader>
      
      <Main>
        <Content>
          <AppTemplate.Title>
            <Header
              hasBorder={false}
              hasPadding={false}
              title={`You're all set, ${policyData.policyholder.split(' ')[0]}`}
              titleSize="title-1"
            />
          </AppTemplate.Title>
          
          <Section
            title={`Policy #${policyData.policyNumber} is effective ${policyData.effectiveDate}`}
            supportText={`Your policy details have been sent to ${policyData.email}.`}
          >
            <Card padding="medium">
              <Layout grid="1-1">
                <List title="Policyholder information">
                  <List.Row>
                    <List.Item>{policyData.policyholder}</List.Item>
                  </List.Row>
                </List>
                
                <List title="Billing Details">
                  <List.Row>
                    <List.Item>
                                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <PaymentBadge svgString={Visa} size="small" />
                         <Text variant="body-regular">Ending in {policyData.cardLastFour}</Text>
                       </div>
                    </List.Item>
                  </List.Row>
                </List>
                
                <List title="Additional Insureds">
                  {policyData.additionalInsureds.map((insured, index) => (
                    <List.Row key={index}>
                      <List.Item>
                        {insured.name}, {insured.relationship}
                      </List.Item>
                    </List.Row>
                  ))}
                </List>
              </Layout>
            </Card>
          </Section>
          
          <Button isFullWidth size="medium" variant="primary">
            View my policy
          </Button>
        </Content>
        
        <Aside>
          <QuoteCard price="77.46" total="77.46" name="Your price">
            <Button emphasis="strong" href="#" size="xsmall" variant="support">
              View sample policy
            </Button>
            <List title="Individual AD&D">
              <List.Row>
                <List.Item>$100,000 limit</List.Item>
              </List.Row>
            </List>
            <List title="Additional Medical Expense">
              <List.Row>
                <List.Item>$5,000 limit</List.Item>
              </List.Row>
              <List.Row>
                <List.Item>$0 deductible</List.Item>
              </List.Row>
              <List.Row>
                <List.Item>0% coinsurance</List.Item>
              </List.Row>
            </List>
            <List title="Critical Illness">
              <List.Row>
                <List.Item>$7,500 limit</List.Item>
              </List.Row>
            </List>
            <List title="Monthly Premium">
              <List.Row>
                <List.Item>$9.35</List.Item>
              </List.Row>
            </List>
            <List title="Setup Fee">
              <List.Row>
                <List.Item>$68.11</List.Item>
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
              The sale of insurance products on this website is offered through
              Sure HIIS Insurance Services, LLC ("Sure"), a licensed insurance
              producer. All descriptions or illustrations of coverage are
              provided for general informational purposes only and do not in any
              way alter or amend the terms, conditions, or exclusions of any
              insurance policy. Sure is compensated by Chubb for its services.
            </Text>
            <Text variant="caption-small">
              Chubb is the marketing name used to refer to subsidiaries of Chubb
              Limited providing insurance and related services. For a list of
              these subsidiaries, please visit our website at www.chubb.com.
              Insurance provided by either ACE American Insurance Company or
              Federal Insurance Company and its U.S.-based Chubb underwriting
              company affiliates. All products may not be available in all
              states. This communication contains product summaries only.
              Coverage is subject to the language of the policies as actually
              issued. Surplus lines insurance sold only through licensed surplus
              lines producers. Chubb, 202 Hall's Mill Road, Whitehouse Station,
              NJ 08889-1600.
            </Text>
          </>
        </AppFooter>
      </PageFooter>
    </AppTemplate>
  );
};

export default ConfirmationPage; 