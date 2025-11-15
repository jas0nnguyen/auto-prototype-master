/**
 * Payment Screen (Screen 14 of 16) - Everest Design
 *
 * Secure payment form for collecting credit/debit card information.
 *
 * Features:
 * - Everest-styled payment form
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
 * 5. Stores payment data in sessionStorage
 * 6. Navigate to Processing screen
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestCard } from '../../components/everest/core/EverestCard';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestButton } from '../../components/everest/core/EverestButton';
import { EverestTextInput } from '../../components/everest/core/EverestTextInput';
import { useQuoteByNumber } from '../../hooks/useQuote';
import './Payment.css';

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

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const { data: quote, isLoading } = useQuoteByNumber(quoteNumber) as {
    data: any;
    isLoading: boolean;
  };

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
      sessionStorage.setItem(
        'paymentData',
        JSON.stringify({
          paymentMethod: 'credit_card',
          cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
          cardExpiry: expiration,
          cardCvv: cvv,
        })
      );

      // Mock payment processing for demo mode
      // In production, this would call POST /api/v1/payments
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
      <EverestLayout>
        <EverestContainer>
          <div className="payment-loading">
            <EverestText variant="body">Loading...</EverestText>
          </div>
        </EverestContainer>
      </EverestLayout>
    );
  }

  // Calculate payment summary from quote.premium object
  const totalPremium = quote?.premium?.total || quote?.premium?.sixMonth || 1200;
  const todayPayment = (totalPremium / 6).toFixed(2);
  const remainingPayments = (totalPremium * 5 / 6).toFixed(2);

  return (
    <EverestLayout>
      <EverestContainer>
        <div className="payment-layout">
          {/* Payment Form */}
          <EverestCard className="payment-form-card">
            <div className="payment-container">
              {/* Header */}
              <div className="payment-header">
                <EverestTitle variant="h2">Payment Details</EverestTitle>
                <EverestText variant="subtitle">
                  Enter your payment information to complete your purchase.
                </EverestText>
              </div>

              {/* Payment Form Fields */}
              <div className="payment-fields">
                {/* Cardholder Name */}
                <div className="payment-field">
                  <EverestText variant="label" className="payment-label">
                    Cardholder Name
                  </EverestText>
                  <EverestTextInput
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="John Doe"
                  />
                  {errors.cardholderName && (
                    <EverestText variant="small" className="payment-error">
                      {errors.cardholderName}
                    </EverestText>
                  )}
                </div>

                {/* Card Number */}
                <div className="payment-field">
                  <EverestText variant="label" className="payment-label">
                    Card Number
                  </EverestText>
                  <EverestTextInput
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  {errors.cardNumber && (
                    <EverestText variant="small" className="payment-error">
                      {errors.cardNumber}
                    </EverestText>
                  )}
                </div>

                {/* Expiration & CVV */}
                <div className="payment-field-row">
                  <div className="payment-field">
                    <EverestText variant="label" className="payment-label">
                      Expiration Date
                    </EverestText>
                    <EverestTextInput
                      value={expiration}
                      onChange={(e) => handleExpirationChange(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {errors.expiration && (
                      <EverestText variant="small" className="payment-error">
                        {errors.expiration}
                      </EverestText>
                    )}
                  </div>

                  <div className="payment-field">
                    <EverestText variant="label" className="payment-label">
                      CVV
                    </EverestText>
                    <EverestTextInput
                      value={cvv}
                      onChange={(e) => handleCvvChange(e.target.value)}
                      placeholder="123"
                      type="password"
                      maxLength={4}
                    />
                    {errors.cvv && (
                      <EverestText variant="small" className="payment-error">
                        {errors.cvv}
                      </EverestText>
                    )}
                  </div>
                </div>

                {/* Billing ZIP */}
                <div className="payment-field">
                  <EverestText variant="label" className="payment-label">
                    Billing ZIP Code
                  </EverestText>
                  <EverestTextInput
                    value={billingZip}
                    onChange={(e) => handleBillingZipChange(e.target.value)}
                    placeholder="12345"
                    maxLength={5}
                  />
                  {errors.billingZip && (
                    <EverestText variant="small" className="payment-error">
                      {errors.billingZip}
                    </EverestText>
                  )}
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="payment-submit-error">
                  <EverestText variant="body" className="payment-error">
                    {errors.submit}
                  </EverestText>
                </div>
              )}

              {/* Action Buttons */}
              <div className="payment-actions">
                <EverestButton
                  variant="secondary"
                  onClick={() => navigate(`/quote-v2/checkout/${quoteNumber}`)}
                  disabled={isSubmitting}
                >
                  Back
                </EverestButton>

                <EverestButton variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Processing Payment...' : 'Submit Payment'}
                </EverestButton>
              </div>
            </div>
          </EverestCard>

          {/* Payment Summary Sidebar */}
          <EverestCard className="payment-summary-card">
            <div className="payment-summary">
              <EverestTitle variant="h3">Payment Summary</EverestTitle>

              <div className="payment-summary-items">
                <div className="payment-summary-row">
                  <EverestText variant="body">Today's Payment</EverestText>
                  <EverestText variant="body" className="payment-summary-amount">
                    ${todayPayment}
                  </EverestText>
                </div>

                <div className="payment-summary-row">
                  <EverestText variant="body">5 Remaining Payments</EverestText>
                  <EverestText variant="body" className="payment-summary-amount">
                    ${remainingPayments}
                  </EverestText>
                </div>

                <div className="payment-summary-divider" />

                <div className="payment-summary-row">
                  <EverestText variant="body" className="payment-summary-total-label">
                    Total Cost
                  </EverestText>
                  <EverestText variant="body" className="payment-summary-total">
                    ${totalPremium.toFixed(2)}
                  </EverestText>
                </div>
              </div>

              <EverestText variant="small" className="payment-summary-note">
                Your first payment will be charged today. Subsequent payments will be automatically
                charged monthly.
              </EverestText>
            </div>
          </EverestCard>
        </div>
      </EverestContainer>
    </EverestLayout>
  );
};

export default Payment;
