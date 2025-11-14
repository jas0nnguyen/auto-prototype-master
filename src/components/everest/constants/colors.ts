/**
 * Everest Insurance Color Palette
 *
 * Based on the mockup design with blue gradient aesthetic
 */

export const EverestColors = {
  // Primary blue (backgrounds, buttons, accents)
  primary: '#3b82f6',

  // Dark blue (price sidebar, gradients)
  primaryDark: '#1e40af',

  // Secondary blue (lighter accent)
  secondary: '#2563eb',

  // Text colors
  textPrimary: '#1a202c',      // Dark gray for main text
  textSecondary: '#2d3748',    // Medium gray for subheadings
  textTertiary: '#4a5568',     // Light gray for labels
  textMuted: '#718096',        // Muted gray for descriptions
  textLight: '#cbd5e0',        // Very light gray for placeholders

  // White and transparency
  white: '#ffffff',
  whiteAlpha96: 'rgba(255, 255, 255, 0.96)',  // Frosted glass cards
  whiteAlpha98: 'rgba(255, 255, 255, 0.98)',  // Header

  // Background colors
  bgBlue: '#3b82f6',           // Main page background
  bgLightGray: '#f7fafc',      // Card backgrounds
  bgGray: '#edf2f7',           // Hover states

  // Border colors
  borderLight: '#e2e8f0',      // Default borders
  borderMedium: '#cbd5e0',     // Dashed borders (add buttons)
  borderFocus: '#3b82f6',      // Focus state borders

  // Status colors
  success: '#48bb78',          // Green for success states
  successLight: '#c6f6d5',     // Light green background
  successDark: '#22543d',      // Dark green text

  info: '#2563eb',             // Blue for info
  infoLight: '#dbeafe',        // Light blue background
  infoDark: '#1e40af',         // Dark blue text

  error: '#f56565',            // Red for errors
  errorLight: '#fed7d7',       // Light red background
  errorDark: '#c53030',        // Dark red text

  // Price sidebar specific
  sidebarBg: '#1e40af',        // Dark blue gradient
  sidebarText: '#ffffff',      // White text
  sidebarTextMuted: '#bfdbfe', // Light blue muted
  sidebarTextAccent: '#93c5fd', // Light blue accent
  sidebarBorder: '#3b82f6',    // Border color
} as const;

export type EverestColor = typeof EverestColors[keyof typeof EverestColors];
