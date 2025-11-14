import React from 'react';
import './EverestContainer.css';

/**
 * EverestContainer Component
 *
 * Responsive container with max-width and padding
 * - Mobile (≤768px): 20px padding
 * - Tablet/Desktop (>768px): 40px padding
 * - Desktop (>1400px): 1400px max-width, centered
 *
 * Usage:
 * <EverestContainer>
 *   <YourContent />
 * </EverestContainer>
 */

export interface EverestContainerProps {
  children: React.ReactNode;
  /** Optional CSS class name */
  className?: string;
  /** Custom max-width (default: 1400px) */
  maxWidth?: string;
}

export const EverestContainer: React.FC<EverestContainerProps> = ({
  children,
  className = '',
  maxWidth,
}) => {
  return (
    <div
      className={`everest-container ${className}`}
      style={maxWidth ? { maxWidth } : undefined}
    >
      {children}
    </div>
  );
};
