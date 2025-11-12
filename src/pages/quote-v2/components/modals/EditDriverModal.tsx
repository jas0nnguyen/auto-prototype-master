import React, { useState, useEffect } from 'react';
import FocusLock from 'react-focus-lock';
import {
  Layout,
  Title,
  TextInput,
  Select,
  Button
} from '@sureapp/canary-design-system';

/**
 * EditDriverModal
 *
 * Modal for editing driver information.
 * Fields: first_name, last_name, birth_date, gender_code, marital_status_code,
 * license_number, license_state, license_date, relationship_type (for additional drivers)
 */

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  genderCode?: string;
  maritalStatus?: string;
  licenseNumber?: string;
  licenseState?: string;
  licenseDate?: string;
  relationshipType?: string;
}

interface EditDriverModalProps {
  driver: Driver;
  isPrimary?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (driver: Driver) => void;
}

const US_STATES = [
  { label: 'AL', value: 'AL' },
  { label: 'AK', value: 'AK' },
  { label: 'AZ', value: 'AZ' },
  { label: 'AR', value: 'AR' },
  { label: 'CA', value: 'CA' },
  { label: 'CO', value: 'CO' },
  { label: 'CT', value: 'CT' },
  { label: 'DE', value: 'DE' },
  { label: 'FL', value: 'FL' },
  { label: 'GA', value: 'GA' },
  { label: 'HI', value: 'HI' },
  { label: 'ID', value: 'ID' },
  { label: 'IL', value: 'IL' },
  { label: 'IN', value: 'IN' },
  { label: 'IA', value: 'IA' },
  { label: 'KS', value: 'KS' },
  { label: 'KY', value: 'KY' },
  { label: 'LA', value: 'LA' },
  { label: 'ME', value: 'ME' },
  { label: 'MD', value: 'MD' },
  { label: 'MA', value: 'MA' },
  { label: 'MI', value: 'MI' },
  { label: 'MN', value: 'MN' },
  { label: 'MS', value: 'MS' },
  { label: 'MO', value: 'MO' },
  { label: 'MT', value: 'MT' },
  { label: 'NE', value: 'NE' },
  { label: 'NV', value: 'NV' },
  { label: 'NH', value: 'NH' },
  { label: 'NJ', value: 'NJ' },
  { label: 'NM', value: 'NM' },
  { label: 'NY', value: 'NY' },
  { label: 'NC', value: 'NC' },
  { label: 'ND', value: 'ND' },
  { label: 'OH', value: 'OH' },
  { label: 'OK', value: 'OK' },
  { label: 'OR', value: 'OR' },
  { label: 'PA', value: 'PA' },
  { label: 'RI', value: 'RI' },
  { label: 'SC', value: 'SC' },
  { label: 'SD', value: 'SD' },
  { label: 'TN', value: 'TN' },
  { label: 'TX', value: 'TX' },
  { label: 'UT', value: 'UT' },
  { label: 'VT', value: 'VT' },
  { label: 'VA', value: 'VA' },
  { label: 'WA', value: 'WA' },
  { label: 'WV', value: 'WV' },
  { label: 'WI', value: 'WI' },
  { label: 'WY', value: 'WY' }
];

const GENDER_OPTIONS = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
  { label: 'Non-binary', value: 'X' }
];

const MARITAL_STATUS_OPTIONS = [
  { label: 'Single', value: 'SINGLE' },
  { label: 'Married', value: 'MARRIED' },
  { label: 'Divorced', value: 'DIVORCED' },
  { label: 'Widowed', value: 'WIDOWED' }
];

const RELATIONSHIP_OPTIONS = [
  { label: 'Spouse', value: 'SPOUSE' },
  { label: 'Child', value: 'CHILD' },
  { label: 'Parent', value: 'PARENT' },
  { label: 'Other', value: 'OTHER' }
];

export const EditDriverModal: React.FC<EditDriverModalProps> = ({
  driver,
  isPrimary = false,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Driver>(driver);

  // Only reset form data when modal opens, not on every driver prop change
  useEffect(() => {
    if (isOpen) {
      setFormData(driver);
    }
  }, [isOpen, driver.id]); // Only re-initialize when modal opens or driver ID changes

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            zIndex: 1001,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Layout display="flex-column" gap="large">
              <Layout display="flex" flexJustify="space-between" flexAlign="center">
                <Title variant="title-2">Edit Driver</Title>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', fontSize: '32px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </Layout>

              <Layout display="flex" gap="medium">
                <TextInput
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
                <TextInput
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </Layout>

              <TextInput
                type="date"
                label="Date of Birth"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                required
              />

              <Layout display="flex" gap="medium">
                <div style={{ flex: 1 }}>
                  <Select
                    label="Gender"
                    placeholder="Select gender"
                    value={formData.genderCode || ''}
                    onChange={(value) => setFormData({...formData, genderCode: value})}
                    options={GENDER_OPTIONS}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Select
                    label="Marital Status"
                    placeholder="Select status"
                    value={formData.maritalStatus || ''}
                    onChange={(value) => setFormData({...formData, maritalStatus: value})}
                    options={MARITAL_STATUS_OPTIONS}
                  />
                </div>
              </Layout>

              <Layout display="flex" gap="medium">
                <div style={{ flex: 1 }}>
                  <TextInput
                    label="License Number"
                    value={formData.licenseNumber || ''}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Select
                    label="License State"
                    placeholder="Select state"
                    value={formData.licenseState || ''}
                    onChange={(value) => setFormData({...formData, licenseState: value})}
                    options={US_STATES}
                  />
                </div>
              </Layout>

              {!isPrimary && (
                <Select
                  label="Relationship"
                  placeholder="Select relationship"
                  value={formData.relationshipType || ''}
                  onChange={(value) => setFormData({...formData, relationshipType: value})}
                  options={RELATIONSHIP_OPTIONS}
                />
              )}

              <Layout display="flex" gap="medium" flexJustify="flex-end">
                <Button type="button" variant="secondary" size="large" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="large">
                  Save Changes
                </Button>
              </Layout>
            </Layout>
          </form>
        </div>
      </FocusLock>
    </div>
  );
};
