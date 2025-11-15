/**
 * Checkout Screen (Screen 13 of 16) - Everest Design
 *
 * Payment method selection and account verification screen.
 *
 * Features:
 * - Personalized headline with user's first name
 * - Toggle customer status question (Yes/No)
 * - Payment plan selection (Pay in Full vs Pay Monthly)
 * - Account verification with badges
 * - Continue to payment screen
 *
 * Flow:
 * 1. Check if email exists in database
 * 2. Show verified badge or prompt account creation
 * 3. User selects payment plan
 * 4. Navigate to Payment screen
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestContainer } from '../../components/everest/layout/EverestContainer';
import { EverestCard } from '../../components/everest/core/EverestCard';
import { EverestTitle } from '../../components/everest/core/EverestTitle';
import { EverestText } from '../../components/everest/core/EverestText';
import { EverestButton } from '../../components/everest/core/EverestButton';
import { EverestBadge } from '../../components/everest/core/EverestBadge';
import { useQuoteByNumber } from '../../hooks/useQuote';
import { checkEmail } from '../../services/user-account-api';
import { AccountCreationModal } from './components/modals/AccountCreationModal';
import { LoginModal } from './components/modals/LoginModal';
import './Checkout.css';

const Checkout: React.FC = () => {
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
  const [isToggleCustomer, setIsToggleCustomer] = useState<boolean | null>(null);
  const [paymentPlan, setPaymentPlan] = useState<'full' | 'monthly'>('monthly');

  // Check email on mount
  useEffect(() => {
    const checkUserEmail = async () => {
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
        }
      } catch (error) {
        console.error('Failed to check email:', error);
        setUserExists(false);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    checkUserEmail();
  }, [quote]);

  const handleAccountCreated = () => {
    setUserExists(true);
    setShowAccountModal(false);
  };

  const handleLoginSuccess = () => {
    setUserExists(true);
    setShowLoginModal(false);
  };

  const handleContinue = () => {
    if (!userExists) {
      alert('Please create an account or log in to continue');
      return;
    }

    if (isToggleCustomer === null) {
      alert('Please indicate if you are already a Toggle customer');
      return;
    }

    navigate(`/quote-v2/payment/${quoteNumber}`);
  };

  // Calculate payment amounts (mock - in production this comes from quote)
  const monthlyAmount = quote?.monthly_premium || 468;
  const fullAmount = monthlyAmount * 6; // 6-month policy

  if (isLoading || isCheckingEmail) {
    return (
      <EverestLayout>
        <EverestContainer>
          <div className="checkout-loading">
            <EverestText variant="body">Loading...</EverestText>
          </div>
        </EverestContainer>
      </EverestLayout>
    );
  }

  // Get user's first name from quote
  const firstName = quote?.driver?.first_name || 'there';

  return (
    <EverestLayout>
      <EverestContainer>
        <EverestCard>
          <div className="checkout-container">
            {/* Header */}
            <div className="checkout-header">
              <EverestTitle variant="h2">{firstName}, let's checkout</EverestTitle>
              <EverestText variant="subtitle">
                Select your payment plan and confirm your account details.
              </EverestText>
            </div>

            {/* Account Status */}
            <div className="checkout-section">
              <EverestText variant="label" className="checkout-section-title">
                Your Account
              </EverestText>

              {userExists ? (
                <div className="checkout-account-verified">
                  <EverestText variant="body">{email}</EverestText>
                  <EverestBadge variant="success">Verified ✓</EverestBadge>
                </div>
              ) : (
                <div className="checkout-account-unverified">
                  <div className="checkout-account-info">
                    <EverestText variant="body">{email}</EverestText>
                    <EverestText variant="small">
                      Create your account or log in to continue
                    </EverestText>
                  </div>
                  <div className="checkout-account-actions">
                    <EverestButton variant="primary" onClick={() => setShowAccountModal(true)}>
                      Create Account
                    </EverestButton>
                    <EverestButton variant="secondary" onClick={() => setShowLoginModal(true)}>
                      Log In
                    </EverestButton>
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Customer Status */}
            <div className="checkout-section">
              <EverestText variant="label" className="checkout-section-title">
                Already a Toggle customer?
              </EverestText>

              <div className="checkout-toggle-options">
                <button
                  className={`checkout-toggle-option ${isToggleCustomer === true ? 'active' : ''}`}
                  onClick={() => setIsToggleCustomer(true)}
                >
                  <EverestText variant="body">Yes</EverestText>
                </button>
                <button
                  className={`checkout-toggle-option ${isToggleCustomer === false ? 'active' : ''}`}
                  onClick={() => setIsToggleCustomer(false)}
                >
                  <EverestText variant="body">No</EverestText>
                </button>
              </div>
            </div>

            {/* Payment Plan Selection */}
            <div className="checkout-section">
              <EverestText variant="label" className="checkout-section-title">
                Choose Your Payment Plan
              </EverestText>

              <div className="checkout-payment-plans">
                {/* Pay Monthly Card */}
                <button
                  className={`checkout-payment-card ${paymentPlan === 'monthly' ? 'active' : ''}`}
                  onClick={() => setPaymentPlan('monthly')}
                >
                  <div className="checkout-payment-header">
                    <input
                      type="radio"
                      checked={paymentPlan === 'monthly'}
                      readOnly
                      className="checkout-payment-radio"
                    />
                    <EverestText variant="body" className="checkout-payment-title">
                      Pay Monthly
                    </EverestText>
                  </div>
                  <div className="checkout-payment-amount">
                    ${monthlyAmount}
                    <span className="checkout-payment-period">/month</span>
                  </div>
                  <EverestText variant="small" className="checkout-payment-description">
                    6 monthly payments of ${monthlyAmount}
                  </EverestText>
                </button>

                {/* Pay in Full Card */}
                <button
                  className={`checkout-payment-card ${paymentPlan === 'full' ? 'active' : ''}`}
                  onClick={() => setPaymentPlan('full')}
                >
                  <div className="checkout-payment-header">
                    <input
                      type="radio"
                      checked={paymentPlan === 'full'}
                      readOnly
                      className="checkout-payment-radio"
                    />
                    <EverestText variant="body" className="checkout-payment-title">
                      Pay in Full
                    </EverestText>
                  </div>
                  <div className="checkout-payment-amount">
                    ${fullAmount}
                    <span className="checkout-payment-period">total</span>
                  </div>
                  <EverestText variant="small" className="checkout-payment-description">
                    One-time payment for 6-month policy
                  </EverestText>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="checkout-actions">
              <EverestButton
                variant="secondary"
                onClick={() => navigate(`/quote-v2/sign/${quoteNumber}`)}
              >
                Go Back
              </EverestButton>

              <EverestButton
                variant="primary"
                onClick={handleContinue}
                disabled={!userExists || isToggleCustomer === null}
              >
                Pay ${paymentPlan === 'monthly' ? monthlyAmount : fullAmount}
                {paymentPlan === 'monthly' ? '/mo' : ''}
              </EverestButton>
            </div>
          </div>
        </EverestCard>
      </EverestContainer>

      {/* Account Creation Modal */}
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
    </EverestLayout>
  );
};

export default Checkout;
