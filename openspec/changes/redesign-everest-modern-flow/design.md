# Design Document: Everest Insurance Visual Identity Redesign

## Context

The current `/quote-v2` flow uses the Canary Design System, which provides a professional but generic interface. The mockup (`mockups/version-4-full-modern-flow.html`) presents a distinct visual identity for "Everest Insurance" with modern aesthetics inspired by tech startups like Lemonade and Root Insurance.

**Key stakeholders:**
- Product team: Wants differentiated brand experience
- Development team: Needs maintainable, performant solution
- Users: Expect modern, trustworthy insurance experience

**Constraints:**
- Must preserve all existing functionality and data flows
- Cannot break OMG data model compliance
- Should not affect other flows (`/quote/*`, `/binding/*`, `/portal/*`)
- Must support responsive layouts (mobile, tablet, desktop)

**Background:**
- 19 screens total in the flow (quote generation, payment, portal preview)
- Current implementation uses React Router, TanStack Query, QuoteContext
- RouteGuard enforces flow consistency

## Goals / Non-Goals

**Goals:**
1. Create pixel-perfect implementation of mockup visual design
2. Build reusable Everest component library for future features
3. Maintain 100% functional parity with current implementation
4. Ensure accessibility (WCAG 2.1 AA compliance)
5. Support all viewport sizes (375px mobile to 1400px+ desktop)

**Non-Goals:**
1. Migrating existing `/quote/*` or `/portal/*` flows to Everest design (parallel implementation only)
2. Changing backend API contracts or data models
3. Adding new business logic or validation rules
4. Implementing real authentication (still demo mode with URL access)
5. Performance optimization beyond what's needed for visual effects (backdrop-filter, animations)

## Decisions

### Decision 1: Custom Component Library vs Canary Override
**Choice:** Build separate Everest component library in `src/components/everest/`

**Rationale:**
- Mockup design is fundamentally different from Canary's aesthetic (bold blues vs neutral grays, frosted glass vs solid cards)
- Overriding Canary styles globally would affect other flows
- Custom library allows precise control over spacing, typography, colors
- Easier to maintain two distinct design systems than one heavily customized system

**Alternatives considered:**
- **Theme Canary with CSS variables**: Rejected because Canary's component structure (margins, padding, DOM hierarchy) doesn't match mockup
- **CSS-in-JS overlay on Canary**: Rejected due to specificity wars and maintenance burden
- **Fork Canary**: Rejected because we don't need ongoing updates from Canary for this design

**Trade-offs:**
- **Pro:** Complete design freedom, no Canary coupling, clear separation of concerns
- **Con:** More components to maintain, larger bundle size (mitigated by code splitting), no Canary updates

### Decision 2: Frosted Glass Implementation Strategy
**Choice:** Use `backdrop-filter: blur(20px)` with solid background fallback

**Rationale:**
- Modern browsers (Chrome 76+, Safari 9+, Firefox 103+) support backdrop-filter
- Creates distinctive premium aesthetic
- Fallback to `background: rgba(255, 255, 255, 0.96)` for older browsers provides acceptable experience

**Alternatives considered:**
- **Canvas-based blur**: Rejected due to complexity and performance cost
- **SVG filter fallback**: Rejected because it doesn't work on all elements and has accessibility issues
- **Skip frosted glass entirely**: Rejected because it's core to the design identity

**Implementation:**
```css
.everest-card {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px);
}

@supports not (backdrop-filter: blur(20px)) {
  .everest-card {
    background: rgba(255, 255, 255, 1); /* Solid fallback */
  }
}
```

**Trade-offs:**
- **Pro:** Modern, premium aesthetic; wide browser support; graceful degradation
- **Con:** GPU-intensive on some devices (mitigated by limiting to cards only); not supported in IE11 (acceptable for target audience)

### Decision 3: Background Imagery Approach
**Choice:** Single car silhouette SVG/PNG with CSS positioning and blend modes

**Rationale:**
- Mockup shows subtle, static background imagery (not animated or parallax)
- CSS `mix-blend-mode: soft-light` and `opacity: 0.12` creates desired subtlety
- Single image optimized as WebP reduces network overhead

**Alternatives considered:**
- **Multiple car images**: Rejected due to unnecessary complexity
- **Animated background**: Rejected because mockup shows static imagery
- **CSS gradient only**: Rejected because it lacks visual interest

**Implementation:**
```tsx
<div className="everest-background-imagery">
  <img
    src="/images/car-silhouette.png"
    alt=""
    className="everest-car-image"
    aria-hidden="true"
  />
</div>
```

```css
.everest-car-image {
  position: fixed;
  bottom: -50px;
  right: -50px;
  width: 1000px;
  opacity: 0.12;
  filter: brightness(3) contrast(2) invert(1) blur(0.5px);
  mix-blend-mode: soft-light;
  pointer-events: none;
}
```

**Trade-offs:**
- **Pro:** Lightweight, simple, matches mockup exactly
- **Con:** Fixed positioning may clip on very small screens (mitigated by responsive sizing)

### Decision 4: Price Sidebar State Management
**Choice:** Keep existing PriceSidebar mutation logic, only redesign UI

**Rationale:**
- Current PriceSidebar already recalculates on coverage changes via TanStack Query
- No need to rewrite working data flow
- Visual redesign is independent of state management

**Alternatives considered:**
- **Rebuild PriceSidebar state from scratch**: Rejected because current implementation works correctly
- **Move price calculation to client-side**: Rejected because rating engine is on backend (OMG compliance)

**Implementation:**
- Rename `PriceSidebar.tsx` component but preserve props interface
- Update styles to dark blue gradient (#1e40af), white text, larger typography
- Ensure sticky positioning works on all screen sizes

**Trade-offs:**
- **Pro:** Zero risk of breaking pricing logic, faster implementation
- **Con:** None significant

### Decision 5: Responsive Layout Strategy
**Choice:** Mobile-first CSS with breakpoints at 768px (tablet) and 1400px (desktop)

**Rationale:**
- Mockup provides clear mobile designs (375px screenshots)
- Most users on mobile devices for insurance quotes
- CSS Grid `grid-template-columns` naturally adapts to single/multi-column

**Breakpoints:**
- **Mobile**: 0-767px (single column, stacked sidebar, 20px padding)
- **Tablet**: 768px-1399px (2-column grids, inline sidebar on some screens, 40px padding)
- **Desktop**: 1400px+ (max-width 1400px container, full 2-column layouts, sticky sidebar)

**Alternatives considered:**
- **Desktop-first**: Rejected because mobile requires more specificity overrides
- **Breakpoint at 1024px instead of 768px**: Rejected because 768px is standard tablet width
- **Fluid typography (clamp)**: Rejected for simplicity; fixed sizes at breakpoints are sufficient

**Implementation:**
```css
/* Mobile default */
.everest-container {
  padding: 20px;
}

.everest-form-grid {
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .everest-container {
    padding: 40px;
  }

  .everest-form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktop */
@media (min-width: 1400px) {
  .everest-container {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

**Trade-offs:**
- **Pro:** Standard breakpoints, easy to test, matches mockup
- **Con:** Some layouts may feel cramped between 768-1024px (acceptable trade-off)

### Decision 6: Typography Loading Strategy
**Choice:** Load Inter font from Google Fonts CDN via `@import` in `global.css`

**Rationale:**
- Mockup already uses Inter font from Google Fonts
- CDN provides caching, compression, and WOFF2 format
- Faster than self-hosting for users without Inter cached

**Alternatives considered:**
- **Self-host Inter fonts**: Rejected due to bundle size increase and slower first load
- **System font stack**: Rejected because Inter is core to the design
- **Variable font**: Considered but unnecessary; we only need weights 400, 500, 600, 700, 800

**Implementation:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

**Trade-offs:**
- **Pro:** Fast CDN delivery, browser caching, smaller initial bundle
- **Con:** External dependency (mitigated by fallback fonts), GDPR considerations (acceptable for demo)

## Risks / Trade-offs

### Risk 1: Browser Compatibility (backdrop-filter)
**Risk:** Older browsers don't support `backdrop-filter`
**Mitigation:**
- Provide solid background fallback with `@supports not (backdrop-filter)`
- Test on IE11, older Safari, Firefox ESR
- Document unsupported browsers in README

**Likelihood:** Low (target audience uses modern browsers)
**Impact:** Medium (degraded aesthetics but functional)

### Risk 2: Performance on Low-End Devices
**Risk:** Frosted glass effects, animations, and large images may lag on low-end devices
**Mitigation:**
- Optimize car silhouette image to <50KB WebP
- Limit backdrop-filter to cards only (not every element)
- Use CSS `will-change` sparingly on animated elements
- Test on throttled CPU (4x slowdown in DevTools)

**Likelihood:** Medium (some users on older phones/tablets)
**Impact:** Low (slower animations but not broken functionality)

### Risk 3: Bundle Size Increase
**Risk:** New component library increases JavaScript bundle size
**Mitigation:**
- Code split `/quote-v2` route to load Everest components only when needed
- Reuse components across screens (e.g., EverestCard in 15+ places)
- Avoid heavy dependencies (no animation libraries; use CSS)

**Likelihood:** Low (Everest components are lightweight React + CSS)
**Impact:** Low (~20-30KB gzipped increase, acceptable for modern connections)

### Risk 4: Accessibility Regression
**Risk:** Custom components may have accessibility issues (keyboard nav, screen readers)
**Mitigation:**
- Add ARIA labels to all interactive elements (`aria-label`, `aria-describedby`)
- Test with VoiceOver (macOS) and NVDA (Windows)
- Ensure keyboard navigation works (`tabIndex`, `onKeyDown` handlers)
- Run axe DevTools on all 19 screens

**Likelihood:** Medium (custom components don't have Canary's built-in accessibility)
**Impact:** High (legal/ethical obligation)
**Priority:** Must address in implementation phase

## Migration Plan

### Phase 1: Component Library (Week 1)
1. Create `src/components/everest/` directory structure
2. Implement core components (Layout, Card, Button, Input, etc.)
3. Add Storybook stories for visual QA (optional)
4. Unit test component rendering and prop handling

### Phase 2: Screen Redesigns (Week 2-3)
1. Redesign screens 1-9 (quote generation flow)
2. Test data flow and navigation between screens
3. Redesign screens 10-16 (payment and signing)
4. Test end-to-end quote-to-policy flow

### Phase 3: Portal & Polish (Week 4)
1. Redesign screens 17-19 (portal preview)
2. Implement responsive layouts for all screens
3. Fix accessibility issues identified in testing
4. Optimize images and performance

### Phase 4: Testing & Deployment (Week 5)
1. E2E test suite updates
2. Visual regression testing (Percy or Chromatic)
3. Cross-browser testing (Chrome, Firefox, Safari, Edge)
4. Performance testing (Lighthouse scores)
5. Deploy to staging, then production

### Rollback Plan
If critical issues arise:
1. Revert merge commit for `/quote-v2` redesign
2. Original Canary-based flow remains in Git history
3. Users redirect to `/quote/*` (old flow) temporarily
4. Fix issues in separate branch and redeploy

## Open Questions

1. **Branding approval:** Has "Everest Insurance" branding been approved by legal/marketing?
   - **Resolution needed:** Confirm with stakeholders before implementation

2. **Car silhouette image source:** Where should we source the car silhouette image?
   - **Options:** Commission designer, use stock image (Unsplash/Pexels), create SVG internally
   - **Resolution needed:** Provide image asset or approve stock image selection

3. **Account creation flow:** Screens 11-12 show account login/creation. Should this be functional or cosmetic?
   - **Current demo mode:** No real authentication, users access portal via URL
   - **Resolution needed:** Clarify if this is purely UI mockup or requires new backend logic

4. **Portal vs Quote-v2 integration:** Are portal screens 17-19 part of `/quote-v2` flow or separate `/portal-v2`?
   - **Routing question:** Should Success screen link to `/portal-v2/dashboard` or `/portal/{policyNumber}`?
   - **Resolution needed:** Define routing strategy for post-purchase portal access

5. **Performance budgets:** What are acceptable Lighthouse scores and bundle size limits?
   - **Targets:** Performance >90, Accessibility 100, Best Practices >90, SEO >90
   - **Bundle size:** <300KB gzipped for `/quote-v2` route
   - **Resolution needed:** Approve targets or adjust based on business requirements

## Success Metrics

**Functional Success:**
- [ ] All 19 screens render correctly on mobile, tablet, desktop
- [ ] Quote creation flow completes end-to-end without errors
- [ ] Price sidebar updates in real-time on coverage changes
- [ ] Form validation works identically to current implementation

**Visual Success:**
- [ ] Pixel-perfect match to mockup (±5px tolerance)
- [ ] Frosted glass effects render on supported browsers
- [ ] Animations smooth (60 FPS) on mid-range devices
- [ ] Typography, colors, spacing match mockup exactly

**Accessibility Success:**
- [ ] WCAG 2.1 AA compliance (axe DevTools reports 0 violations)
- [ ] Keyboard navigation works on all interactive elements
- [ ] Screen reader announces all content correctly
- [ ] Color contrast ratios meet 4.5:1 minimum

**Performance Success:**
- [ ] Lighthouse Performance score >90
- [ ] First Contentful Paint <1.5s (3G throttled)
- [ ] Total Blocking Time <300ms
- [ ] Cumulative Layout Shift <0.1
- [ ] Bundle size increase <50KB gzipped
