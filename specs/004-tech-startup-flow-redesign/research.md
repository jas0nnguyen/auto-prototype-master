# Phase 0: Research & Decisions

**Feature**: 004-tech-startup-flow-redesign
**Date**: 2025-11-09
**Status**: Complete ✅

---

## Research Topics

### 1. ✅ Signature Canvas Library Selection

**Question**: Which React signature library best supports our requirements (canvas-based, touch support, clear/accept actions, export to image)?

**Options Evaluated**:
- react-signature-canvas
- react-signature-pad
- react-signature-pad-wrapper

**Decision**: **react-signature-canvas** ✅

**Rationale**:
- **Browser Compatibility**: Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- **TypeScript Support**: Full TypeScript definitions included
- **Touch/Mouse Support**: Native support for both input methods
- **Export Formats**: Supports PNG, JPEG, SVG export via `.toDataURL()`
- **API Simplicity**: Clean API with `.clear()` and `.isEmpty()` methods
- **Active Maintenance**: Latest release within 6 months, active community
- **Bundle Size**: ~15KB gzipped (lightweight)

**Implementation Pattern**:
```typescript
import SignatureCanvas from 'react-signature-canvas';

interface SignatureCanvasComponentProps {
  onSave: (signature: string) => void;
}

const SignatureCanvasComponent: React.FC<SignatureCanvasComponentProps> = ({ onSave }) => {
  const sigPadRef = useRef<SignatureCanvas>(null);

  const handleClear = () => {
    sigPadRef.current?.clear();
  };

  const handleSave = () => {
    if (sigPadRef.current?.isEmpty()) {
      alert('Please provide a signature');
      return;
    }
    const dataURL = sigPadRef.current?.toDataURL('image/png');
    onSave(dataURL);
  };

  return (
    <div>
      <SignatureCanvas
        ref={sigPadRef}
        canvasProps={{
          width: 500,
          height: 200,
          className: 'signature-canvas'
        }}
      />
      <button onClick={handleClear}>Clear</button>
      <button onClick={handleSave}>Accept</button>
    </div>
  );
};
```

**Package Installation**:
```bash
npm install react-signature-canvas
npm install --save-dev @types/react-signature-canvas
```

---

### 2. Inter Font Loading Strategy

**Question**: How to load Google Fonts (Inter) efficiently for quote-v2 screens without affecting existing flow?

**Options Evaluated**:
- Google Fonts CDN
- Self-hosted fonts
- @font-face with preload

**Decision**: **Google Fonts CDN with Scoped Application** ✅

**Rationale**:
- **Zero Configuration**: No build pipeline changes needed
- **Automatic Optimization**: Google serves optimal font formats (WOFF2)
- **Caching**: CDN caching reduces repeat load times
- **Font Variants**: Easy to add weights (400, 600, 700, 800)
- **Scoping**: Applied only to quote-v2 components via CSS class

**Implementation Pattern**:

**index.html** (add to `<head>`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
```

**src/pages/quote-v2/components/shared/TechStartupLayout.tsx**:
```typescript
import './TechStartupLayout.css';

export const TechStartupLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="tech-startup-layout">
      {children}
    </div>
  );
};
```

**TechStartupLayout.css**:
```css
.tech-startup-layout {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.tech-startup-layout h1 {
  font-size: 52px;
  font-weight: 800;
  line-height: 1.2;
}

.tech-startup-layout h2 {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.3;
}

/* Existing /quote/* pages unaffected - no .tech-startup-layout class */
```

**Performance Optimization**:
- Use `display=swap` to prevent FOUT (Flash of Unstyled Text)
- Preconnect to Google Fonts domains for DNS prefetch
- Limit font weights to 4 variants (400, 600, 700, 800)

---

### 3. Mock Service Response Patterns

**Question**: What realistic data patterns should mock services return for insurance history, VIN decoder, MVR lookup?

**Decision**: **Realistic Scenario-Based Responses** ✅

**Mock Service Response Structures**:

#### VIN Decoder Service
```typescript
// POST /api/v1/mock/vin-decode
{
  vin: "1HGBH41JXMN109186",
  year: 2021,
  make: "Honda",
  model: "Civic",
  trim: "LX",
  body_style: "Sedan",
  engine: "2.0L I4",
  transmission: "CVT",
  drivetrain: "FWD",
  fuel_type: "Gasoline",
  manufacturer: "Honda Motor Co., Ltd."
}
```

#### Vehicle Valuation Service
```typescript
// GET /api/v1/mock/vehicle-value/:vin
{
  vin: "1HGBH41JXMN109186",
  market_value: 22500,
  replacement_cost: 24000,
  valuation_date: "2025-11-09",
  source: "NADA",
  mileage_adjustment: -500,
  condition_adjustment: 0
}
```

#### Insurance History Lookup
```typescript
// POST /api/v1/mock/insurance-history
{
  has_prior_insurance: true,
  current_carrier: "State Farm",
  years_insured: 5,
  prior_policies: [
    {
      policy_number: "SF-1234567",
      carrier: "State Farm",
      coverage_start_date: "2020-01-15",
      coverage_end_date: "2025-01-15",
      coverage_types: ["Liability", "Collision", "Comprehensive"]
    }
  ],
  vehicles_insured: [
    {
      vin: "1HGBH41JXMN109186",
      year: 2021,
      make: "Honda",
      model: "Civic"
    }
  ],
  claims_history: [
    {
      claim_date: "2022-06-15",
      claim_type: "Collision",
      claim_amount: 3500,
      at_fault: false
    }
  ]
}
```

#### MVR (Motor Vehicle Record) Lookup
```typescript
// POST /api/v1/mock/driver-record
{
  driver_license_number: "D1234567",
  license_state: "CA",
  license_status: "Valid",
  violations: [
    {
      violation_date: "2023-03-12",
      violation_type: "Speeding",
      violation_points: 1,
      violation_description: "10-15 mph over limit"
    }
  ],
  accidents: [
    {
      accident_date: "2022-06-15",
      at_fault: false,
      accident_type: "Rear-ended"
    }
  ],
  dui_convictions: [],
  license_suspensions: [],
  total_points: 1
}
```

#### Safety Ratings Service
```typescript
// GET /api/v1/mock/safety-rating/:year/:make/:model
{
  year: 2021,
  make: "Honda",
  model: "Civic",
  nhtsa_overall: 5,
  nhtsa_frontal: 5,
  nhtsa_side: 5,
  nhtsa_rollover: 4,
  iihs_overall: "Good",
  iihs_small_overlap_front: "Good",
  iihs_moderate_overlap_front: "Good",
  iihs_side: "Good",
  iihs_roof_strength: "Good",
  anti_theft_features: ["Alarm", "Immobilizer"],
  safety_features: ["ABS", "Airbags", "Traction Control", "Stability Control"]
}
```

**Edge Case Scenarios**:
- **No Prior Insurance**: `has_prior_insurance: false`, empty arrays
- **High-Risk Driver**: Multiple violations, DUI, license suspension
- **High-Value Vehicle**: Luxury/exotic vehicles with >$100k valuation
- **Invalid VIN**: Return 400 error with message "Invalid VIN format"
- **Service Timeout**: Simulate 3-second delay, return 503 error

---

### 4. Loading Animation Performance

**Question**: Best practices for 60fps CSS animations (car icon, progress bar, spinner) on mobile devices?

**Decision**: **CSS Transforms + GPU Acceleration** ✅

**Principles**:
1. **Use transform and opacity only** - These properties use GPU acceleration
2. **Avoid layout thrashing** - No width, height, top, left animations
3. **Use will-change hints sparingly** - Only for actively animating elements
4. **Prefer CSS keyframes over JavaScript** - Better performance, smoother animations

**Implementation Pattern**:

**LoadingAnimation.css**:
```css
/* Car icon bounce animation */
@keyframes carBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.loading-car-icon {
  animation: carBounce 1s ease-in-out infinite;
  will-change: transform;
}

/* Progress bar fill */
@keyframes progressFill {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}

.progress-bar-fill {
  transform-origin: left center;
  animation: progressFill 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  will-change: transform;
}

/* Spinner rotation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
  will-change: transform;
}

/* Checkmark appear */
@keyframes checkmarkAppear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.checkmark {
  animation: checkmarkAppear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
```

**Performance Checklist**:
- ✅ Animations run on compositor thread (transform, opacity)
- ✅ No layout recalculations during animation
- ✅ will-change removed after animation completes (via JS)
- ✅ 60fps target on iPhone 12+ and Android flagship devices
- ✅ Reduced motion support for accessibility

**Accessibility**:
```css
@media (prefers-reduced-motion: reduce) {
  .loading-car-icon,
  .progress-bar-fill,
  .spinner {
    animation: none;
  }
}
```

---

### 5. Price Sidebar State Management

**Question**: How to synchronize price sidebar across multiple screens with real-time updates?

**Decision**: **TanStack Query Cache + React Context** ✅

**Rationale**:
- **TanStack Query**: Already in use, provides caching and refetching
- **React Context**: Shares quote data across quote-v2 screens
- **URL State**: Quote ID in URL preserves state on refresh
- **<500ms Update**: Query invalidation triggers fast recalculation

**Architecture**:

```typescript
// src/pages/quote-v2/contexts/QuoteContext.tsx
import { createContext, useContext } from 'react';
import { useQuote, useCalculatePremium } from '@/hooks/useQuote';

interface QuoteContextValue {
  quote: Quote | undefined;
  isLoading: boolean;
  recalculatePremium: () => Promise<void>;
}

const QuoteContext = createContext<QuoteContextValue | undefined>(undefined);

export const QuoteProvider: React.FC<{ quoteId: string; children: React.ReactNode }> = ({
  quoteId,
  children
}) => {
  const { data: quote, isLoading } = useQuote(quoteId);
  const calculateMutation = useCalculatePremium();

  const recalculatePremium = async () => {
    await calculateMutation.mutateAsync(quoteId);
  };

  return (
    <QuoteContext.Provider value={{ quote, isLoading, recalculatePremium }}>
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuoteContext = () => {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuoteContext must be used within QuoteProvider');
  }
  return context;
};
```

**Usage in Coverage Screen**:
```typescript
// src/pages/quote-v2/Coverage.tsx
const Coverage = () => {
  const { quote, recalculatePremium } = useQuoteContext();
  const updateCoverageMutation = useUpdateCoverage();

  const handleCoverageChange = async (coverageType: string, limit: number) => {
    // Optimistic update
    await updateCoverageMutation.mutateAsync({
      quoteId: quote.quote_id,
      coverages: { [coverageType]: limit }
    });

    // Recalculate premium (triggers sidebar update)
    await recalculatePremium();
  };

  return (
    <div>
      <CoverageSlider onChange={handleCoverageChange} />
      <PriceSidebar /> {/* Automatically updates from TanStack Query cache */}
    </div>
  );
};
```

**Price Sidebar Implementation**:
```typescript
// src/pages/quote-v2/components/PriceSidebar.tsx
const PriceSidebar = () => {
  const { quote, isLoading } = useQuoteContext();

  if (isLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <aside className="price-sidebar">
      <h3>Your Quote</h3>
      <div className="premium-amount">${quote?.total_premium}</div>
      <div className="term">6-month term</div>
      <div className="due-today">${quote?.due_today}</div>
      <div className="breakdown">
        {quote?.coverages.map(c => (
          <div key={c.coverage_type}>{c.coverage_type}: ${c.premium}</div>
        ))}
      </div>
    </aside>
  );
};
```

**Performance Target**:
- Update latency: <500ms (API response + re-render)
- TanStack Query cache hit: Instant (0ms)
- Prevents unnecessary re-renders via React.memo

---

### 6. Modal Accessibility Patterns

**Question**: How to ensure modals meet WCAG 2.1 AA standards (focus trap, keyboard navigation, screen reader support)?

**Decision**: **Canary Design System Modal + ARIA Enhancements** ✅

**Accessibility Requirements**:
1. **Focus Management**: Trap focus within modal, restore on close
2. **Keyboard Navigation**: ESC to close, Tab cycles through elements
3. **Screen Reader Support**: ARIA labels, roles, live regions
4. **Color Contrast**: 4.5:1 minimum for text
5. **Touch Targets**: 44x44px minimum for buttons

**Implementation Pattern**:

```typescript
// src/pages/quote-v2/components/modals/EditVehicleModal.tsx
import { Modal } from '@sureapp/canary-design-system';
import { useEffect, useRef } from 'react';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSave: (vehicle: Vehicle) => void;
}

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSave
}) => {
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      firstInputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="edit-vehicle-title"
      aria-describedby="edit-vehicle-description"
    >
      <div role="dialog" aria-modal="true">
        <h2 id="edit-vehicle-title">Edit Vehicle</h2>
        <p id="edit-vehicle-description">Update your vehicle information</p>

        <form onSubmit={(e) => { e.preventDefault(); onSave(vehicle); }}>
          <label htmlFor="vehicle-year">Year</label>
          <input
            ref={firstInputRef}
            id="vehicle-year"
            type="number"
            aria-required="true"
          />

          <label htmlFor="vehicle-make">Make</label>
          <input id="vehicle-make" type="text" aria-required="true" />

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save Changes</button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
```

**ARIA Attributes Checklist**:
- ✅ `role="dialog"` on modal container
- ✅ `aria-modal="true"` to indicate modal context
- ✅ `aria-labelledby` pointing to modal title
- ✅ `aria-describedby` pointing to modal description
- ✅ `aria-required` on required form fields
- ✅ `aria-live="polite"` for validation errors

**Focus Trap Implementation**:
```typescript
// Use react-focus-lock for robust focus trapping
import FocusLock from 'react-focus-lock';

<Modal isOpen={isOpen} onClose={onClose}>
  <FocusLock>
    <div role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  </FocusLock>
</Modal>
```

**Package Installation**:
```bash
npm install react-focus-lock
```

---

### 7. Route Protection Strategy

**Question**: How to prevent users from mixing /quote and /quote-v2 routes (AR-006)?

**Decision**: **Session-Based Flow Tracking** ✅

**Implementation Strategy**:

**1. Session Storage Flow Tracker**:
```typescript
// src/utils/flowTracker.ts
const FLOW_KEY = 'active_quote_flow';

export type QuoteFlow = 'classic' | 'tech-startup' | null;

export const setActiveFlow = (flow: QuoteFlow): void => {
  if (flow) {
    sessionStorage.setItem(FLOW_KEY, flow);
  } else {
    sessionStorage.removeItem(FLOW_KEY);
  }
};

export const getActiveFlow = (): QuoteFlow => {
  return sessionStorage.getItem(FLOW_KEY) as QuoteFlow;
};

export const clearActiveFlow = (): void => {
  sessionStorage.removeItem(FLOW_KEY);
};
```

**2. Route Guard Component**:
```typescript
// src/components/RouteGuard.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getActiveFlow, setActiveFlow } from '@/utils/flowTracker';

interface RouteGuardProps {
  flow: 'classic' | 'tech-startup';
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ flow, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeFlow = getActiveFlow();

  useEffect(() => {
    // First visit to quote flow - set active flow
    if (!activeFlow) {
      setActiveFlow(flow);
      return;
    }

    // User trying to mix flows - redirect to landing
    if (activeFlow !== flow) {
      console.warn(`Cannot mix ${activeFlow} and ${flow} flows`);
      navigate('/', {
        state: {
          error: 'Please complete your current quote flow or start a new quote.'
        }
      });
    }
  }, [activeFlow, flow, navigate]);

  return <>{children}</>;
};
```

**3. Apply to Routes**:
```typescript
// src/App.tsx
import { RouteGuard } from '@/components/RouteGuard';

<Routes>
  {/* Classic flow */}
  <Route path="/quote/*" element={
    <RouteGuard flow="classic">
      <Outlet />
    </RouteGuard>
  }>
    <Route path="driver-info/:quoteNumber" element={<PrimaryDriverInfo />} />
    {/* Other classic routes */}
  </Route>

  {/* Tech-startup flow */}
  <Route path="/quote-v2/*" element={
    <RouteGuard flow="tech-startup">
      <Outlet />
    </RouteGuard>
  }>
    <Route path="get-started" element={<GetStarted />} />
    {/* Other tech-startup routes */}
  </Route>

  {/* Landing page clears flow on mount */}
  <Route path="/" element={<HomePage />} />
</Routes>
```

**4. Landing Page Flow Selector**:
```typescript
// src/HomePage.tsx
import { clearActiveFlow } from '@/utils/flowTracker';

const HomePage = () => {
  // Clear any active flow when landing page loads
  useEffect(() => {
    clearActiveFlow();
  }, []);

  return (
    <div>
      <h1>Get Your Auto Insurance Quote</h1>
      <div className="flow-selector">
        <Link to="/quote/driver-info/new" onClick={() => setActiveFlow('classic')}>
          <button>Classic Flow</button>
        </Link>
        <Link to="/quote-v2/get-started" onClick={() => setActiveFlow('tech-startup')}>
          <button>Modern Flow</button>
        </Link>
      </div>
    </div>
  );
};
```

**Edge Cases Handled**:
- ✅ User opens /quote-v2 in new tab while /quote is open → Session isolated per tab
- ✅ User refreshes page mid-flow → Session preserved, flow continues
- ✅ User completes quote → Session cleared on success page
- ✅ User returns to landing page → Session cleared, can choose any flow

---

## Summary

All 7 research topics have been investigated and decisions documented. Key takeaways:

1. **react-signature-canvas** selected for signature capture
2. **Google Fonts CDN** with scoped CSS for Inter font
3. **Realistic scenario-based mock responses** defined for all services
4. **CSS transforms + GPU acceleration** for 60fps animations
5. **TanStack Query + React Context** for price sidebar state
6. **Canary Modal + ARIA + react-focus-lock** for accessibility
7. **Session storage + RouteGuard** for flow protection

**Phase 0 Status**: ✅ COMPLETE

**Ready for Phase 1**: Data model design, API contracts, quickstart guide
