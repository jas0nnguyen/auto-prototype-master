import React from 'react';
import './EverestPriceSidebar.css';

/**
 * EverestPriceSidebar Component
 *
 * Dark blue gradient sidebar for displaying pricing information
 * - Background: Linear gradient from #1e40af to #2563eb
 * - White text for high contrast
 * - Sticky positioning on desktop
 * - Full-width on mobile (moves to bottom)
 *
 * Usage:
 * <EverestPriceSidebar
 *   monthlyPrice="$147"
 *   sixMonthPrice="$882"
 *   coverageDetails={[
 *     { label: 'Liability', value: '100/300/100' },
 *     { label: 'Collision', value: '$500 deductible' },
 *   ]}
 *   isSticky={true}
 * />
 */

export interface PricingDetail {
  label: string;
  value: string;
}

export interface EverestPriceSidebarProps {
  /** Monthly premium amount (formatted string like "$147") */
  monthlyPrice?: string;
  /** 6-month premium amount (formatted string like "$882") */
  sixMonthPrice?: string;
  /** Coverage details to display */
  coverageDetails?: PricingDetail[];
  /** Whether sidebar should be sticky on desktop */
  isSticky?: boolean;
  /** Optional CSS class name */
  className?: string;
  /** Show loading state */
  isLoading?: boolean;
}

export const EverestPriceSidebar: React.FC<EverestPriceSidebarProps> = ({
  monthlyPrice,
  sixMonthPrice,
  coverageDetails = [],
  isSticky = true,
  className = '',
  isLoading = false,
}) => {
  return (
    <aside
      className={`everest-price-sidebar ${isSticky ? 'everest-price-sidebar-sticky' : ''} ${className}`}
      aria-label="Pricing information"
    >
      <div className="everest-price-sidebar-content">
        {isLoading ? (
          <div className="everest-price-sidebar-loading">
            <div className="everest-price-sidebar-skeleton everest-price-sidebar-skeleton-title"></div>
            <div className="everest-price-sidebar-skeleton everest-price-sidebar-skeleton-price"></div>
            <div className="everest-price-sidebar-skeleton everest-price-sidebar-skeleton-text"></div>
          </div>
        ) : (
          <>
            {/* Monthly Price */}
            {monthlyPrice && (
              <div className="everest-price-sidebar-section">
                <div className="everest-price-sidebar-label">Your monthly price</div>
                <div className="everest-price-sidebar-price-large">{monthlyPrice}</div>
                <div className="everest-price-sidebar-subtext">per month</div>
              </div>
            )}

            {/* 6-Month Price */}
            {sixMonthPrice && (
              <div className="everest-price-sidebar-section">
                <div className="everest-price-sidebar-label">6-month total</div>
                <div className="everest-price-sidebar-price-medium">{sixMonthPrice}</div>
              </div>
            )}

            {/* Coverage Details */}
            {coverageDetails.length > 0 && (
              <div className="everest-price-sidebar-section everest-price-sidebar-details">
                <div className="everest-price-sidebar-label">Your coverage</div>
                <div className="everest-price-sidebar-details-list">
                  {coverageDetails.map((detail, index) => (
                    <div key={index} className="everest-price-sidebar-detail-item">
                      <span className="everest-price-sidebar-detail-label">{detail.label}</span>
                      <span className="everest-price-sidebar-detail-value">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
