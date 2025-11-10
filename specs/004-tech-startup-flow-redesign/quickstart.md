# Quickstart Guide: Tech Startup Flow

**Feature**: 004-tech-startup-flow-redesign
**Audience**: Developers onboarding to the tech-startup flow implementation
**Prerequisites**: Familiarity with React 18, TypeScript, and the existing `/quote/*` flow

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Running Both Flows Side-by-Side](#running-both-flows-side-by-side)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Mock Services Usage](#mock-services-usage)
7. [Testing Strategy](#testing-strategy)
8. [Canary Design System Reference](#canary-design-system-reference)
9. [Signature Canvas Integration](#signature-canvas-integration)
10. [Debugging Tips](#debugging-tips)
11. [Common Issues](#common-issues)

---

## Overview

The tech-startup flow (`/quote-v2/*`) is a **parallel implementation** that coexists with the existing progressive flow (`/quote/*`). Both flows:

- ✅ Share the same backend APIs
- ✅ Persist to the same database tables
- ✅ Use the same TanStack Query hooks (with extensions)
- ✅ Use the Canary Design System components

**Key Differences**:
- Tech-startup flow has 19 screens vs. 6 in the progressive flow
- Modern aesthetic (purple/blue gradients, Inter font, card layouts)
- Real-time price sidebar with premium calculations
- Enhanced payment and signature experience
- Modal-based editing workflows

---

## Environment Setup

### 1. Install Dependencies

```bash
# Install new dependencies for signature capture
npm install react-signature-canvas
npm install --save-dev @types/react-signature-canvas

# Install focus trap for accessible modals
npm install react-focus-lock

# Verify existing dependencies
npm list react react-router-dom @tanstack/react-query @sureapp/canary-design-system
```

### 2. Environment Variables

No new environment variables needed. The tech-startup flow uses the same configuration as the existing flow:

```bash
# .env (existing variables)
VITE_API_URL=http://localhost:3000/api/v1
DATABASE_URL=your_neon_database_url
```

### 3. Database Migration

Run the new migration to add the Signature table:

```bash
cd database
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

**Migration includes**:
- New `signature` table
- New `lienholder_party_id` column in `vehicle` table
- Indexes for performance

### 4. Google Fonts Setup

Add Inter font to `index.html` (already done in Phase 1):

```html
<!-- Add to <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
```

---

## Running Both Flows Side-by-Side

### Development Server

```bash
# Start backend (NestJS)
cd backend
npm run start:dev
# Backend runs on http://localhost:3000

# Start frontend (Vite)
cd ..
npm run dev
# Frontend runs on http://localhost:5173
```

### Access Both Flows

**Landing Page**: http://localhost:5173/
- Choose "Classic Flow" → `/quote/driver-info/new`
- Choose "Modern Flow" → `/quote-v2/get-started`

**Direct Access**:
- Classic flow: http://localhost:5173/quote/driver-info/new
- Tech-startup flow: http://localhost:5173/quote-v2/get-started

**Portal Access** (after completing either flow):
- http://localhost:5173/portal/{POLICY_NUMBER}/overview

---

## Project Structure

```
src/
├── pages/
│   ├── quote/                    # EXISTING - Classic flow (unchanged)
│   │   ├── PrimaryDriverInfo.tsx
│   │   ├── AdditionalDrivers.tsx
│   │   ├── VehiclesList.tsx
│   │   ├── VehicleConfirmation.tsx
│   │   ├── CoverageSelection.tsx
│   │   └── QuoteResults.tsx
│   │
│   └── quote-v2/                 # NEW - Tech-startup flow
│       ├── GetStarted.tsx        # Screen 1: Basic info
│       ├── EffectiveDate.tsx     # Screen 2: Policy start date
│       ├── EmailCollection.tsx   # Screen 3: Email + phone
│       ├── LoadingPrefill.tsx    # Screen 4: Mock service calls
│       ├── Summary.tsx           # Screen 5: Vehicle/driver cards + sidebar
│       ├── Coverage.tsx          # Screen 6: Coverage selection
│       ├── AddOns.tsx            # Screen 7: Optional coverages
│       ├── LoadingValidation.tsx # Screen 8: MVR lookup
│       ├── Review.tsx            # Screen 9: Coverage review
│       ├── Sign.tsx              # Screen 10: Signature ceremony
│       ├── Checkout.tsx          # Screen 11: Payment method
│       ├── Payment.tsx           # Screen 12: Credit card form
│       ├── Processing.tsx        # Screen 13: Payment processing
│       ├── Success.tsx           # Screen 14: Confirmation
│       │
│       ├── components/
│       │   ├── PriceSidebar.tsx           # Sticky sidebar (desktop) / bottom bar (mobile)
│       │   ├── LoadingAnimation.tsx       # Car icon + progress bar
│       │   ├── SignatureCanvas.tsx        # Signature pad wrapper
│       │   ├── ScreenProgress.tsx         # "Screen X of 19"
│       │   │
│       │   ├── modals/
│       │   │   ├── EditVehicleModal.tsx   # Edit vehicle info
│       │   │   ├── EditDriverModal.tsx    # Edit driver info
│       │   │   ├── SignatureModal.tsx     # Expanded signature pad
│       │   │   └── AccountCreationModal.tsx # New user signup
│       │   │
│       │   └── shared/
│       │       ├── TechStartupLayout.tsx  # Gradient background wrapper
│       │       └── TechStartupButton.tsx  # Gradient button component
│       │
│       └── contexts/
│           └── QuoteContext.tsx           # Shared quote state
│
├── hooks/
│   ├── useQuote.ts               # EXISTING - Extended for quote-v2
│   ├── useMockServices.ts        # NEW - Mock service hooks
│   └── useSignature.ts           # NEW - Signature CRUD hooks
│
├── services/
│   ├── quote-api.ts              # EXISTING - Extended for quote-v2
│   ├── signature-api.ts          # NEW - Signature API client
│   └── mock-api.ts               # EXISTING - Reused
│
└── utils/
    └── flowTracker.ts            # NEW - Prevent flow mixing
```

---

## Development Workflow

### 1. Create a New Screen Component

**Example**: Creating `GetStarted.tsx`

```typescript
// src/pages/quote-v2/GetStarted.tsx
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { Button, Input, Select } from '@sureapp/canary-design-system';
import { useNavigate } from 'react-router-dom';
import { useCreateQuote } from '@/hooks/useQuote';

export const GetStarted: React.FC = () => {
  const navigate = useNavigate();
  const createQuoteMutation = useCreateQuote();

  const handleSubmit = async (data: FormData) => {
    const quote = await createQuoteMutation.mutateAsync(data);
    navigate(`/quote-v2/effective-date/${quote.quote_number}`);
  };

  return (
    <TechStartupLayout>
      <div className="screen-container">
        <h1>Let's get started with your quote</h1>
        <form onSubmit={handleSubmit}>
          <Input label="First Name" name="first_name" required />
          <Input label="Last Name" name="last_name" required />
          <Input label="Date of Birth" name="birth_date" type="date" required />
          <Button type="submit" variant="primary">Continue</Button>
        </form>
      </div>
    </TechStartupLayout>
  );
};
```

### 2. Add Routes in App.tsx

```typescript
// src/App.tsx
import { RouteGuard } from '@/components/RouteGuard';

<Routes>
  {/* Existing classic flow */}
  <Route path="/quote/*" element={<RouteGuard flow="classic"><Outlet /></RouteGuard>}>
    <Route path="driver-info/:quoteNumber" element={<PrimaryDriverInfo />} />
    {/* ... other classic routes */}
  </Route>

  {/* NEW: Tech-startup flow */}
  <Route path="/quote-v2/*" element={<RouteGuard flow="tech-startup"><Outlet /></RouteGuard>}>
    <Route path="get-started" element={<GetStarted />} />
    <Route path="effective-date/:quoteNumber" element={<EffectiveDate />} />
    <Route path="email/:quoteNumber" element={<EmailCollection />} />
    {/* ... other tech-startup routes */}
  </Route>
</Routes>
```

### 3. Create TanStack Query Hooks

**Example**: Signature hooks

```typescript
// src/hooks/useSignature.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signatureApi } from '@/services/signature-api';

export const useCreateSignature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signatureApi.createSignature,
    onSuccess: (data) => {
      queryClient.setQueryData(['signatures', data.quote_id], data);
    },
  });
};

export const useSignature = (quoteId: string) => {
  return useQuery({
    queryKey: ['signatures', quoteId],
    queryFn: () => signatureApi.getSignatureByQuoteId(quoteId),
    enabled: !!quoteId,
  });
};
```

---

## Mock Services Usage

### Available Mock Services

All mock services from Phase 3 are reused:

```typescript
// src/services/mock-api.ts (EXISTING)

// VIN Decoder
const decodeVIN = async (vin: string) => {
  const response = await fetch(`${API_URL}/mock/vin-decode`, {
    method: 'POST',
    body: JSON.stringify({ vin }),
  });
  return response.json();
};

// Vehicle Valuation
const getVehicleValue = async (vin: string) => {
  const response = await fetch(`${API_URL}/mock/vehicle-value/${vin}`);
  return response.json();
};

// Insurance History
const getInsuranceHistory = async (driverInfo: DriverInfo) => {
  const response = await fetch(`${API_URL}/mock/insurance-history`, {
    method: 'POST',
    body: JSON.stringify(driverInfo),
  });
  return response.json();
};

// MVR Lookup
const getDriverRecord = async (licenseNumber: string, state: string) => {
  const response = await fetch(`${API_URL}/mock/driver-record`, {
    method: 'POST',
    body: JSON.stringify({ license_number: licenseNumber, license_state: state }),
  });
  return response.json();
};

// Safety Ratings
const getSafetyRating = async (year: number, make: string, model: string) => {
  const response = await fetch(`${API_URL}/mock/safety-rating/${year}/${make}/${model}`);
  return response.json();
};
```

### Using Mock Services in Loading Screens

**Example**: LoadingPrefill.tsx

```typescript
// src/pages/quote-v2/LoadingPrefill.tsx
import { useMockServices } from '@/hooks/useMockServices';
import { LoadingAnimation } from './components/LoadingAnimation';

export const LoadingPrefill: React.FC = () => {
  const { quote } = useQuoteContext();
  const [steps, setSteps] = useState([
    { label: 'Verifying insurance history', status: 'pending' },
    { label: 'Retrieving vehicle information', status: 'pending' },
    { label: 'Calculating premium', status: 'pending' },
  ]);

  useEffect(() => {
    const runMockServices = async () => {
      // Step 1: Insurance history
      setSteps(prev => updateStep(prev, 0, 'loading'));
      await mockApi.getInsuranceHistory(quote.driver);
      await delay(2000); // Simulate realistic delay
      setSteps(prev => updateStep(prev, 0, 'completed'));

      // Step 2: Vehicle info
      setSteps(prev => updateStep(prev, 1, 'loading'));
      await mockApi.decodeVIN(quote.vehicle.vin);
      await mockApi.getVehicleValue(quote.vehicle.vin);
      await delay(3000);
      setSteps(prev => updateStep(prev, 1, 'completed'));

      // Step 3: Premium calculation
      setSteps(prev => updateStep(prev, 2, 'loading'));
      await quoteApi.calculatePremium(quote.quote_id);
      await delay(2000);
      setSteps(prev => updateStep(prev, 2, 'completed'));

      // Navigate to next screen
      navigate(`/quote-v2/summary/${quote.quote_number}`);
    };

    runMockServices();
  }, []);

  return <LoadingAnimation steps={steps} />;
};
```

---

## Testing Strategy

### Unit Tests

Test individual components in isolation:

```typescript
// src/pages/quote-v2/__tests__/GetStarted.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GetStarted } from '../GetStarted';

describe('GetStarted', () => {
  it('renders form fields', () => {
    render(<GetStarted />);
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<GetStarted />);
    fireEvent.click(screen.getByText('Continue'));
    expect(await screen.findByText('First name is required')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test full flow end-to-end:

```typescript
// tests/integration/quote-v2-flow.spec.ts
describe('Tech Startup Quote Flow', () => {
  it('completes full quote flow', async () => {
    // Start at GetStarted
    await page.goto('http://localhost:5173/quote-v2/get-started');

    // Fill basic info
    await page.fill('[name="first_name"]', 'John');
    await page.fill('[name="last_name"]', 'Doe');
    await page.click('button[type="submit"]');

    // Verify navigation to EffectiveDate
    await page.waitForURL('**/quote-v2/effective-date/**');

    // Continue through flow...
    // (Add more steps as screens are implemented)
  });
});
```

### Testing Mock Services

```typescript
// backend/tests/mock-services.test.ts
describe('Mock Services', () => {
  it('VIN decoder returns realistic data', async () => {
    const result = await mockServices.decodeVIN('1HGBH41JXMN109186');
    expect(result.make).toBe('Honda');
    expect(result.model).toBe('Civic');
    expect(result.year).toBe(2021);
  });

  it('handles invalid VIN', async () => {
    await expect(mockServices.decodeVIN('INVALID')).rejects.toThrow('Invalid VIN format');
  });
});
```

---

## Canary Design System Reference

### Core Components Used in Tech-Startup Flow

```typescript
import {
  Button,
  Card,
  Input,
  Select,
  Checkbox,
  Toggle,
  Slider,
  Modal,
  Badge,
  Spinner,
  Alert,
} from '@sureapp/canary-design-system';
```

### Component Styling Patterns

**Buttons** (FR-024):
```typescript
<Button
  variant="primary"
  size="large"
  className="tech-startup-button" // Apply gradient via CSS
>
  Continue
</Button>
```

**Cards** (FR-025):
```typescript
<Card
  className="tech-startup-card"
  hoverable={true}
  onClick={handleEdit}
>
  <h3>Vehicle 1</h3>
  <p>2021 Honda Civic</p>
</Card>
```

**Sliders** (FR-029):
```typescript
<Slider
  label="Bodily Injury Liability"
  min={25000}
  max={500000}
  step={25000}
  value={coverageLimit}
  onChange={(value) => handleCoverageChange('BI', value)}
  marks={[
    { value: 25000, label: '$25k' },
    { value: 250000, label: '$250k' },
    { value: 500000, label: '$500k' },
  ]}
/>
```

**Toggles** (FR-028):
```typescript
<Toggle
  label="Rental Car Reimbursement"
  checked={hasRentalCoverage}
  onChange={setHasRentalCoverage}
/>
```

### Tech-Startup Styling Scoped via CSS

```css
/* TechStartupLayout.css */
.tech-startup-layout {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 100%);
}

.tech-startup-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: transform 0.2s, box-shadow 0.2s;
}

.tech-startup-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.tech-startup-card {
  border-radius: 16px;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.tech-startup-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transform: translateY(-4px);
}
```

---

## Signature Canvas Integration

### Basic Signature Component

```typescript
// src/pages/quote-v2/components/SignatureCanvas.tsx
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from 'react';
import { Button } from '@sureapp/canary-design-system';

interface SignatureCanvasComponentProps {
  onSave: (signature: string) => void;
}

export const SignatureCanvasComponent: React.FC<SignatureCanvasComponentProps> = ({ onSave }) => {
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
    <div className="signature-canvas-wrapper">
      <SignatureCanvas
        ref={sigPadRef}
        canvasProps={{
          width: 500,
          height: 200,
          className: 'signature-canvas',
        }}
      />
      <div className="signature-actions">
        <Button variant="secondary" onClick={handleClear}>Clear</Button>
        <Button variant="primary" onClick={handleSave}>Accept</Button>
      </div>
    </div>
  );
};
```

### Saving Signature to Backend

```typescript
// src/pages/quote-v2/Sign.tsx
import { useCreateSignature } from '@/hooks/useSignature';
import { SignatureCanvasComponent } from './components/SignatureCanvas';

export const Sign: React.FC = () => {
  const { quote } = useQuoteContext();
  const createSignatureMutation = useCreateSignature();
  const navigate = useNavigate();

  const handleSaveSignature = async (signatureData: string) => {
    await createSignatureMutation.mutateAsync({
      quote_id: quote.quote_id,
      party_id: quote.primary_insured_party_id,
      signature_image_data: signatureData,
      signature_format: 'PNG',
    });

    navigate(`/quote-v2/checkout/${quote.quote_number}`);
  };

  return (
    <TechStartupLayout>
      <h1>Sign Your Policy</h1>
      <p>Please sign below to accept your coverage</p>
      <SignatureCanvasComponent onSave={handleSaveSignature} />
    </TechStartupLayout>
  );
};
```

---

## Debugging Tips

### React DevTools

Install the React DevTools browser extension to inspect component hierarchy and props:

```bash
# View component tree
# View TanStack Query cache
# Inspect QuoteContext state
```

### TanStack Query DevTools

Enable in development:

```typescript
// src/App.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**Features**:
- View all queries and their cache status
- Manually refetch queries
- Invalidate cached data
- View query timeline

### Console Logging Quote Flow

```typescript
// Add to QuoteContext for debugging
useEffect(() => {
  console.log('[QuoteContext] Quote updated:', quote);
}, [quote]);

// Add to navigation
const navigate = useNavigate();
const navigateWithLog = (path: string) => {
  console.log('[Navigation]', path);
  navigate(path);
};
```

### Network Inspection

Use browser DevTools Network tab:
- Filter by `/api/v1/` to see API calls
- Check request/response payloads
- Verify status codes (200, 201, 400, 404, etc.)

---

## Common Issues

### Issue 1: Flow Mixing Error

**Symptom**: Redirected to landing page when navigating between flows

**Cause**: RouteGuard detects active flow mismatch

**Solution**: Clear session storage or complete current flow before switching

```typescript
// Clear active flow manually
sessionStorage.removeItem('active_quote_flow');
```

### Issue 2: Price Sidebar Not Updating

**Symptom**: Premium doesn't update after coverage change

**Cause**: TanStack Query cache not invalidated

**Solution**: Ensure `recalculatePremium()` is called after coverage update

```typescript
const handleCoverageChange = async (coverageType: string, limit: number) => {
  await updateCoverageMutation.mutateAsync({ quoteId, coverages: { [coverageType]: limit } });
  await recalculatePremium(); // <-- Essential for sidebar update
};
```

### Issue 3: Signature Canvas Not Capturing Touch Input

**Symptom**: Signature pad works with mouse but not touch

**Cause**: react-signature-canvas requires touch events enabled

**Solution**: Ensure canvas has proper touch handlers (react-signature-canvas handles this automatically, but check CSS pointer-events)

```css
.signature-canvas {
  touch-action: none; /* Prevent default touch behavior */
  cursor: crosshair;
}
```

### Issue 4: Modal Focus Trap Not Working

**Symptom**: Tab key exits modal instead of cycling through elements

**Cause**: react-focus-lock not properly wrapping modal content

**Solution**: Ensure FocusLock wraps entire modal content

```typescript
<Modal isOpen={isOpen}>
  <FocusLock>
    <div role="dialog" aria-modal="true">
      {/* All modal content here */}
    </div>
  </FocusLock>
</Modal>
```

---

## Additional Resources

- **SpecKit Documentation**: [.specify/README.md](.specify/README.md)
- **Constitution**: [.specify/memory/constitution.md](.specify/memory/constitution.md)
- **Feature Spec**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Research Findings**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/](./contracts/)

**Need Help?**
- Check the existing `/quote/*` flow for reference patterns
- Review Phase 3-5 implementation for backend patterns
- Consult the Canary Design System documentation
- Ask questions in the team chat or create a GitHub issue

---

**Happy Coding!** 🚀
