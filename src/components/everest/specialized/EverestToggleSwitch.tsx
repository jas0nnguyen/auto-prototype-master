import React from 'react';
import './EverestToggleSwitch.css';

/**
 * EverestToggleSwitch Component
 *
 * Custom toggle switch for yes/no selections
 * - Size: 64px × 36px
 * - Blue background when active (#3b82f6)
 * - Smooth transition animation
 * - Accessible with keyboard support
 *
 * Usage:
 * <EverestToggleSwitch
 *   checked={isEnabled}
 *   onChange={(checked) => setIsEnabled(checked)}
 *   label="Enable coverage"
 * />
 */

export interface EverestToggleSwitchProps {
  /** Current checked state */
  checked: boolean;
  /** Callback when toggle state changes */
  onChange: (checked: boolean) => void;
  /** Label text for accessibility and display */
  label?: string;
  /** Optional description text */
  description?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Optional CSS class name */
  className?: string;
  /** Optional ID for the input */
  id?: string;
  /** Optional name for form submission */
  name?: string;
}

export const EverestToggleSwitch: React.FC<EverestToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  id,
  name,
}) => {
  const toggleId = id || name || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Space or Enter toggles the switch
    if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className={`everest-toggle-container ${className}`}>
      <div className="everest-toggle-wrapper">
        <button
          type="button"
          role="switch"
          id={toggleId}
          aria-checked={checked}
          aria-label={label}
          aria-describedby={description ? `${toggleId}-description` : undefined}
          disabled={disabled}
          className={`everest-toggle ${checked ? 'everest-toggle-checked' : ''} ${
            disabled ? 'everest-toggle-disabled' : ''
          }`}
          onClick={handleChange}
          onKeyDown={handleKeyDown}
        >
          <span className="everest-toggle-thumb" aria-hidden="true" />
        </button>

        {label && (
          <label htmlFor={toggleId} className="everest-toggle-label">
            {label}
          </label>
        )}
      </div>

      {description && (
        <p id={`${toggleId}-description`} className="everest-toggle-description">
          {description}
        </p>
      )}
    </div>
  );
};
