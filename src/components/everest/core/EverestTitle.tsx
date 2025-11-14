import React from 'react';
import './EverestTitle.css';

/**
 * EverestTitle Component
 *
 * Typography component for headings with multiple variants:
 * - hero: 52px, weight 800 (main page headlines)
 * - h2: 36px, weight 700 (section headings)
 * - h3: 24px, weight 700 (subsection headings)
 * - h4: 18px, weight 600 (small headings)
 *
 * Usage:
 * <EverestTitle variant="hero">Reach new heights</EverestTitle>
 */

export type TitleVariant = 'hero' | 'h2' | 'h3' | 'h4';

export interface EverestTitleProps {
  children: React.ReactNode;
  /** Typography variant (default: 'h2') */
  variant?: TitleVariant;
  /** Optional CSS class name */
  className?: string;
  /** HTML element to render (default: auto-detected from variant) */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const EverestTitle: React.FC<EverestTitleProps> = ({
  children,
  variant = 'h2',
  className = '',
  as,
}) => {
  // Auto-detect HTML element based on variant
  const Component = as || (variant === 'hero' ? 'h1' : variant);

  return (
    <Component className={`everest-title everest-title-${variant} ${className}`}>
      {children}
    </Component>
  );
};
