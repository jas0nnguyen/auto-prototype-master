/**
 * Everest Insurance Spacing & Sizing Constants
 *
 * Based on the mockup design specifications
 */

export const EverestSpacing = {
  // Container padding
  containerPaddingMobile: '20px',
  containerPaddingTablet: '40px',
  containerPaddingDesktop: '40px',
  containerMaxWidth: '1400px',

  // Card spacing
  cardPadding: '60px',
  cardPaddingMobile: '32px',
  cardMargin: '60px',
  cardBorderRadius: '24px',
  cardBorderRadiusSmall: '16px',
  cardBorderRadiusMedium: '12px',

  // Form spacing
  formGridGap: '24px',
  formGroupGap: '32px',

  // Button spacing
  buttonPadding: '16px 32px',
  buttonPaddingSmall: '12px 24px',
  buttonPaddingLarge: '16px 32px',
  buttonBorderRadius: '12px',
  buttonGap: '16px',

  // Input spacing
  inputPadding: '14px 18px',
  inputBorderRadius: '12px',
  inputBorderWidth: '2px',

  // Typography spacing
  titleMargin: '16px',
  subtitleMargin: '40px',
  sectionMargin: '48px',

  // Price sidebar
  sidebarPadding: '40px',
  sidebarBorderRadius: '20px',
  sidebarTop: '120px',

  // Loading animation
  loadingMargin: '50px',
  loadingProgressWidth: '500px',
  loadingProgressHeight: '8px',

  // Toggle switch
  toggleWidth: '64px',
  toggleHeight: '36px',

  // Slider
  sliderHeight: '8px',
  sliderThumbSize: '28px',

  // Badge
  badgePadding: '6px 14px',
  badgeBorderRadius: '20px',

  // Modal/Signature
  signaturePadding: '40px',
  signatureMinHeight: '200px',
  signatureBorderWidth: '3px',
} as const;

export const EverestFontSizes = {
  // Hero titles
  heroTitle: '52px',
  heroTitleLineHeight: '1.1',

  // Headings
  h2: '36px',
  h3: '24px',
  h4: '18px',

  // Body text
  subtitle: '18px',
  subtitleLineHeight: '1.7',
  body: '16px',
  bodySmall: '15px',
  label: '14px',
  caption: '13px',
  tiny: '12px',

  // Price display
  priceAmount: '64px',
  priceAmountSmall: '40px',
  priceAmount Hero: '36px',

  // Icons
  iconLarge: '80px',
  iconMedium: '48px',
  iconSmall: '36px',
} as const;

export const EverestFontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

export const EverestBreakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1400px',
} as const;

export const EverestShadows = {
  card: '0 20px 60px rgba(30, 58, 138, 0.15)',
  cardHover: '0 10px 30px rgba(59, 130, 246, 0.15)',
  button: '0 10px 30px rgba(37, 99, 235, 0.3)',
  buttonHover: '0 15px 40px rgba(59, 130, 246, 0.4)',
  icon: '0 6px 20px rgba(37, 99, 235, 0.3)',
  loadingBar: '0 0 20px rgba(37, 99, 235, 0.6)',
  input Focus: '0 0 0 4px rgba(59, 130, 246, 0.1)',
  toggle: '0 2px 8px rgba(0, 0, 0, 0.2)',
  sidebar: '0 20px 60px rgba(30, 64, 175, 0.4)',
  header: '0 4px 20px rgba(0, 0, 0, 0.08)',
} as const;

export const EverestAnimations = {
  transitionFast: '0.2s',
  transitionMedium: '0.3s',
  transitionSlow: '0.4s',
  loadingDuration: '2s',
} as const;

export type EverestSpacingKey = keyof typeof EverestSpacing;
export type EverestFontSize = keyof typeof EverestFontSizes;
export type EverestFontWeight = keyof typeof EverestFontWeights;
