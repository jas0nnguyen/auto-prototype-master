/**
 * Payment Info Page - Policy Binding Flow
 *
 * Modeled after Canary Design Language checkout pattern.
 * Layout: Left side = payment form, Right side = quote summary card
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuoteByNumber } from '../../hooks/useQuote';
import {
  AppTemplate,
  PageHeader,
  AppHeader,
  Main,
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

export default function PaymentInfo() {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const navigate = useNavigate();

  // Load quote data
  const { data: quote, isLoading, error } = useQuoteByNumber(quoteNumber || '');

  // Form state
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [billingAddress, setBillingAddress] = useState<'same' | 'different'>('same');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Format card number with spaces (1234 5678 9012 3456)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiration date (MM/YY)
  const formatExpirationDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Luhn algorithm validation
  const validateLuhn = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(digits)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    if (!cardholderName.trim()) {
      setValidationError('Cardholder name is required');
      return;
    }

    if (!validateLuhn(cardNumber)) {
      setValidationError('Invalid card number. Use 4242 4242 4242 4242 for testing.');
      return;
    }

    if (!expirationDate.match(/^\d{2}\/\d{2}$/)) {
      setValidationError('Invalid expiration date (MM/YY)');
      return;
    }

    if (!cvc.match(/^\d{3,4}$/)) {
      setValidationError('Invalid CVC (3-4 digits)');
      return;
    }

    if (!termsAccepted) {
      setValidationError('You must accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call bind API
      const response = await fetch('/api/v1/policies/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardExpiry: expirationDate,
          cardCvv: cvc,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Payment failed');
      }

      // Navigate to confirmation page with quote number
      navigate(`/binding/confirmation/${quoteNumber}`);
    } catch (err: any) {
      setValidationError(err.message || 'Payment processing failed');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Text>Loading quote...</Text>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Text color="subtle">Error loading quote. Please try again.</Text>
      </div>
    );
  }

  // Use premium data from API (same logic as QuoteResults page)
  const totalPremium = quote.premium?.total || 0;
  const monthlyPremium = quote.premium?.monthly || Math.round(totalPremium / 6);

  // Type-safe access to coverages
  const coverages = (quote as any).coverages || {};
  const bodilyInjuryLimit = coverages.bodilyInjuryLimit || '100/300';
  const propertyDamageLimit = coverages.propertyDamageLimit || '50,000';
  const collision = coverages.collision;
  const collisionDeductible = coverages.collisionDeductible || 500;
  const comprehensive = coverages.comprehensive;
  const comprehensiveDeductible = coverages.comprehensiveDeductible || 500;

  return (
    <AppTemplate preset="purchase-flow">
      <PageHeader>
        <AppHeader logo={logoSrc} logoHref="/" />
      </PageHeader>

      <Main>
        <Content>
          <AppTemplate.Title>
            <Header
              breadcrumbs={
                <Button
                  onClick={() => navigate(-1)}
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
            buttonLabel={isSubmitting ? 'Processing...' : `Pay $${totalPremium.toFixed(2)}`}
            buttonProps={{
              onClick: handleSubmit,
              disabled: !termsAccepted || isSubmitting,
            }}
          >
            {/* Card Details Section */}
            <Section title="Card details">
              <Form.Group preset="payment-group">
                <TextInput
                  id="cardholder-name"
                  label="Cardholder's full name"
                  size="small"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                />
                <TextInput
                  id="card-number"
                  label="Card number"
                  size="small"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  helpText="Use 4242 4242 4242 4242 for testing"
                />
                <TextInput
                  id="expiration-date"
                  label="Expiration date"
                  size="small"
                  placeholder="MM/YY"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(formatExpirationDate(e.target.value))}
                  maxLength={5}
                />
                <TextInput
                  id="cvc"
                  label="CVC"
                  size="small"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  maxLength={4}
                />
              </Form.Group>

              <InputGroup label="Billing address">
                <RadioButton
                  label="Same as home address"
                  id="same-billing"
                  name="billing"
                  value="same"
                  checked={billingAddress === 'same'}
                  onChange={(e) => setBillingAddress(e.target.value as 'same')}
                />
                <RadioButton
                  label="Use a different billing address"
                  name="billing"
                  id="different-billing"
                  value="different"
                  checked={billingAddress === 'different'}
                  onChange={(e) => setBillingAddress(e.target.value as 'different')}
                />
              </InputGroup>
            </Section>

            {/* Terms and Conditions Section */}
            <Section title="Terms and conditions">
              <Checkbox
                id="terms-agreement"
                name="terms-agreement"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                label={
                  <span>
                    I acknowledge and agree to the{' '}
                    <Link href="#" size="small">
                      Electronic Communications Consent
                    </Link>
                    , terms and conditions, and the Outline of Coverage.
                  </span>
                }
              />
            </Section>

            {/* Validation Error */}
            {validationError && (
              <Section>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '8px',
                  color: '#c00'
                }}>
                  <Text>{validationError}</Text>
                </div>
              </Section>
            )}

            {/* Due Today Summary */}
            <Section>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                <Text variant="body-large" weight="bold">
                  Due today:
                </Text>
                <Text variant="body-large" weight="bold">
                  ${totalPremium.toFixed(2)}
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
          <QuoteCard price={monthlyPremium.toFixed(2)} total={totalPremium.toFixed(2)}>
            <Button emphasis="strong" href="#" size="xsmall" variant="support">
              View sample policy
            </Button>
            <List title="Bodily Injury Liability">
              <List.Row>
                <List.Item>{bodilyInjuryLimit}</List.Item>
              </List.Row>
            </List>
            <List title="Property Damage Liability">
              <List.Row>
                <List.Item>${propertyDamageLimit}</List.Item>
              </List.Row>
            </List>
            {collision && (
              <List title="Collision">
                <List.Row>
                  <List.Item>${collisionDeductible} deductible</List.Item>
                </List.Row>
              </List>
            )}
            {comprehensive && (
              <List title="Comprehensive">
                <List.Row>
                  <List.Item>${comprehensiveDeductible} deductible</List.Item>
                </List.Row>
              </List>
            )}
            <List title="Monthly Premium">
              <List.Row>
                <List.Item>${monthlyPremium.toFixed(2)}</List.Item>
              </List.Row>
            </List>
          </QuoteCard>
        </Aside>
      </Main>
    </AppTemplate>
  );
}
