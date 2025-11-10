/**
 * TechStartupButton Component (T046)
 *
 * This component wraps the Canary Design System Button
 * with tech startup styling (gradient background, hover effects).
 *
 * DESIGN PRINCIPLE: Composition
 * Instead of recreating a button from scratch, we compose
 * the existing Canary Button with custom styling.
 *
 * Think of it like decorating:
 * - Base = Canary Button (functionality)
 * - Decoration = .tech-startup-button class (styling)
 *
 * COMPONENT WRAPPING PATTERN:
 * 1. Import base component from design system
 * 2. Create wrapper component that accepts all base props
 * 3. Add custom className for additional styling
 * 4. Forward all props to base component
 */

import React from 'react';
import { Button } from '@sureapp/canary-design-system';
import type { ButtonProps } from '@sureapp/canary-design-system';
import './TechStartupButton.css';

/**
 * TechStartupButton Component
 *
 * A styled button that uses Canary Button as base with
 * tech startup aesthetic (gradient, hover effects).
 *
 * Usage:
 * ```tsx
 * <TechStartupButton onClick={handleNext}>
 *   Continue
 * </TechStartupButton>
 *
 * <TechStartupButton variant="secondary" size="large">
 *   Go Back
 * </TechStartupButton>
 * ```
 *
 * PROPS:
 * Accepts all props from Canary Button component:
 * - children: Button text or elements
 * - onClick: Click handler
 * - variant: "primary" | "secondary" | "tertiary"
 * - size: "small" | "medium" | "large"
 * - disabled: Boolean
 * - type: "button" | "submit" | "reset"
 * - ...and more (see ButtonProps)
 *
 * TYPESCRIPT SPREAD OPERATOR (...props):
 * The ...props syntax forwards all props to the Button component.
 * Without it, we'd need to manually list every prop:
 *
 * Bad:
 * ```tsx
 * <Button
 *   children={children}
 *   onClick={onClick}
 *   variant={variant}
 *   size={size}
 *   disabled={disabled}
 * />
 * ```
 *
 * Good:
 * ```tsx
 * <Button {...props} />
 * ```
 */
export const TechStartupButton: React.FC<ButtonProps> = (props) => {
  /**
   * Render Canary Button with custom class
   *
   * The className="tech-startup-button" applies our gradient
   * and hover effects from TechStartupButton.css.
   *
   * {...props} forwards all props (children, onClick, variant, etc.)
   * to the base Button component.
   */
  return (
    <Button className="tech-startup-button" {...props} />
  );
};

/**
 * ============================================================================
 * LEARNING SUMMARY: COMPONENT COMPOSITION
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. COMPONENT WRAPPING
 *    - Wrap existing component with custom styling
 *    - Reuse functionality, add presentation
 *    - Composition over inheritance
 *
 * 2. PROPS FORWARDING
 *    - Use ...props to forward all props
 *    - TypeScript: React.FC<ButtonProps>
 *    - No need to manually list every prop
 *
 * 3. CLASSNAME PROP
 *    - Add custom class for scoped styling
 *    - Doesn't override base component classes
 *    - CSS cascade handles specificity
 *
 * 4. TYPE SAFETY
 *    - Import ButtonProps from design system
 *    - TypeScript ensures correct prop types
 *    - IDE autocomplete for all props
 *
 * ANALOGIES:
 *
 * - Component Wrapping = Gift Wrapping
 *   - Base component = Gift
 *   - Wrapper component = Wrapping paper
 *   - Props forwarding = Pass through gift
 *
 * - Props Spreading = Package Forwarding
 *   - Receive package (props)
 *   - Add new label (className)
 *   - Forward to destination (Button)
 *
 * BEST PRACTICES:
 *
 * 1. Composition Over Recreation
 *    - Don't rebuild what exists (use Canary Button)
 *    - Wrap and style instead
 *    - Maintains design system patterns
 *
 * 2. Forward All Props
 *    - Use ...props for flexibility
 *    - Don't restrict base component capabilities
 *    - Let users access all features
 *
 * 3. Scoped CSS
 *    - Use unique className (.tech-startup-button)
 *    - Import CSS in component file
 *    - Prevents global style pollution
 *
 * 4. Type Imports
 *    - import type { ButtonProps } for types only
 *    - Smaller bundle size (types stripped at runtime)
 *    - Clear type vs value distinction
 *
 * WHEN TO WRAP VS CREATE NEW:
 *
 * WRAP when:
 * ✅ Base component exists in design system
 * ✅ You only need styling changes
 * ✅ Functionality is identical
 *
 * CREATE NEW when:
 * ❌ No base component exists
 * ❌ Behavior is fundamentally different
 * ❌ Complex custom logic needed
 */
