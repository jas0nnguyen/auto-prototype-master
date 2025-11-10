import React from 'react';
import FocusLock from 'react-focus-lock';
import {
  Layout,
  Title,
  Text,
  Button
} from '@sureapp/canary-design-system';

/**
 * ValidationModal
 *
 * Displays alert when required fields are missing.
 * Shows list of missing fields and "Review & Complete" button to return to Summary screen.
 */

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: ValidationError[];
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  errors,
}) => {
  if (!isOpen || errors.length === 0) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FocusLock>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
          }}
        >
          <Layout display="flex-column" gap="large">
            <Layout display="flex-column" gap="small" flexAlign="center">
              <div style={{ fontSize: '48px' }}>⚠️</div>
              <Title variant="title-2" align="center">
                Required Information Missing
              </Title>
              <Text variant="body-regular" align="center" color="subtle">
                Please complete the following required fields:
              </Text>
            </Layout>

            <Layout
              display="flex-column"
              gap="small"
              padding="medium"
              style={{
                background: '#fef2f2',
                borderRadius: '12px',
                border: '1px solid #fecaca',
              }}
            >
              {errors.map((error, index) => (
                <Layout key={index} display="flex" gap="small">
                  <Text variant="body-regular" style={{ color: '#dc2626' }}>
                    •
                  </Text>
                  <Text variant="body-regular" style={{ color: '#dc2626' }}>
                    {error.field}: {error.message}
                  </Text>
                </Layout>
              ))}
            </Layout>

            <Button
              variant="primary"
              size="large"
              onClick={onClose}
              style={{ width: '100%' }}
            >
              Review & Complete
            </Button>
          </Layout>
        </div>
      </FocusLock>
    </div>
  );
};
