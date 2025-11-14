import React from 'react';
import './EverestBadge.css';

/**
 * EverestBadge Component
 *
 * Small badge/pill for status indicators:
 * - success: Green background (Named Insured, Active)
 * - info: Blue background (Household Member, Pending)
 *
 * Usage:
 * <EverestBadge variant="success">Named Insured</EverestBadge>
 */

export type BadgeVariant = 'success' | 'info';

export interface EverestBadgeProps {
  children: React.ReactNode;
  /** Badge variant (default: 'info') */
  variant?: BadgeVariant;
  /** Optional CSS class name */
  className?: string;
}

export const EverestBadge: React.FC<EverestBadgeProps> = ({
  children,
  variant = 'info',
  className = '',
}) => {
  return (
    <span className={`everest-badge everest-badge-${variant} ${className}`}>
      {children}
    </span>
  );
};
