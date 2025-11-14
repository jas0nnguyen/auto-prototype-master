import React from 'react';
import './EverestText.css';

/**
 * EverestText Component
 *
 * Typography component for body text with variants:
 * - subtitle: 18px, gray (#718096), line-height 1.7
 * - body: 16px, standard body text
 * - label: 14px, weight 600, for form labels
 * - small: 14px, for smaller text
 * - caption: 13px, for captions
 *
 * Usage:
 * <EverestText variant="subtitle">
 *   Get auto insurance that's as reliable as a mountain.
 * </EverestText>
 */

export type TextVariant = 'subtitle' | 'body' | 'label' | 'small' | 'caption';

export interface EverestTextProps {
  children: React.ReactNode;
  /** Typography variant (default: 'body') */
  variant?: TextVariant;
  /** Optional CSS class name */
  className?: string;
  /** HTML element to render (default: 'p' for most, 'label' for label variant) */
  as?: 'p' | 'span' | 'div' | 'label';
}

export const EverestText: React.FC<EverestTextProps> = ({
  children,
  variant = 'body',
  className = '',
  as,
}) => {
  // Auto-detect HTML element based on variant
  const Component = as || (variant === 'label' ? 'label' : 'p');

  return (
    <Component className={`everest-text everest-text-${variant} ${className}`}>
      {children}
    </Component>
  );
};
