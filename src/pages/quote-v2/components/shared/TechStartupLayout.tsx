/**
 * TechStartupLayout Component (T043)
 *
 * This layout component provides the tech startup aesthetic
 * for the redesigned quote flow (quote-v2).
 *
 * KEY FEATURES:
 * - Wraps content with .tech-startup-layout class for scoped styling
 * - Conditionally provides QuoteProvider if quoteId is present
 * - Uses Inter font family and gradient background
 *
 * WHAT IS A LAYOUT COMPONENT?
 * A layout component is a wrapper that provides consistent styling,
 * structure, and shared functionality across multiple pages.
 *
 * Think of it like a picture frame:
 * - Frame = Layout component (border, style)
 * - Picture = Page content (children)
 * - Different pictures, same frame
 */

import React, { ReactNode } from 'react';
import { QuoteProvider } from '../../contexts/QuoteContext';
import './TechStartupLayout.css';

/**
 * TechStartupLayout Props
 *
 * Accepts:
 * - children: React components to render inside the layout
 * - quoteId (optional): If provided, wraps children with QuoteProvider
 */
interface TechStartupLayoutProps {
  children: ReactNode;
  quoteId?: string;
}

/**
 * TechStartupLayout Component
 *
 * Renders a styled wrapper for quote-v2 pages.
 *
 * WITHOUT quoteId:
 * ```tsx
 * <TechStartupLayout>
 *   <WelcomePage />
 * </TechStartupLayout>
 * ```
 *
 * WITH quoteId (provides QuoteContext):
 * ```tsx
 * <TechStartupLayout quoteId="123-456-789">
 *   <VehicleInfoPage />
 * </TechStartupLayout>
 * ```
 *
 * CONDITIONAL RENDERING PATTERN:
 * If quoteId exists, wrap children with QuoteProvider.
 * If no quoteId, render children directly.
 */
export const TechStartupLayout: React.FC<TechStartupLayoutProps> = ({ children, quoteId }) => {
  /**
   * Render Logic
   *
   * Two scenarios:
   * 1. quoteId provided: Wrap with QuoteProvider for context access
   * 2. No quoteId: Render children directly (no context needed)
   */
  return (
    <div className="tech-startup-layout">
      {quoteId ? (
        <QuoteProvider quoteId={quoteId}>
          {children}
        </QuoteProvider>
      ) : (
        children
      )}
    </div>
  );
};

/**
 * ============================================================================
 * LEARNING SUMMARY: LAYOUT COMPONENTS
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. LAYOUT COMPONENT
 *    - Wrapper component for consistent structure
 *    - Provides shared styling/functionality
 *    - Children prop for page content
 *
 * 2. CONDITIONAL PROVIDER
 *    - Wrap with provider only when needed
 *    - Check if prop exists (quoteId)
 *    - Ternary operator for conditional rendering
 *
 * 3. CSS SCOPING
 *    - .tech-startup-layout class creates scope
 *    - Styles don't affect other pages
 *    - Safe to use with existing /quote/* pages
 *
 * ANALOGIES:
 *
 * - Layout = Stage Setup
 *   - Curtains, lighting, backdrop (layout)
 *   - Actors, props, scenes (children)
 *   - Different plays, same stage
 *
 * - Layout = Restaurant Ambiance
 *   - Music, lighting, decor (layout)
 *   - Customers, food, service (children)
 *   - Consistent atmosphere
 *
 * BEST PRACTICES:
 *
 * 1. Keep Layouts Simple
 *    - Only provide structure and shared functionality
 *    - Don't include page-specific logic
 *    - Let pages control their own content
 *
 * 2. Optional Props for Flexibility
 *    - quoteId? (optional) allows reuse
 *    - Can use layout with or without context
 *    - More flexible than required props
 *
 * 3. Clear CSS Scoping
 *    - Use unique class name (.tech-startup-layout)
 *    - Import CSS file in component
 *    - Prevents style conflicts
 *
 * 4. Composition Over Props
 *    - Use children prop for content
 *    - Don't pass many individual props
 *    - More flexible and reusable
 */
