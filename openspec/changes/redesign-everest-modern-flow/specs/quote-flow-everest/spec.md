# Quote Flow - Everest Insurance Visual Identity

## ADDED Requirements

### Requirement: Everest Component Library
The system SHALL provide a custom component library for the Everest Insurance visual identity, independent of the Canary Design System.

#### Scenario: Components render with Everest styling
- **WHEN** any Everest component is rendered
- **THEN** it uses Inter font family, blue color scheme (#3b82f6 primary, #1e40af dark), and frosted glass effects where applicable

#### Scenario: Component prop API matches Canary patterns
- **WHEN** developers use Everest components
- **THEN** prop interfaces follow familiar patterns (size, variant, color) for ease of migration

### Requirement: Everest Brand Header
The system SHALL display the Everest Insurance branded header on all quote flow pages.

#### Scenario: Header displays branding and context
- **WHEN** user views any screen in /quote-v2 flow
- **THEN** header shows "⛰️ Everest Insurance" logo, quote ID (if available), and support phone "📞 1-800-EVEREST"

#### Scenario: Header remains sticky on scroll
- **WHEN** user scrolls down the page
- **THEN** header remains fixed at top with frosted glass background effect

### Requirement: Background Imagery System
The system SHALL display subtle background imagery on all quote flow screens.

#### Scenario: Car silhouette displays in background
- **WHEN** any quote flow page loads
- **THEN** a subtle car silhouette image appears in the bottom-right corner with low opacity (12%), white color, and soft blur

#### Scenario: Background does not interfere with content
- **WHEN** user interacts with forms and buttons
- **THEN** background imagery remains non-interactive (pointer-events: none) and does not obscure text

### Requirement: Frosted Glass Card Design
The system SHALL render all content cards with frosted glass aesthetic.

#### Scenario: Cards display frosted glass effect
- **WHEN** content cards are rendered
- **THEN** cards have white background with 96% opacity, backdrop blur (20px), rounded corners (24px), and elevation shadow

#### Scenario: Cards adapt to content
- **WHEN** screen content changes (vehicles added, coverage selected)
- **THEN** card layout adjusts without breaking frosted glass effect

### Requirement: Blue Gradient Background
The system SHALL display blue gradient backgrounds on all quote flow pages.

#### Scenario: Background renders blue gradient
- **WHEN** user views any /quote-v2 page
- **THEN** page background is solid blue (#3b82f6) with car silhouette overlay

#### Scenario: Background persists across navigation
- **WHEN** user navigates between quote flow screens
- **THEN** blue background remains consistent without flickering

### Requirement: Sticky Price Sidebar with Dark Blue Gradient
The system SHALL display a sticky price sidebar with dark blue gradient design on applicable screens.

#### Scenario: Price sidebar appears from Summary screen onward
- **WHEN** user reaches Summary screen (screen 5) or later
- **THEN** price sidebar appears on the right side with dark blue gradient (#1e40af), white text, and sticky positioning

#### Scenario: Price sidebar updates in real-time
- **WHEN** user changes coverage selections or add-ons
- **THEN** price sidebar updates monthly/6-month amounts and breakdowns without page reload

#### Scenario: Price sidebar remains sticky on scroll
- **WHEN** user scrolls down long content pages (Coverage, Review)
- **THEN** price sidebar stays fixed at top: 120px, maintaining visibility

### Requirement: Large Hero Typography
The system SHALL use large, impactful typography for main headlines.

#### Scenario: Hero titles render with proper sizing
- **WHEN** screen displays main headline (e.g., "Reach new heights with better coverage")
- **THEN** title uses 52px font size, 800 weight, line-height 1.1, and dark gray color (#1a202c)

#### Scenario: Subtitles provide context
- **WHEN** hero title is displayed
- **THEN** subtitle appears below with 18px font size, gray color (#718096), and 1.7 line-height

### Requirement: Form Grid Layout System
The system SHALL organize form inputs in a 2-column grid layout matching mockup specifications.

#### Scenario: Form inputs display in 2-column grid
- **WHEN** form with multiple inputs is rendered (Get Started, Payment)
- **THEN** inputs display in grid with 24px gap, responsive to screen size

#### Scenario: Full-width inputs span both columns
- **WHEN** input is marked as full-width (email, street address)
- **THEN** input spans grid-column: 1 / -1

### Requirement: Enhanced Input Components
The system SHALL provide input components with Everest visual styling.

#### Scenario: Inputs render with proper styling
- **WHEN** text input, select, or textarea is rendered
- **THEN** component has 14px 18px padding, 2px border (#e2e8f0), 12px border-radius, and focus state with blue border

#### Scenario: Input focus provides visual feedback
- **WHEN** user focuses on input field
- **THEN** border changes to blue (#3b82f6) with blue shadow (0 0 0 4px rgba(59, 130, 246, 0.1))

### Requirement: Animated Loading Screens
The system SHALL display animated loading screens with car icon and progress indicators.

#### Scenario: Loading screen displays animated car
- **WHEN** Loading Prefill or Loading Validation screen appears
- **THEN** blue car icon animates horizontally, progress bar fills, and step indicators show progress

#### Scenario: Loading steps update in sequence
- **WHEN** loading progresses through steps
- **THEN** completed steps show green checkmark, active step shows spinner, pending steps show gray state

### Requirement: Coverage Selection with Sliders
The system SHALL provide coverage selection UI with sliders and dropdowns.

#### Scenario: Coverage items display with interactive controls
- **WHEN** Coverage screen renders
- **THEN** each coverage item shows title, current value, description, and slider or select control

#### Scenario: Coverage value updates on slider change
- **WHEN** user moves slider thumb
- **THEN** displayed coverage value updates in real-time and price sidebar recalculates

### Requirement: Toggle Switch for Optional Add-Ons
The system SHALL provide toggle switches for enabling/disabling optional coverages.

#### Scenario: Toggle switches render for add-ons
- **WHEN** Add-Ons screen displays
- **THEN** each add-on shows toggle switch (64px × 36px) with smooth transition on state change

#### Scenario: Toggle state changes on click
- **WHEN** user clicks toggle switch
- **THEN** switch slides to new position, background changes to blue (#2563eb), and price sidebar updates

### Requirement: Comprehensive Review Screen
The system SHALL display a comprehensive review of all selections before payment.

#### Scenario: Review cards organized by section
- **WHEN** Review screen loads
- **THEN** selections are grouped into sections (Drivers, Protect Assets, Protect Vehicles, Protect People, Add-Ons)

#### Scenario: Review rows display label-value pairs
- **WHEN** review card renders
- **THEN** each row shows gray label on left and bold black value on right with border separator

### Requirement: Signature Pad with Expanded Canvas
The system SHALL provide a signature capture interface with large canvas area.

#### Scenario: Signature pad renders with proper sizing
- **WHEN** Sign screen loads
- **THEN** signature pad displays with min-height 200px, blue border (3px), and centered placeholder text

#### Scenario: Signature captures user input
- **WHEN** user draws signature
- **THEN** canvas captures stroke data and "Click to sign" placeholder disappears

### Requirement: Payment Plan Selection UI
The system SHALL display payment plan options (pay-in-full vs monthly) with visual selection state.

#### Scenario: Payment options render as cards
- **WHEN** Checkout screen displays
- **THEN** two payment option cards show side-by-side with amount, subtitle, and selectable state

#### Scenario: Selected payment option highlights
- **WHEN** user clicks payment option card
- **THEN** card border changes to blue (#3b82f6), background turns white, and shadow appears

### Requirement: Success Screen with Next Steps
The system SHALL display a success confirmation with policy details and actionable next steps.

#### Scenario: Success screen shows checkmark and policy info
- **WHEN** payment processing completes successfully
- **THEN** large checkmark (80px) appears, followed by policy number, effective date, and coverage duration

#### Scenario: Next steps display as review rows
- **WHEN** success screen renders
- **THEN** "What's Next?" section shows email confirmation, ID card download, and portal access as actionable items

### Requirement: Portal Navigation Tabs
The system SHALL provide horizontal navigation tabs for portal sections.

#### Scenario: Portal tabs render with active state
- **WHEN** user views portal dashboard or subsections
- **THEN** navigation shows tabs (Dashboard, Policies, Documents, Claims, Payments) with active tab highlighted in blue

#### Scenario: Tab click navigates to section
- **WHEN** user clicks portal navigation tab
- **THEN** route changes to corresponding portal section without page reload

### Requirement: Quick Actions Grid
The system SHALL display quick action cards in a 3-column grid on portal dashboard.

#### Scenario: Action cards render with icons
- **WHEN** portal dashboard loads
- **THEN** 6 action cards display in grid: Download ID Cards, Make Payment, File Claim, Update Policy, Contact Support, View Coverage

#### Scenario: Action cards provide hover feedback
- **WHEN** user hovers over action card
- **THEN** card border changes to blue, shadow appears, and card lifts with translateY(-4px) transform

### Requirement: Document List with Download Actions
The system SHALL display policy documents in a list format with download buttons.

#### Scenario: Document items render with metadata
- **WHEN** Documents screen loads
- **THEN** each document shows name, date issued, and "Download PDF" button

#### Scenario: Document download triggers on click
- **WHEN** user clicks "Download PDF" button
- **THEN** document download initiates (simulated in demo mode)

### Requirement: Responsive Layout for Mobile and Tablet
The system SHALL adapt layouts for mobile (375px), tablet (768px), and desktop (1400px max-width) viewports.

#### Scenario: Mobile layout stacks columns
- **WHEN** viewport width is ≤768px
- **THEN** 2-column grids become single-column, price sidebar moves below content, and card grids stack vertically

#### Scenario: Tablet layout adjusts spacing
- **WHEN** viewport width is between 768px and 1400px
- **THEN** container padding reduces to 40px, font sizes scale slightly smaller, and grids maintain 2-column where practical

#### Scenario: Desktop layout uses max-width
- **WHEN** viewport width exceeds 1400px
- **THEN** content container caps at 1400px width and centers horizontally

## MODIFIED Requirements

None - this is a new visual identity implementation parallel to existing flows.

## REMOVED Requirements

None - this is an additive change that preserves existing functionality.

## RENAMED Requirements

None
