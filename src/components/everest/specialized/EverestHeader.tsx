import React from 'react';
import './EverestHeader.css';

/**
 * EverestHeader Component
 *
 * Frosted glass header with logo, quote ID, and support phone
 * - Sticky positioning at top
 * - Logo on left
 * - Quote ID in center
 * - Support phone on right
 * - Responsive layout (stacks on mobile)
 *
 * Usage:
 * <EverestHeader
 *   logo={<img src="/logo.svg" alt="Everest Insurance" />}
 *   quoteId="Q-2024-001234"
 *   supportPhone="1-800-EVEREST"
 * />
 */

export interface EverestHeaderProps {
  /** Logo element (img or text) */
  logo?: React.ReactNode;
  /** Quote or policy number to display */
  quoteId?: string;
  /** Support phone number */
  supportPhone?: string;
  /** Optional CSS class name */
  className?: string;
  /** Hide header (useful for landing page) */
  hidden?: boolean;
}

export const EverestHeader: React.FC<EverestHeaderProps> = ({
  logo,
  quoteId,
  supportPhone,
  className = '',
  hidden = false,
}) => {
  if (hidden) return null;

  return (
    <header className={`everest-header ${className}`}>
      <div className="everest-header-container">
        {/* Logo */}
        <div className="everest-header-section everest-header-logo">
          {logo || (
            <div className="everest-header-logo-text">
              <span className="everest-header-logo-icon">⛰️</span>
              <span className="everest-header-logo-name">Everest Insurance</span>
            </div>
          )}
        </div>

        {/* Quote ID */}
        {quoteId && (
          <div className="everest-header-section everest-header-quote">
            <span className="everest-header-quote-label">Quote</span>
            <span className="everest-header-quote-id">{quoteId}</span>
          </div>
        )}

        {/* Support Phone */}
        {supportPhone && (
          <div className="everest-header-section everest-header-support">
            <span className="everest-header-support-label">Need help?</span>
            <a href={`tel:${supportPhone.replace(/[^0-9]/g, '')}`} className="everest-header-support-phone">
              {supportPhone}
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
