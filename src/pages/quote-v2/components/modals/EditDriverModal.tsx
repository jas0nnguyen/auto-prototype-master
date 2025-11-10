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

const US_STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

export const EditDriverModal: React.FC<EditDriverModalProps> = ({
  driver,
  isPrimary = false,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Driver>(driver);

  useEffect(() => {
    setFormData(driver);
  }, [driver]);

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

              <Input
                type="date"
                label="Date of Birth"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                required
              />

              <Layout display="flex" gap="medium">
                <Select
                  label="Gender"
                  value={formData.genderCode || ''}
                  onChange={(e) => setFormData({...formData, genderCode: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="X">Non-binary</option>
                </Select>
                <Select
                  label="Marital Status"
                  value={formData.maritalStatus || ''}
                  onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </Select>
              </Layout>

              <Layout display="flex" gap="medium">
                <TextInput
                  label="License Number"
                  value={formData.licenseNumber || ''}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                />
                <Select
                  label="License State"
                  value={formData.licenseState || ''}
                  onChange={(e) => setFormData({...formData, licenseState: e.target.value})}
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </Select>
              </Layout>

              {!isPrimary && (
                <Select
                  label="Relationship"
                  value={formData.relationshipType || ''}
                  onChange={(e) => setFormData({...formData, relationshipType: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="SPOUSE">Spouse</option>
                  <option value="CHILD">Child</option>
                  <option value="PARENT">Parent</option>
                  <option value="OTHER">Other</option>
                </Select>
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
