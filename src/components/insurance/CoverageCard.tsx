/**
 * CoverageCard Component (T075)
 *
 * This component displays a single coverage option with its details.
 * Uses only Canary Design System components - NO custom CSS.
 *
 * WHAT IS A COMPONENT?
 * A React component is like a reusable LEGO block for your UI.
 * - You define it once
 * - Use it many times
 * - Pass different data each time (via props)
 *
 * Example:
 * <CoverageCard name="Collision" limit="$50,000" deductible="$500" premium={250} />
 */

import React from 'react';
import {
  Card,
  Text,
  Badge,
  Divider,
  Stack,
} from '@sureapp/canary-design-system';

/**
 * Props Interface
 *
 * WHAT ARE PROPS?
 * Props (properties) are like function parameters for components.
 * They're how you pass data into a component.
 *
 * Example:
 * function greet(name: string) { ... }  // Function parameter
 * <CoverageCard name="..." />           // Component prop
 *
 * TypeScript interface ensures we pass the right data types.
 */
interface CoverageCardProps {
  /** Coverage type name (e.g., "Bodily Injury Liability") */
  coverageName: string;

  /** Coverage type code (e.g., "BI_LIABILITY") */
  coverageCode: string;

  /** Coverage limit amount (e.g., "$100,000/$300,000") */
  limitAmount?: string;

  /** Deductible amount (e.g., "$500") */
  deductibleAmount?: string;

  /** Premium amount for this coverage (e.g., 125.50) */
  premiumAmount: number;

  /** Currency code (default: "USD") */
  currency?: string;

  /** Is this coverage required by law? */
  isRequired?: boolean;

  /** Is this coverage currently selected? */
  isSelected?: boolean;

  /** Callback when coverage is clicked */
  onClick?: () => void;
}

/**
 * CoverageCard Component
 *
 * COMPONENT STRUCTURE:
 * 1. Props destructuring (extract props we need)
 * 2. Helper functions (format data for display)
 * 3. JSX return (the actual UI)
 *
 * REACT.FC EXPLAINED:
 * FC = Function Component (TypeScript type)
 * - Tells TypeScript this is a React component
 * - Provides type checking for props
 * - Includes children prop automatically
 */
const CoverageCard: React.FC<CoverageCardProps> = ({
  coverageName,
  coverageCode,
  limitAmount,
  deductibleAmount,
  premiumAmount,
  currency = 'USD',
  isRequired = false,
  isSelected = false,
  onClick,
}) => {
  /**
   * Format premium amount as currency
   *
   * Example: 125.50 => "$125.50"
   *
   * Intl.NumberFormat is a built-in JavaScript API for formatting numbers.
   * It handles currency symbols, decimal places, thousands separators.
   */
  const formatPremium = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * JSX RETURN
   *
   * JSX = JavaScript XML (looks like HTML but it's JavaScript)
   * - Write HTML-like syntax in JavaScript
   * - Transformed to React.createElement calls
   * - Can embed JavaScript expressions in { }
   *
   * Example:
   * <div>Hello {name}</div>  =>  React.createElement('div', null, 'Hello ', name)
   */
  return (
    /**
     * Card Component (from Canary Design System)
     *
     * Props used:
     * - variant: Controls card style ("outlined" = border, "elevated" = shadow)
     * - onClick: Makes card clickable (fires when user clicks)
     * - style: Inline styles (cursor pointer makes it look clickable)
     */
    <Card
      variant={isSelected ? 'elevated' : 'outlined'}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/**
       * Stack Component
       *
       * Stack automatically spaces child elements vertically.
       * spacing="small" = consistent gap between elements.
       *
       * Alternative to manually adding margin-bottom to each element.
       */}
      <Stack spacing="small">
        {/**
         * HEADER: Coverage Name and Required Badge
         *
         * Flex layout to put name on left, badge on right:
         * [Bodily Injury Liability ........... REQUIRED]
         */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="title-3" weight="semibold">
            {coverageName}
          </Text>

          {/**
           * Conditional Rendering
           *
           * {isRequired && <Badge />} means:
           * "If isRequired is true, render the Badge"
           *
           * && is a logical operator:
           * - true && X = X (renders X)
           * - false && X = false (renders nothing)
           */}
          {isRequired && (
            <Badge color="blue" size="small">
              Required
            </Badge>
          )}
        </div>

        {/**
         * Divider Component
         *
         * Visual separator between sections.
         * Like an <hr> tag but styled by Canary.
         */}
        <Divider />

        {/**
         * DETAILS: Limit and Deductible
         *
         * Conditional rendering - only show if values exist
         */}
        {(limitAmount || deductibleAmount) && (
          <Stack spacing="xsmall">
            {limitAmount && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text variant="body-small" color="secondary">
                  Limit:
                </Text>
                <Text variant="body-small" weight="medium">
                  {limitAmount}
                </Text>
              </div>
            )}

            {deductibleAmount && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text variant="body-small" color="secondary">
                  Deductible:
                </Text>
                <Text variant="body-small" weight="medium">
                  {deductibleAmount}
                </Text>
              </div>
            )}
          </Stack>
        )}

        {/**
         * PREMIUM: The cost of this coverage
         *
         * Displayed prominently at the bottom
         */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text variant="body" color="secondary">
            Premium:
          </Text>
          <Text variant="title-3" weight="bold" color="primary">
            {formatPremium(premiumAmount)}
          </Text>
        </div>
      </Stack>
    </Card>
  );
};

/**
 * Export the component so it can be imported elsewhere
 *
 * Usage in other files:
 * import CoverageCard from '@/components/insurance/CoverageCard';
 * <CoverageCard name="Collision" premium={250} />
 */
export default CoverageCard;

/**
 * ============================================================================
 * LEARNING SUMMARY: REACT COMPONENTS
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. COMPONENTS
 *    - Reusable UI building blocks
 *    - Like functions that return UI
 *    - Accept props (inputs) and return JSX (output)
 *
 * 2. PROPS
 *    - Data passed from parent to child component
 *    - Read-only (cannot be modified by child)
 *    - TypeScript interfaces provide type safety
 *
 * 3. JSX
 *    - HTML-like syntax in JavaScript
 *    - Transformed to React.createElement() calls
 *    - Can embed JavaScript expressions with { }
 *
 * 4. CONDITIONAL RENDERING
 *    - {condition && <Component />} = render if true
 *    - {condition ? <A /> : <B />} = render A if true, B if false
 *    - null or undefined = renders nothing
 *
 * 5. CANARY DESIGN SYSTEM
 *    - Pre-built, styled components
 *    - Card, Text, Badge, Stack, Divider, etc.
 *    - No custom CSS needed - use component props
 *
 * ANALOGIES:
 *
 * - Component = LEGO Block
 *   - Defined once, used many times
 *   - Snaps together with other blocks
 *   - Each block has specific purpose
 *
 * - Props = Function Parameters
 *   - greet(name) vs <Greet name="John" />
 *   - Both pass data to be used
 *   - Type-checked by TypeScript
 *
 * - JSX = HTML Template
 *   - Looks like HTML
 *   - But it's JavaScript
 *   - Can include logic and expressions
 *
 * - Conditional Rendering = If Statement
 *   - Show/hide parts of UI based on data
 *   - {isLoggedIn && <LogoutButton />}
 *   - Like if (isLoggedIn) { show button }
 *
 * BEST PRACTICES:
 *
 * 1. Single Responsibility
 *    - Each component does one thing well
 *    - CoverageCard displays one coverage
 *    - Don't mix multiple concerns
 *
 * 2. Prop Validation
 *    - Use TypeScript interfaces
 *    - Document what each prop does
 *    - Mark optional props with ?
 *
 * 3. Design System First
 *    - Use Canary components exclusively
 *    - No custom CSS classes
 *    - Style via component props
 *
 * 4. Descriptive Names
 *    - coverageName (clear what it is)
 *    - Not name, title, label (too generic)
 */
