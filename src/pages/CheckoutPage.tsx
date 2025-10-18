import React, { useState } from 'react';
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
  TextInput,
  RadioButton,
  InputGroup,
  Checkbox,
  Link,
  Text,
  QuoteCard,
  List,
  ChevronLeft,
} from '@sureapp/canary-design-system';

// Logo for consistent branding
const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

const CheckoutPage: React.FC = () => {
  // State for form management
  const [billingAddress, setBillingAddress] = useState('same');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Event handlers
  const handleBillingAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBillingAddress(event.target.value);
  };

  const handleTermsAccepted = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(event.target.checked);
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
              breadcrumbs={
                <Button
                  href="/examples/coverage"
                  emphasis="text"
                  startIcon={ChevronLeft}
                >
                  Back
                </Button>
              }
              hasBorder={false}
              hasPadding={false}
              title="Checkout"
              titleSize="title-1"
            />
          </AppTemplate.Title>
          
          <Form
            buttonLabel="Purchase Policy"
            buttonProps={{
              href: "/examples/confirmation",
              disabled: !termsAccepted,
            }}
          >
            <Section title="Card details">
              <Form.Group preset="payment-group">
                <TextInput
                  id="cardholder-name"
                  label="Cardholder's full name"
                  size="small"
                />
                <TextInput 
                  id="card-number" 
                  label="Card number" 
                  size="small"
                  placeholder="1234 5678 9012 3456"
                />
                <TextInput
                  id="expiration-date"
                  label="Expiration date"
                  size="small"
                  placeholder="MM/YY"
                />
                <TextInput 
                  id="cvc" 
                  label="CVC" 
                  size="small"
                  placeholder="123"
                />
              </Form.Group>
              
              <InputGroup label="Billing address">
                <RadioButton
                  label="Same as home address"
                  id="same-billing"
                  name="billing"
                  value="same"
                  checked={billingAddress === 'same'}
                  onChange={handleBillingAddress}
                />
                <RadioButton
                  label="Use a different billing address"
                  name="billing"
                  id="different-billing"
                  value="different"
                  checked={billingAddress === 'different'}
                  onChange={handleBillingAddress}
                />
              </InputGroup>
              
              {billingAddress === 'different' && (
                <Form.Group preset="address-group">
                  <TextInput id="billing-address" label="Address" size="small" />
                  <TextInput
                    id="billing-apt"
                    label="Apartment, unit, suite, etc."
                    size="small"
                  />
                  <TextInput id="billing-city" label="City" size="small" />
                  <TextInput id="billing-state" label="State" size="small" />
                  <TextInput id="billing-zip" label="Zip code" size="small" />
                </Form.Group>
              )}
            </Section>
            
            <Section title="Terms and conditions">
              <Checkbox
                id="terms-agreement"
                name="terms-agreement"
                checked={termsAccepted}
                onChange={handleTermsAccepted}
                label={
                  <span>
                    I acknowledge and agree to the{" "}
                    <Link href="#" size="small">
                      Electronic Communications Consent
                    </Link>
                    , terms and conditions, and the Outline of Coverage.
                  </span>
                }
              />
            </Section>
            
            <Section>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                <Text variant="body-large" weight="bold">
                  Due today:
                </Text>
                <Text variant="body-large" weight="bold">
                  $77.46
                </Text>
              </div>
              <Text variant="caption-small" color="subtle">
                Please sign me up for the insurance plan. I have read, understand
                and agree to the terms and conditions of insurance coverage
                located in the Outline of Coverage and on this enrollment site. I
                authorize the plan administrator to automatically charge my credit
                card monthly for the coverage I select. I understand and agree
                that my payment authorization will remain in effect until I notify
                the Plan Administrator and they have reasonable opportunity to act
                on it. It is my responsibility to ensure my account information is
                current and accurate.
              </Text>
            </Section>
          </Form>
        </Content>
        
        <Aside>
          <QuoteCard price="77.46" total="77.46">
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

export default CheckoutPage; 