/**
 * AccountCreationModal Component - T142
 *
 * Modal for creating a new user account during checkout.
 * Triggered when email is not found in database.
 *
 * Features:
 * - Email field (readonly, prefilled from quote)
 * - Password field (type="password", min 8 chars)
 * - Password confirmation with matching validation
 * - First name and last name fields
 * - "Create Account" button calls POST /api/v1/user-accounts
 * - FocusLock to trap focus
 * - ARIA labels for accessibility
 * - Cannot be closed without creating account (no ESC, no backdrop click)
 *
 * Usage:
 * ```tsx
 * <AccountCreationModal
 *   isOpen={showModal}
 *   email={quote.email}
 *   onSuccess={(userId) => handleAccountCreated(userId)}
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
import { createAccount } from '../../../../services/user-account-api';

interface AccountCreationModalProps {
  isOpen: boolean;
  email: string;
  onSuccess: (userId: string) => void;
}

export const AccountCreationModal: React.FC<AccountCreationModalProps> = ({
  isOpen,
  email,
  onSuccess,
}) => {
  const [localEmail, setLocalEmail] = useState(email || '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call POST /api/v1/user-accounts (T152)
      const response = await createAccount({
        email: localEmail,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      onSuccess(response.data.user_account_id);
    } catch (error: any) {
      console.error('Failed to create account:', error);
      setErrors({ submit: error.message || 'Failed to create account. Please try again.' });
    } finally {
      setIsSubmitting(false);
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
      aria-labelledby="account-creation-modal-title"
    >
      <FocusLock>
        <div
          className="tech-startup-modal-content"
          style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <Title variant="title-3" id="account-creation-modal-title" style={{ marginBottom: '8px' }}>
            Create Your Account
          </Title>

          <Text variant="body-regular" color="subtle" style={{ marginBottom: '24px' }}>
            Create an account to access your policy online and manage your coverage.
          </Text>

          <Layout display="flex-column" gap="medium">
            {/* Email */}
            <Layout display="flex-column" gap="small">
              <Text variant="body-regular" style={{ fontWeight: 600 }}>
                Email Address
              </Text>
              <TextInput
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                readOnly={!!email}
                style={email ? { backgroundColor: '#f7fafc', cursor: 'not-allowed' } : {}}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <Text variant="body-small" color="error">
                  {errors.email}
                </Text>
              )}
            </Layout>

            {/* First Name */}
            <Layout display="flex-column" gap="small">
              <Text variant="body-regular" style={{ fontWeight: 600 }}>
                First Name
              </Text>
              <TextInput
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
              {errors.firstName && (
                <Text variant="body-small" color="error">
                  {errors.firstName}
                </Text>
              )}
            </Layout>

            {/* Last Name */}
            <Layout display="flex-column" gap="small">
              <Text variant="body-regular" style={{ fontWeight: 600 }}>
                Last Name
              </Text>
              <TextInput
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
              {errors.lastName && (
                <Text variant="body-small" color="error">
                  {errors.lastName}
                </Text>
              )}
            </Layout>

            {/* Password */}
            <Layout display="flex-column" gap="small">
              <Text variant="body-regular" style={{ fontWeight: 600 }}>
                Password
              </Text>
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
              {errors.password && (
                <Text variant="body-small" color="error">
                  {errors.password}
                </Text>
              )}
            </Layout>

            {/* Password Confirmation */}
            <Layout display="flex-column" gap="small">
              <Text variant="body-regular" style={{ fontWeight: 600 }}>
                Confirm Password
              </Text>
              <TextInput
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Re-enter your password"
              />
              {errors.passwordConfirm && (
                <Text variant="body-small" color="error">
                  {errors.passwordConfirm}
                </Text>
              )}
            </Layout>

            {/* Submit Error */}
            {errors.submit && (
              <Text variant="body-regular" color="error">
                {errors.submit}
              </Text>
            )}

            {/* Create Account Button */}
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ marginTop: '8px' }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Layout>
        </div>
      </FocusLock>
    </div>
  );
};
