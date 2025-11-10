/**
 * Shared Components Barrel Export
 *
 * This file exports all shared components from a single entry point.
 * Makes imports cleaner in consuming components.
 *
 * BARREL EXPORT PATTERN:
 * Instead of:
 * ```tsx
 * import { TechStartupLayout } from '../components/shared/TechStartupLayout';
 * import { TechStartupButton } from '../components/shared/TechStartupButton';
 * ```
 *
 * Use:
 * ```tsx
 * import { TechStartupLayout, TechStartupButton } from '../components/shared';
 * ```
 */

export { TechStartupLayout } from './TechStartupLayout';
export { TechStartupButton } from './TechStartupButton';
