import React from 'react';
import './EverestTextInput.css';

/**
 * EverestTextInput Component
 *
 * Text input with Everest styling:
 * - Padding: 14px 18px
 * - Border: 2px solid #e2e8f0
 * - Border radius: 12px
 * - Focus: blue border + shadow
 *
 * Usage:
 * <EverestTextInput
 *   label="First Name"
 *   placeholder="John"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   required
 * />
 */

export interface EverestTextInputProps {
  /** Input label */
  label?: string;
  /** Input value */
  value: string;
  /** Change handler */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Input placeholder */
  placeholder?: string;
  /** Input type (default: 'text') */
  type?: 'text' | 'email' | 'tel' | 'password' | 'date';
  /** Input name attribute */
  name?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Optional CSS class name */
  className?: string;
  /** Input ID (auto-generated from name if not provided) */
  id?: string;
}

export const EverestTextInput: React.FC<EverestTextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  name,
  required = false,
  disabled = false,
  error,
  className = '',
  id,
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`everest-input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="everest-input-label">
          {label}
          {required && <span className="everest-input-required"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`everest-input ${error ? 'everest-input-error' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <span id={`${inputId}-error`} className="everest-input-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
