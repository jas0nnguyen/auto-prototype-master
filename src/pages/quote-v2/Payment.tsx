/**
 * Payment Screen (Screen 12 of 19) - T136
 *
 * Secure payment form for collecting credit/debit card information.
 *
 * Features:
 * - Cardholder name
 * - Card number with automatic formatting (XXXX XXXX XXXX XXXX)
 * - Expiration date (MM/YY format)
 * - CVV (3-4 digits)
 * - Billing ZIP code
 * - Payment summary box (today's payment, remaining payments, total cost)
 * - Luhn algorithm validation for card numbers
 *
 * Flow:
 * 1. User enters payment details
 * 2. Form validates as user types (card number, expiration, CVV, ZIP)
 * 3. User clicks "Submit Payment"
 * 4. Validates all fields
 * 5. Calls POST /api/v1/payments
 * 6. Navigate to Processing screen
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Layout,
  Container,
  Title,
  Text,
  TextInput,
  Button
} from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { ScreenProgress } from './components/ScreenProgress';
import { QuoteProvider } from './contexts/QuoteContext';
import { useQuoteByNumber } from '../../hooks/useQuote';

/**
 * Luhn algorithm for credit card validation
 */
const validateCardNumber = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Format card number with spaces (XXXX XXXX XXXX XXXX)
 */
const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\s/g, '');
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(' ');
};

/**
 * Validate expiration date (MM/YY format, not expired)
 */
const validateExpiration = (value: string): boolean => {
  if (!/^\d{2}\/\d{2}$/.test(value)) return false;

  const [month, year] = value.split('/').map(Number);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const expiry = new Date(2000 + year, month - 1);
  return expiry > now;
};

const PaymentContent: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const { data: quote, isLoading } = useQuoteByNumber(quoteNumber);

  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiration, setExpiration] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingZip, setBillingZip] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);

    // Validate card number
    if (formatted.replace(/\s/g, '').length >= 13) {
      if (!validateCardNumber(formatted)) {
        setErrors((prev) => ({ ...prev, cardNumber: 'Invalid card number' }));
      } else {
        setErrors((prev) => ({ ...prev, cardNumber: '' }));
      }
    }
  };

  const handleExpirationChange = (value: string) => {
    // Auto-format MM/YY
    let formatted = value.replace(/\D/g, '');
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
    }
    setExpiration(formatted);

    // Validate expiration
    if (formatted.length === 5) {
      if (!validateExpiration(formatted)) {
        setErrors((prev) => ({ ...prev, expiration: 'Invalid or expired date' }));
      } else {
        setErrors((prev) => ({ ...prev, expiration: '' }));
      }
    }
  };

  const handleCvvChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setCvv(digits);

    if (digits.length >= 3 && digits.length <= 4) {
      setErrors((prev) => ({ ...prev, cvv: '' }));
    } else if (digits.length > 0) {
      setErrors((prev) => ({ ...prev, cvv: 'CVV must be 3 or 4 digits' }));
    }
  };

  const handleBillingZipChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 5);
    setBillingZip(digits);

    if (digits.length === 5) {
      setErrors((prev) => ({ ...prev, billingZip: '' }));
    } else if (digits.length > 0) {
      setErrors((prev) => ({ ...prev, billingZip: 'ZIP code must be 5 digits' }));
    }
  };

  const handleSubmit = async () => {
    // Validate all fields
    const newErrors: Record<string, string> = {};

    if (!cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';
    if (!validateCardNumber(cardNumber)) newErrors.cardNumber = 'Invalid card number';
    if (!validateExpiration(expiration)) newErrors.expiration = 'Invalid or expired date';
    if (cvv.length < 3 || cvv.length > 4) newErrors.cvv = 'CVV must be 3 or 4 digits';
    if (billingZip.length !== 5) newErrors.billingZip = 'ZIP code must be 5 digits';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Store payment data in sessionStorage for Processing screen
      sessionStorage.setItem('paymentData', JSON.stringify({
        paymentMethod: 'credit_card',
        cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
        cardExpiry: expiration,
        cardCvv: cvv,
      }));

      // T156: Mock payment processing for demo mode
      // In production, this would call POST /api/v1/payments
      // For now, simulate a 1-2 second payment authorization delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Payment successful - navigate to processing screen
      navigate(`/quote-v2/processing/${quoteNumber}`);
    } catch (error) {
      console.error('Payment processing failed:', error);
      setErrors({ submit: 'Payment processing failed. Please try again.' });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={12} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center">
            <Title variant="title-2">Loading...</Title>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  // Calculate payment summary from quote.premium object
  const totalPremium = quote?.premium?.total || quote?.premium?.sixMonth || 1200;
  const todayPayment = (totalPremium / 6).toFixed(2);
  const remainingPayments = (totalPremium * 5 / 6).toFixed(2);

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={12} totalScreens={19} />
      <Container padding="large">
        <Layout display="flex" gap="large" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Payment Form */}
          <Layout display="flex-column" gap="large" style={{ flex: 2 }}>
            <Title variant="display-2">Payment Details</Title>
            <Text variant="body-regular" color="subtle">
              Enter your payment information to complete your purchase.
            </Text>

            <Layout
              display="flex-column"
              gap="medium"
              padding="large"
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              {/* Cardholder Name */}
              <Layout display="flex-column" gap="small">
                <Text variant="body-regular" style={{ fontWeight: 600 }}>
                  Cardholder Name
                </Text>
                <TextInput
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="John Doe"
                />
                {errors.cardholderName && (
                  <Text variant="body-small" color="error">
                    {errors.cardholderName}
                  </Text>
                )}
              </Layout>

              {/* Card Number */}
              <Layout display="flex-column" gap="small">
                <Text variant="body-regular" style={{ fontWeight: 600 }}>
                  Card Number
                </Text>
                <TextInput
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                {errors.cardNumber && (
                  <Text variant="body-small" color="error">
                    {errors.cardNumber}
                  </Text>
                )}
              </Layout>

              {/* Expiration & CVV */}
              <Layout display="flex" gap="medium">
                <Layout display="flex-column" gap="small" style={{ flex: 1 }}>
                  <Text variant="body-regular" style={{ fontWeight: 600 }}>
                    Expiration Date
                  </Text>
                  <TextInput
                    value={expiration}
                    onChange={(e) => handleExpirationChange(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  {errors.expiration && (
                    <Text variant="body-small" color="error">
                      {errors.expiration}
                    </Text>
                  )}
                </Layout>

                <Layout display="flex-column" gap="small" style={{ flex: 1 }}>
                  <Text variant="body-regular" style={{ fontWeight: 600 }}>
                    CVV
                  </Text>
                  <TextInput
                    value={cvv}
                    onChange={(e) => handleCvvChange(e.target.value)}
                    placeholder="123"
                    type="password"
                    maxLength={4}
                  />
                  {errors.cvv && (
                    <Text variant="body-small" color="error">
                      {errors.cvv}
                    </Text>
                  )}
                </Layout>
              </Layout>

              {/* Billing ZIP */}
              <Layout display="flex-column" gap="small">
                <Text variant="body-regular" style={{ fontWeight: 600 }}>
                  Billing ZIP Code
                </Text>
                <TextInput
                  value={billingZip}
                  onChange={(e) => handleBillingZipChange(e.target.value)}
                  placeholder="12345"
                  maxLength={5}
                />
                {errors.billingZip && (
                  <Text variant="body-small" color="error">
                    {errors.billingZip}
                  </Text>
                )}
              </Layout>
            </Layout>

            {/* Submit Error */}
            {errors.submit && (
              <Layout
                padding="medium"
                style={{
                  backgroundColor: '#fee',
                  borderRadius: '8px',
                  border: '1px solid #fcc',
                }}
              >
                <Text variant="body-regular" color="error">
                  {errors.submit}
                </Text>
              </Layout>
            )}

            {/* Action Buttons */}
            <Layout display="flex" gap="medium" flexJustify="space-between">
              <Button
                variant="secondary"
                onClick={() => navigate(`/quote-v2/checkout/${quoteNumber}`)}
                disabled={isSubmitting}
              >
                Back
              </Button>

              <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Processing Payment...' : 'Submit Payment'}
              </Button>
            </Layout>
          </Layout>

          {/* Payment Summary */}
          <Layout
            display="flex-column"
            gap="medium"
            padding="large"
            style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              height: 'fit-content',
              position: 'sticky',
              top: '120px',
            }}
          >
            <Title variant="title-3">Payment Summary</Title>

            <Layout display="flex-column" gap="small">
              <Layout display="flex" flexJustify="space-between">
                <Text variant="body-regular" color="subtle">
                  Today's Payment
                </Text>
                <Text variant="body-regular" style={{ fontWeight: 600 }}>
                  ${todayPayment}
                </Text>
              </Layout>

              <Layout display="flex" flexJustify="space-between">
                <Text variant="body-regular" color="subtle">
                  5 Remaining Payments
                </Text>
                <Text variant="body-regular" style={{ fontWeight: 600 }}>
                  ${remainingPayments}
                </Text>
              </Layout>

              <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

              <Layout display="flex" flexJustify="space-between">
                <Text variant="body-regular" style={{ fontWeight: 600 }}>
                  Total Cost
                </Text>
                <Text variant="body-regular" style={{ fontWeight: 700, fontSize: '18px' }}>
                  ${totalPremium.toFixed(2)}
                </Text>
              </Layout>
            </Layout>

            <Text variant="body-small" color="subtle">
              Your first payment will be charged today. Subsequent payments will be automatically
              charged monthly.
            </Text>
          </Layout>
        </Layout>
      </Container>
    </TechStartupLayout>
  );
};

export const Payment: React.FC = () => {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  return (
    <QuoteProvider quoteNumber={quoteNumber}>
      <PaymentContent />
    </QuoteProvider>
  );
};
