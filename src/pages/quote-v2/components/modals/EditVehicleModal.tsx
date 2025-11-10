import React, { useState, useEffect } from 'react';
import FocusLock from 'react-focus-lock';
import {
  Layout,
  Title,
  Text,
  TextInput,
  Select,
  Button
} from '@sureapp/canary-design-system';

/**
 * EditVehicleModal Component
 *
 * Modal for editing owned vehicle information.
 * Fields:
 * - vehicle_year
 * - vehicle_make
 * - vehicle_model
 * - vin (17 characters)
 * - ownership_status (OWNED, FINANCED, LEASED)
 * - annual_mileage
 * - vehicle_use_code (COMMUTE, PLEASURE, BUSINESS)
 *
 * Features:
 * - Focus trap with react-focus-lock
 * - ESC key handler
 * - ARIA labels for accessibility
 */

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  vin: string;
  ownershipStatus?: string;
  annualMileage?: number;
  useCode?: string;
}

interface EditVehicleModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

const OWNERSHIP_STATUS = [
  { value: 'OWNED', label: 'Owned' },
  { value: 'FINANCED', label: 'Financed' },
  { value: 'LEASED', label: 'Leased' },
];

const VEHICLE_USE = [
  { value: 'COMMUTE', label: 'Commute to work/school' },
  { value: 'PLEASURE', label: 'Pleasure/Personal use' },
  { value: 'BUSINESS', label: 'Business use' },
];

export const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Vehicle>(vehicle);
  const [errors, setErrors] = useState<Partial<Record<keyof Vehicle, string>>>({});

  useEffect(() => {
    setFormData(vehicle);
  }, [vehicle]);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleInputChange = (field: keyof Vehicle, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Vehicle, string>> = {};

    if (!formData.year || formData.year < 1980 || formData.year > CURRENT_YEAR + 1) {
      newErrors.year = 'Enter a valid year';
    }
    if (!formData.make.trim()) {
      newErrors.make = 'Vehicle make is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Vehicle model is required';
    }
    if (!formData.vin.trim()) {
      newErrors.vin = 'VIN is required';
    } else if (formData.vin.length !== 17) {
      newErrors.vin = 'VIN must be 17 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-vehicle-modal-title"
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
          className="modal-content"
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
                <Title id="edit-vehicle-modal-title" variant="title-2">
                  Edit Vehicle
                </Title>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '32px',
                    cursor: 'pointer',
                    color: '#718096',
                  }}
                >
                  ×
                </button>
              </Layout>

              <Layout display="flex" gap="medium">
                <div style={{ flex: 1 }}>
                  <Select
                    label="Year"
                    value={formData.year.toString()}
                    onChange={(e) => handleInputChange('year', Number(e.target.value))}
                    error={errors.year}
                    required
                  >
                    <option value="">Select Year</option>
                    {YEARS.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                </div>
                <div style={{ flex: 1 }}>
                  <TextInput
                    type="text"
                    label="Make"
                    value={formData.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    error={errors.make}
                    required
                  />
                </div>
              </Layout>

              <TextInput
                type="text"
                label="Model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                error={errors.model}
                required
              />

              <TextInput
                type="text"
                label="VIN (17 characters)"
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                error={errors.vin}
                maxLength={17}
                required
              />

              <Select
                label="Ownership Status"
                value={formData.ownershipStatus || 'OWNED'}
                onChange={(e) => handleInputChange('ownershipStatus', e.target.value)}
              >
                {OWNERSHIP_STATUS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>

              <TextInput
                type="number"
                label="Annual Mileage"
                value={formData.annualMileage || ''}
                onChange={(e) => handleInputChange('annualMileage', Number(e.target.value))}
                min={0}
                max={100000}
              />

              <Select
                label="Primary Use"
                value={formData.useCode || 'COMMUTE'}
                onChange={(e) => handleInputChange('useCode', e.target.value)}
              >
                {VEHICLE_USE.map(use => (
                  <option key={use.value} value={use.value}>
                    {use.label}
                  </option>
                ))}
              </Select>

              <Layout display="flex" gap="medium" flexJustify="flex-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                >
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
