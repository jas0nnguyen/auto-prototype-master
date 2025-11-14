/**
 * Checkout Screen (Screen 11 of 19) - T135
 *
 * Payment method selection and account verification screen.
 *
 * Features:
 * - Check email via POST /api/v1/user-accounts/check-email
 * - Existing user shows email + "Verified" badge
 * - New user triggers AccountCreationModal
 * - Payment method selection (Credit Card only per spec clarification)
 * - "Enter Payment Details" button (disabled until account verified)
 *
 * Flow:
 * 1. On mount, check if email exists in database
 * 2. If existing user: show verified badge, enable continue button
 * 3. If new user: show AccountCreationModal, cannot proceed until account created
 * 4. User selects payment method (credit card)
 * 5. Navigate to Payment screen
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Layout,
  Container,
  Title,
  Text,
  Button,
  Badge
} from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { ScreenProgress } from './components/ScreenProgress';
import { QuoteProvider } from './contexts/QuoteContext';
import { useQuoteByNumber } from '../../hooks/useQuote';
import { checkEmail } from '../../services/user-account-api';
import { AccountCreationModal } from './components/modals/AccountCreationModal';
import { LoginModal } from './components/modals/LoginModal';

const CheckoutContent: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const { data: quote, isLoading } = useQuoteByNumber(quoteNumber) as {
    data: any;
    isLoading: boolean;
  };

  const [userExists, setUserExists] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Check email on mount (T149)
  useEffect(() => {
    const checkUserEmail = async () => {
      // Get email from driver data (not quote_snapshot which doesn't exist in this structure)
      const driverEmail = quote?.driver?.email;

      if (!driverEmail) return;

      setEmail(driverEmail);
      setIsCheckingEmail(true);

      try {
        const result = await checkEmail(driverEmail);

        if (result.exists) {
          setUserExists(true);
        } else {
          setUserExists(false);
          // Don't auto-open modal anymore - let user choose create or login
        }
      } catch (error) {
        console.error('Failed to check email:', error);
        // On error, assume new user
        setUserExists(false);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    checkUserEmail();
  }, [quote]);

  const handleAccountCreated = () => {
    // Account created successfully (T152)
    setUserExists(true);
    setShowAccountModal(false);
  };

  const handleLoginSuccess = () => {
    // Login successful
    setUserExists(true);
    setShowLoginModal(false);
  };

  const handleContinue = () => {
    if (!userExists) {
      alert('Please create an account or log in to continue');
      return;
    }

    navigate(`/quote-v2/payment/${quoteNumber}`);
  };

  if (isLoading || isCheckingEmail) {
    return (
      <TechStartupLayout>
        <ScreenProgress currentScreen={11} totalScreens={19} />
        <Container padding="large">
          <Layout display="flex-column" gap="large" flexAlign="center">
            <Title variant="title-2">Loading...</Title>
          </Layout>
        </Container>
      </TechStartupLayout>
    );
  }

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={11} totalScreens={19} />
      <Container padding="large">
        <Layout display="flex-column" gap="large" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title variant="display-2">Checkout</Title>
          <Text variant="body-regular" color="subtle">
            Review your account and select your payment method.
          </Text>

          {/* Account Status */}
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
            <Title variant="title-3">Your Account</Title>

            {userExists ? (
              <Layout display="flex" flexAlign="center" gap="medium">
                <Text variant="body-regular">{email}</Text>
                <Badge>Verified ✓</Badge>
              </Layout>
            ) : (
              <Layout display="flex-column" gap="medium">
                <Layout display="flex-column" gap="small">
                  <Text variant="body-regular">{email}</Text>
                  <Text variant="body-small" color="subtle">
                    Create your account or log in to continue
                  </Text>
                </Layout>
                <Layout display="flex" gap="medium">
                  <Button variant="primary" onClick={() => setShowAccountModal(true)}>
                    Create Account
                  </Button>
                  <Button onClick={() => setShowLoginModal(true)}>
                    Log In
                  </Button>
                </Layout>
              </Layout>
            )}
          </Layout>

          {/* Payment Method Selection */}
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
            <Title variant="title-3">Payment Method</Title>

            <Layout
              display="flex"
              flexAlign="center"
              gap="medium"
              padding="medium"
              style={{
                border: '2px solid #667eea',
                borderRadius: '12px',
                backgroundColor: '#f7fafc',
              }}
            >
              <input
                type="radio"
                name="payment-method"
                value="credit-card"
                checked={true}
                readOnly
                style={{ width: '20px', height: '20px', accentColor: '#667eea' }}
              />
              <Layout display="flex-column" gap="none">
                <Text variant="body-regular" style={{ fontWeight: 600 }}>
                  Credit or Debit Card
                </Text>
                <Text variant="body-small" color="subtle">
                  Visa, Mastercard, American Express, Discover
                </Text>
              </Layout>
            </Layout>

            <Text variant="body-small" color="subtle">
              Bank account payment coming soon
            </Text>
          </Layout>

          {/* Action Buttons */}
          <Layout display="flex" gap="medium" flexJustify="space-between">
            <Button variant="secondary" onClick={() => navigate(`/quote-v2/sign/${quoteNumber}`)}>
              Back
            </Button>

            <Button variant="primary" onClick={handleContinue} disabled={!userExists}>
              Enter Payment Details
            </Button>
          </Layout>
        </Layout>
      </Container>

      {/* Account Creation Modal (T150, T151, T152) */}
      {showAccountModal && (
        <AccountCreationModal
          isOpen={showAccountModal}
          email={email}
          onSuccess={handleAccountCreated}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          email={email}
          onSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </TechStartupLayout>
  );
};

export const Checkout: React.FC = () => {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  return (
    <QuoteProvider quoteNumber={quoteNumber}>
      <CheckoutContent />
    </QuoteProvider>
  );
};
