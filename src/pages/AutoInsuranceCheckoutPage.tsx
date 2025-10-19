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

const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

const AutoInsuranceCheckoutPage: React.FC = () => {
  const [billingAddress, setBillingAddress] = useState('same');
  const [termsAccepted, setTermsAccepted] = useState(false);

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
          logoHref="/auto-insurance/landing"
        />
      </PageHeader>

      <Main>
        <Content>
          <AppTemplate.Title>
            <Header
              breadcrumbs={
                <Button
                  href="/auto-insurance/coverage"
                  emphasis="text"
                  startIcon={ChevronLeft}
                >
                  Back
                </Button>
              }
              hasBorder={false}
              hasPadding={false}
              title="Complete Your Purchase"
              titleSize="title-1"
            />
          </AppTemplate.Title>

          <Form
            buttonLabel="Purchase Policy"
            buttonProps={{
              href: "/auto-insurance/confirmation",
              disabled: !termsAccepted,
            }}
          >
            <Section title="Payment Information">
              <Form.Group preset="payment-group">
                <TextInput
                  id="cardholder-name"
                  label="Cardholder's full name"
                  size="small"
                  placeholder="John Smith"
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

            <Section title="Terms and Conditions">
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
                    , auto insurance policy terms and conditions, and the coverage summary.
                    I authorize the initial payment and understand coverage begins on the
                    selected effective date.
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
                  $175.00
                </Text>
              </div>
              <Text variant="caption-small" color="subtle">
                By clicking "Purchase Policy" below, I authorize AutoProtect Insurance to charge
                my payment method for the first month's premium. I understand that my auto insurance
                policy will begin on the coverage start date I selected and will automatically renew
                monthly unless I cancel. I can cancel at any time through my online account or by
                contacting customer service. I have reviewed my coverage selections and confirm
                the information provided is accurate.
              </Text>
            </Section>
          </Form>
        </Content>

        <Aside>
          <QuoteCard price="175.00" total="1050.00">
            <Button emphasis="strong" href="#" size="xsmall" variant="support">
              View sample policy
            </Button>
            <List title="Coverage Summary">
              <List.Row>
                <List.Item>2023 Toyota Camry</List.Item>
              </List.Row>
            </List>
            <List title="Liability">
              <List.Row>
                <List.Item>Bodily Injury: $100k/$300k</List.Item>
              </List.Row>
              <List.Row>
                <List.Item>Property Damage: $50k</List.Item>
              </List.Row>
            </List>
            <List title="Collision">
              <List.Row>
                <List.Item>$500 deductible</List.Item>
              </List.Row>
            </List>
            <List title="Comprehensive">
              <List.Row>
                <List.Item>$500 deductible</List.Item>
              </List.Row>
            </List>
            <List title="Uninsured Motorist">
              <List.Row>
                <List.Item>$50k/$100k</List.Item>
              </List.Row>
            </List>
            <List title="Payment Schedule">
              <List.Row>
                <List.Item>Monthly: $175.00</List.Item>
              </List.Row>
              <List.Row>
                <List.Item>6-month total: $1,050.00</List.Item>
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
              Your payment information is encrypted and secure. We never store your full credit
              card number. All transactions are processed through our secure payment partner.
            </Text>
            <Text variant="caption-small">
              Coverage begins on the effective date you selected. You'll receive your policy
              documents and digital insurance cards via email immediately after purchase.
            </Text>
          </>
        </AppFooter>
      </PageFooter>
    </AppTemplate>
  );
};

export default AutoInsuranceCheckoutPage;
