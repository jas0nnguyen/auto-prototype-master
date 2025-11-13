/**
 * LoginModal Component
 *
 * Modal for logging in existing users during checkout.
 *
 * Features:
 * - Email field (readonly, prefilled from quote)
 * - Password field (type="password")
 * - "Log In" button (calls authentication service)
 * - FocusLock to trap focus
 * - ARIA labels for accessibility
 * - Can be closed with ESC or backdrop click
 * - "Forgot Password?" link (optional future enhancement)
 *
 * Usage:
 * ```tsx
 * <LoginModal
 *   isOpen={showModal}
 *   email={quote.driver.email}
 *   onSuccess={() => handleLoginSuccess()}
 *   onClose={() => setShowLoginModal(false)}
 * />
 * ```
 */

import React, { useState } from 'react';
import FocusLock from 'react-focus-lock';
import {
  Layout,
  Title,
  Text,
  TextInput,
  Button
} from '@sureapp/canary-design-system';

interface LoginModalProps {
  isOpen: boolean;
  email: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  email,
  onSuccess,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // TODO: Replace with actual authentication API call
      // For now, simulate successful login
      await new Promise(resolve => setTimeout(resolve, 500));

      // In production, this would be:
      // const response = await loginUser({ email, password });
      // if (response.success) onSuccess();

      onSuccess();
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <div
      className="tech-startup-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <FocusLock>
        <div
          className="tech-startup-modal-content"
          style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <Title variant="title-3" id="login-modal-title" style={{ marginBottom: '8px' }}>
            Log In to Your Account
          </Title>

          <Text variant="body-regular" color="subtle" style={{ marginBottom: '24px' }}>
            Enter your password to access your policy.
          </Text>

          <Layout display="flex-column" gap="medium">
            {/* Email (readonly) */}
            <Layout display="flex-column" gap="small">
              <Text variant="body-regular" style={{ fontWeight: 600 }}>
                Email Address
              </Text>
              <TextInput
                id="login-email"
                value={email}
                readOnly
                style={{ backgroundColor: '#f7fafc', cursor: 'not-allowed' }}
              />
            </Layout>

            {/* Password */}
            <Layout display="flex-column" gap="small">
              <Text variant="body-regular" style={{ fontWeight: 600 }}>
                Password
              </Text>
              <TextInput
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSubmitting) {
                    handleSubmit();
                  }
                }}
              />
            </Layout>

            {/* Error Message */}
            {error && (
              <Text variant="body-small" style={{ color: '#ef4444' }}>
                {error}
              </Text>
            )}

            {/* Action Buttons */}
            <Layout display="flex" gap="medium" flexJustify="space-between" style={{ marginTop: '8px' }}>
              <Button
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </Button>
            </Layout>

            {/* Forgot Password Link (future enhancement) */}
            <Text variant="body-small" color="subtle" style={{ textAlign: 'center' }}>
              Forgot your password? Contact support for assistance.
            </Text>
          </Layout>
        </div>
      </FocusLock>
    </div>
  );
};
