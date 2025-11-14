import React from 'react';
import './EverestCard.css';

/**
 * EverestCard Component
 *
 * Frosted glass card with backdrop blur effect
 * - Background: rgba(255,255,255,0.96) with 20px blur
 * - Border radius: 24px
 * - Shadow: 0 20px 60px rgba(30, 58, 138, 0.15)
 * - Padding: 60px (desktop), 32px (mobile)
 *
 * Usage:
 * <EverestCard>
 *   <YourCardContent />
 * </EverestCard>
 */

export interface EverestCardProps {
  children: React.ReactNode;
  /** Optional CSS class name */
  className?: string;
  /** Clickable card (adds hover effect) */
  clickable?: boolean;
  /** Click handler for clickable cards */
  onClick?: () => void;
}

export const EverestCard: React.FC<EverestCardProps> = ({
  children,
  className = '',
  clickable = false,
  onClick,
}) => {
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`everest-card ${clickable ? 'everest-card-clickable' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {children}
    </div>
  );
};
