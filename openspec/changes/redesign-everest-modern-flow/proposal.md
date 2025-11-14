# Change: Redesign Modern Flow with Everest Insurance Visual Identity

## Why

The current `/quote-v2` flow uses the Canary Design System, which provides a generic, professional interface. However, the mockup (`mockups/version-4-full-modern-flow.html`) presents a compelling, modern visual identity for "Everest Insurance" with:

- Bold blue gradient backgrounds and frosted glass aesthetic
- Large, impactful typography with hero-style headlines
- Subtle background imagery (car silhouette) for brand personality
- Sticky price sidebar with dark blue gradient for pricing emphasis
- More spacious, confident layouts that convey trust and simplicity

This redesign creates a distinct brand experience while preserving all existing functionality, data flows, and OMG compliance. The visual identity aligns with modern insurance tech startups (e.g., Lemonade, Root) that use bold colors and large typography to build trust with younger demographics.

## What Changes

**Visual Design Overhaul:**
- Replace Canary Design System with custom Everest component library
- Implement blue color scheme: primary `#3b82f6`, dark blue `#1e40af`, backgrounds with subtle gradients
- Add frosted glass card designs with `backdrop-filter: blur()` effects
- Use Inter font family for all typography (already loaded via Google Fonts in mockup)
- Create background imagery system with subtle car silhouette overlay

**Branding Updates:**
- Change branding from generic to "Everest Insurance" (⛰️ mountain emoji + name)
- Update header to display logo, quote ID, and support phone number
- Modify all copy to use "Everest Insurance" where applicable

**Layout & Component Changes:**
- Create new Everest component library: `src/components/everest/`
  - `Layout`, `Container`, `Title`, `Text`, `Card`, `Button`, `Input`, `Select`
  - `PriceSidebar` with dark blue gradient design
  - `LoadingAnimation` with animated car icon
  - `ToggleSwitch`, `Slider`, `Badge` components
- Implement sticky header with frosted glass effect
- Add background imagery container with car silhouette
- Update form layouts to match mockup grid patterns (2-column with proper spacing)

**Screen-by-Screen Updates (16 screens):**
1. **Get Started**: Hero headline "Reach new heights with better coverage", 2-column form grid
2. **Effective Date**: Centered single-field layout with large title
3. **Email Collection**: Email + optional phone, centered layout
4. **Loading Prefill**: Animated car icon, progress bar, step indicators
5. **Summary**: Two-column layout with sticky price sidebar, vehicle/driver cards
6. **Coverage**: Coverage items with sliders/selects, price sidebar updates
7. **Add-Ons**: Toggle switches for optional coverages, price sidebar
8. **Loading Validation**: Similar to Loading Prefill with different steps
9. **Review**: Comprehensive review cards organized by section, price sidebar
10. **Sign**: Signature pad with expanded canvas, date field
11. **Account Check/Login**: Welcome back screen with password field (cosmetic UI only)
12. **Create Account**: Email + password fields for new account (cosmetic UI only)
13. **Checkout**: Customer toggle + payment plan selection
14. **Payment**: Card details form with billing zip
15. **Processing**: Payment processing animation
16. **Success**: Checkmark icon, policy number, next steps linking to existing portal

**Note:** Portal screens (17-19 from mockup) are excluded from this redesign. Success screen links to existing `/portal/{policyNumber}` with current Canary design.

**Preservation of Functionality:**
- All existing data flows remain unchanged (API calls, quote mutations, navigation)
- React Router structure stays the same (`/quote-v2/*` routes)
- QuoteContext and TanStack Query hooks unchanged
- Form validation logic preserved
- Modal editing (vehicles, drivers) functionality maintained
- RouteGuard flow protection remains active

**No Breaking Changes:**
- Existing Canary-based flows (`/quote/*`, `/binding/*`, `/portal/*`) unaffected
- Backend API contracts unchanged
- Database schema unchanged
- OMG data model compliance maintained

## Impact

**Affected specs:**
- `quote-flow-everest` (new capability spec for Everest-branded flow)

**Affected code:**
- `src/pages/quote-v2/*.tsx` - All 19 screen components (visual redesign)
- `src/components/everest/` - New component library (to be created)
- `src/pages/quote-v2/components/` - Update shared components (TechStartupLayout → EverestLayout, PriceSidebar redesign)
- `src/global.css` - Add Everest-specific global styles (background, Inter font)
- `public/` - Add car silhouette image asset

**Affected systems:**
- Frontend only - no backend changes required

**Migration notes:**
- This is a parallel implementation; existing flows remain functional
- Users currently in `/quote-v2` flow will see new design on next deployment
- No data migration required

**Testing impact:**
- Update E2E tests to match new selectors and layouts
- Visual regression tests recommended for 19 screens
- Accessibility testing for new components (keyboard nav, ARIA labels)
- Responsive testing (mobile, tablet, desktop) per mockup media queries

**Performance considerations:**
- Frosted glass effects (`backdrop-filter`) may impact older browsers (provide fallbacks)
- Background imagery should be optimized (WebP format, lazy loading)
- Inter font already cached from Google Fonts CDN
