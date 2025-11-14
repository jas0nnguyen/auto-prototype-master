import React from 'react';
import './EverestButton.css';

/**
 * EverestButton Component
 *
 * Button with variants:
 * - primary: Blue background (#2563eb), white text, shadow
 * - secondary: White background, blue border and text
 *
 * Usage:
 * <EverestButton variant="primary" onClick={handleClick}>
 *   Get My Quote →
 * </EverestButton>
 */

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface EverestButtonProps {
  children: React.ReactNode;
  /** Button variant (default: 'primary') */
  variant?: ButtonVariant;
  /** Button size (default: 'medium') */
  size?: ButtonSize;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Optional CSS class name */
  className?: string;
}

export const EverestButton: React.FC<EverestButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
}) => {
  return (
    <button
      type={type}
      className={`everest-button everest-button-${variant} everest-button-${size} ${
        fullWidth ? 'everest-button-full-width' : ''
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
