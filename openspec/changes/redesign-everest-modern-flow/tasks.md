# Implementation Tasks: Redesign Everest Modern Flow

## 1. Setup & Infrastructure

- [ ] 1.1 Create Everest component library directory structure (`src/components/everest/`)
- [ ] 1.2 Add car silhouette image asset to `public/images/car-silhouette.png`
- [ ] 1.3 Update `src/global.css` with Everest-specific global styles (Inter font import, blue background base)
- [ ] 1.4 Create Everest color palette constants (`src/components/everest/constants/colors.ts`)
- [ ] 1.5 Create Everest spacing/sizing constants (`src/components/everest/constants/spacing.ts`)

## 2. Core Everest Components

- [ ] 2.1 Implement `EverestLayout` component (replaces TechStartupLayout)
  - Sticky header with frosted glass
  - Blue gradient background
  - Car silhouette overlay
- [ ] 2.2 Implement `EverestContainer` component (max-width 1400px, responsive padding)
- [ ] 2.3 Implement `EverestCard` component (frosted glass, rounded 24px, shadow)
- [ ] 2.4 Implement `EverestTitle` component (52px hero, 36px h2, 24px h3, 18px h4)
- [ ] 2.5 Implement `EverestText` component (subtitle, body, label variants)
- [ ] 2.6 Implement `EverestButton` component (primary blue, secondary outline, actions)
- [ ] 2.7 Implement `EverestTextInput` component (14px 18px padding, focus states)
- [ ] 2.8 Implement `EverestSelect` component (matches input styling)
- [ ] 2.9 Implement `EverestBadge` component (success green, info blue variants)

## 3. Specialized Everest Components

- [ ] 3.1 Implement `EverestPriceSidebar` component
  - Dark blue gradient background (#1e40af)
  - Sticky positioning (top: 120px)
  - Price term, amount (64px font), details, breakdown sections
  - Real-time price updates on coverage changes
- [ ] 3.2 Implement `EverestLoadingAnimation` component
  - Animated car icon (100px × 50px blue rectangle, drive animation)
  - Progress bar with animated fill
  - Step indicators (complete checkmark, active spinner, pending gray)
- [ ] 3.3 Implement `EverestToggleSwitch` component (64px × 36px, smooth transition)
- [ ] 3.4 Implement `EverestSlider` component (28px thumb, blue track, labels)
- [ ] 3.5 Implement `EverestSignaturePad` component (expanded canvas, blue border, placeholder)
- [ ] 3.6 Implement `EverestHeader` component
  - Logo with mountain emoji
  - Quote ID display
  - Support phone number
  - Sticky with frosted glass backdrop

## 4. Screen Redesigns (Screens 1-9: Quote Generation)

- [ ] 4.1 Redesign `GetStarted.tsx` (Screen 1)
  - Hero headline "Reach new heights with better coverage"
  - Subtitle with value proposition
  - 2-column form grid for name, address, city, state, zip, DOB
  - Primary button "Get My Quote →"
- [ ] 4.2 Redesign `EffectiveDate.tsx` (Screen 2)
  - Centered single-field layout
  - Large headline "When do you want coverage to begin?"
  - Subtitle explaining common choices
  - Date input centered in max-width 500px
  - Back + Continue buttons
- [ ] 4.3 Redesign `EmailCollection.tsx` (Screen 3)
  - Centered layout
  - Headline "How can we reach you?"
  - Email input (required) + Phone input (optional)
  - Back + Continue buttons
- [ ] 4.4 Redesign `LoadingPrefill.tsx` (Screen 4)
  - Loading animation with car icon
  - Headline "Climbing the mountain of data..."
  - Progress bar
  - Step indicators: Verifying history (complete), Retrieving vehicles (active), Calculating premium (pending)
- [ ] 4.5 Redesign `Summary.tsx` (Screen 5)
  - Two-column layout with PriceSidebar
  - Vehicle cards grid (2 columns) with edit links
  - "Add Another Vehicle" button (dashed border)
  - Driver cards grid (2 columns) with badges (Named Insured, Household Member)
  - "Add Another Driver" button
  - Start Over + Next buttons
- [ ] 4.6 Redesign `Coverage.tsx` (Screen 6)
  - Two-column layout with PriceSidebar
  - Coverage sections: Protect Assets, Protect Vehicles, Protect People
  - Coverage items with title, value, description, slider/select controls
  - Per-vehicle deductible sliders
  - Back + Next buttons
- [ ] 4.7 Redesign `AddOns.tsx` (Screen 7)
  - Two-column layout with PriceSidebar
  - Rental Reimbursement toggles per vehicle
  - Custom Equipment Protection toggles
  - "Always Included" section (Roadside Assistance disabled toggle)
  - Back + Continue buttons
- [ ] 4.8 Redesign `LoadingValidation.tsx` (Screen 8)
  - Loading animation similar to screen 4
  - Headline "Almost there! Verifying your information..."
  - Steps: Vehicle valuation (complete), Driver records (complete), Premium calculation (active)
- [ ] 4.9 Redesign `Review.tsx` (Screen 9)
  - Two-column layout with PriceSidebar
  - Review sections in cards: Drivers, Protect Assets, Protect Vehicles, Protect People, Add-Ons
  - Label-value rows with border separators
  - Make Changes + Looks Good buttons

## 5. Screen Redesigns (Screens 10-16: Signing & Payment)

- [ ] 5.1 Redesign `Sign.tsx` (Screen 10)
  - Headline "Almost done! We need your signature"
  - Signature pad (min-height 300px expanded)
  - Signature date field (readonly)
  - Review Terms + Sign & Continue buttons
- [ ] 5.2 Add Account Check/Login screen (Screen 11 - new)
  - Headline "Welcome Back!"
  - Email field (readonly, pre-filled)
  - Password field
  - Forgot Password + Sign In buttons
  - Divider + "Continue as Guest" option
- [ ] 5.3 Add Create Account screen (Screen 12 - new or enhance existing)
  - Headline "Create Your Account"
  - Email, password, confirm password fields
  - Back + Create Account buttons
- [ ] 5.4 Redesign `Checkout.tsx` (Screen 13)
  - Headline "Mark, let's checkout" (use actual user name from quote)
  - Customer toggle: "Already a Toggle customer?" (Yes/No buttons)
  - Payment plan selection: Pay in Full vs Pay Monthly cards
  - Go Back + Pay button with amount
- [ ] 5.5 Redesign `Payment.tsx` (Screen 14)
  - Headline "Payment Information"
  - Card details form: Cardholder name, card number, expiration, CVV, billing zip
  - Back + Complete Purchase buttons
- [ ] 5.6 Redesign `Processing.tsx` (Screen 15)
  - Loading animation
  - Headline "Processing Your Payment..."
  - Steps: Payment authorized (complete), Binding policy (active), Generating documents (pending)
- [ ] 5.7 Redesign `Success.tsx` (Screen 16)
  - Large checkmark icon (80px)
  - Headline "Congratulations!"
  - Subheadline "Your policy is now active" (blue color)
  - Policy number, effective date, coverage duration
  - "What's Next?" card with email, ID cards, portal access rows
  - Download ID Cards + Go to Portal buttons

## 6. Responsive Layout Implementation

- [ ] 6.1 Implement mobile breakpoint styles (≤768px)
  - Stack 2-column grids to single column
  - Move PriceSidebar below main content
  - Reduce container padding to 20px
  - Stack payment option cards vertically
- [ ] 6.2 Implement tablet breakpoint styles (768px - 1400px)
  - Adjust container padding to 40px
  - Maintain 2-column grids where practical
  - Scale font sizes slightly smaller
- [ ] 6.3 Implement desktop styles (>1400px)
  - Cap container max-width at 1400px
  - Center content horizontally
  - Full 2-column layouts with sticky sidebar

## 7. Data Flow & Integration

- [ ] 7.1 Update all screen components to use Everest components instead of Canary
- [ ] 7.2 Preserve existing QuoteContext and TanStack Query hooks (no changes to data layer)
- [ ] 7.3 Ensure PriceSidebar recalculates on coverage/add-on changes
- [ ] 7.4 Verify modal editing (EditVehicleModal, EditDriverModal) works with new styling
- [ ] 7.5 Test navigation between all 16 screens with RouteGuard intact
- [ ] 7.6 Ensure Success screen links to existing `/portal/{policyNumber}` route

## 8. Testing & Quality Assurance

- [ ] 8.1 Update E2E tests for new component selectors and layouts
- [ ] 8.2 Add visual regression tests for all 16 screens (desktop, tablet, mobile)
- [ ] 8.3 Test keyboard navigation on all interactive elements
- [ ] 8.4 Verify ARIA labels and accessibility attributes on custom components
- [ ] 8.5 Test backdrop-filter fallbacks for older browsers (provide solid background if unsupported)
- [ ] 8.6 Copy and optimize car silhouette image from mockups/ to public/images/
- [ ] 8.7 Test sticky header/sidebar behavior on all screen sizes
- [ ] 8.8 Verify form validation works with new input components
- [ ] 8.9 Test Lighthouse scores meet targets (Performance >90, Accessibility 100)

## 9. Documentation & Cleanup

- [ ] 9.1 Document Everest component library in `src/components/everest/README.md`
- [ ] 9.2 Add component prop interfaces and usage examples
- [ ] 9.3 Update CLAUDE.md to reference Everest component library
- [ ] 9.4 Create migration guide for future screens using Everest components
- [ ] 9.5 Clean up any unused Canary imports in `/quote-v2` pages
