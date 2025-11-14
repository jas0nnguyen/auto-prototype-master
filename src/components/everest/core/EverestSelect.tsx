import React from 'react';
import './EverestSelect.css';

/**
 * EverestSelect Component
 *
 * Select dropdown with Everest styling (matches TextInput design)
 *
 * Usage:
 * <EverestSelect
 *   label="State"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   options={[
 *     { label: 'California', value: 'CA' },
 *     { label: 'New York', value: 'NY' }
 *   ]}
 *   required
 * />
 */

export interface SelectOption {
  label: string;
  value: string;
}

export interface EverestSelectProps {
  /** Select label */
  label?: string;
  /** Selected value */
  value: string;
  /** Change handler */
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Select options */
  options: SelectOption[];
  /** Placeholder option */
  placeholder?: string;
  /** Select name attribute */
  name?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Optional CSS class name */
  className?: string;
  /** Select ID (auto-generated from name if not provided) */
  id?: string;
}

export const EverestSelect: React.FC<EverestSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  name,
  required = false,
  disabled = false,
  error,
  className = '',
  id,
}) => {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`everest-select-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="everest-select-label">
          {label}
          {required && <span className="everest-select-required"> *</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`everest-select ${error ? 'everest-select-error' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${selectId}-error` : undefined}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${selectId}-error`} className="everest-select-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
