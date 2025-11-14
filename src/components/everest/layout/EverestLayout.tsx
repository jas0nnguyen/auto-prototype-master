import React from 'react';
import './EverestLayout.css';

/**
 * EverestLayout Component
 *
 * Main layout wrapper for Everest Insurance pages.
 * Provides:
 * - Blue gradient background (#3b82f6)
 * - Sticky header with frosted glass effect
 * - Car silhouette background imagery
 * - Content wrapper with proper z-index layering
 *
 * Usage:
 * <EverestLayout>
 *   <YourPageContent />
 * </EverestLayout>
 */

export interface EverestLayoutProps {
  children: React.ReactNode;
  /** Optional header content (logo, quote ID, phone) */
  header?: React.ReactNode;
  /** Disable background imagery (default: false) */
  noBackgroundImage?: boolean;
}

export const EverestLayout: React.FC<EverestLayoutProps> = ({
  children,
  header,
  noBackgroundImage = false,
}) => {
  return (
    <div className="everest-page">
      {/* Background imagery - car silhouette */}
      {!noBackgroundImage && (
        <div className="everest-background-imagery">
          <img
            src="/images/car-silhouette.png"
            alt=""
            className="everest-car-image"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Sticky header */}
      {header && (
        <header className="everest-header">
          <div className="everest-header-content">{header}</div>
        </header>
      )}

      {/* Main content area */}
      <main className="everest-main">{children}</main>
    </div>
  );
};
