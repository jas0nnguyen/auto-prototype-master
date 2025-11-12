# Phase 1: Setup (Dependencies & Project Structure) - Tasks T001-T020

**Completed**: 2025-11-09
**Goal**: Install new dependencies and create directory structure for the quote-v2 flow (parallel implementation alongside existing /quote/* flow)

---

## What We Built

Phase 1 laid the groundwork for implementing a parallel quote flow with a modern tech-startup aesthetic. This is the **first phase** of building a completely new user experience that runs side-by-side with the existing classic flow without interfering with it.

### 1. **New NPM Dependencies** (T001-T002)

We installed two specialized libraries that aren't part of the existing flow:

#### **react-signature-canvas** (T001)
```bash
npm install react-signature-canvas@^1.0.0 @types/react-signature-canvas
```

**What it does**: Provides a signature pad component where users can draw their signature with mouse or touch input.

**Why we need it**: The tech-startup flow includes a "signing ceremony" screen where users must sign their insurance application digitally. This is more modern and legally binding than just clicking "I agree."

**Technical details**:
- Version: 1.0.7 (installed)
- Size: ~15KB gzipped (lightweight!)
- TypeScript support: Full type definitions included
- Browser support: Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Touch support: Works on mobile devices and tablets

**How it works**:
```typescript
// Basic usage (we'll implement this in Phase 4)
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = () => {
  const sigPadRef = useRef<SignatureCanvas>(null);

  // Clear the signature
  const handleClear = () => {
    sigPadRef.current?.clear();
  };

  // Save signature as PNG image (base64 data)
  const handleSave = () => {
    const dataURL = sigPadRef.current?.toDataURL('image/png');
    // Send to backend API to store in database
  };

  return (
    <SignatureCanvas
      ref={sigPadRef}
      canvasProps={{ width: 500, height: 200 }}
    />
  );
};
```

**The Restaurant Analogy**: This is like a digital signature pad at the credit card terminal - customers sign on the screen instead of paper.

---

#### **react-focus-lock** (T002)
```bash
npm install react-focus-lock@^2.9.0
```

**What it does**: Traps keyboard focus inside modal dialogs for accessibility.

**Why we need it**: The tech-startup flow has 6 modal dialogs (EditVehicle, EditDriver, Signature, AccountCreation, Validation, EditVehicleFinanced). When a modal opens, users should only be able to Tab through elements *inside* the modal, not the background page.

**Technical details**:
- Version: 2.13.6 (installed)
- Size: ~5KB gzipped
- WCAG 2.1 AA compliant (accessibility standard)
- Works with screen readers

**Why accessibility matters**:
- **Keyboard navigation**: Users who can't use a mouse need to Tab through the modal
- **Screen readers**: Blind users need focus to stay in the modal so they don't get confused
- **Legal requirement**: ADA (Americans with Disabilities Act) requires accessible websites

**How it works**:
```typescript
import FocusLock from 'react-focus-lock';

const EditVehicleModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <FocusLock>
        <div className="modal-content">
          <h2>Edit Vehicle</h2>
          <input type="text" placeholder="Make" />  {/* First Tab stop */}
          <input type="text" placeholder="Model" /> {/* Second Tab stop */}
          <button onClick={onClose}>Save</button>  {/* Third Tab stop */}
          {/* Tab cycles back to "Make" input - can't escape to background */}
        </div>
      </FocusLock>
    </div>
  );
};
```

**The Restaurant Analogy**: When a customer is at the payment counter (modal), they shouldn't accidentally wander to the kitchen (background page). Focus lock keeps them at the counter until they finish paying.

---

### 2. **Inter Font Integration** (T003)

We added Google Fonts to load the Inter typeface, which gives the tech-startup flow its modern look.

**What we added to index.html**:
```html
<!-- Google Fonts: Inter -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
```

**Breaking it down line by line**:

1. **`<link rel="preconnect" href="https://fonts.googleapis.com">`**
   - Tells the browser to establish a connection to Google's font server *before* it's needed
   - Saves ~100-200ms when the actual font request happens
   - Like calling ahead to make a restaurant reservation instead of showing up and waiting

2. **`<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`**
   - Preconnects to the CDN (Content Delivery Network) where font files are stored
   - `crossorigin` required because fonts are loaded from a different domain
   - Security feature to prevent malicious font injection

3. **`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">`**
   - Loads the actual Inter font with 4 weights:
     - `400` = Regular (normal body text)
     - `600` = Semi-Bold (subheadings, h4 tags)
     - `700` = Bold (h3, h2 tags)
     - `800` = Extra Bold (h1 tags, hero text)
   - `display=swap` tells browser to show fallback font immediately, then swap to Inter when loaded
   - Prevents "invisible text" while font loads (FOIT - Flash of Invisible Text)

**How to use Inter in CSS** (we'll do this in Phase 5):
```css
/* Apply to tech-startup flow only (scoped) */
.tech-startup-layout {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Heading styles */
.tech-startup-layout h1 {
  font-weight: 800;  /* Extra Bold */
  font-size: 52px;
}

.tech-startup-layout h2 {
  font-weight: 700;  /* Bold */
  font-size: 36px;
}

.tech-startup-layout h3 {
  font-weight: 700;  /* Bold */
  font-size: 24px;
}

.tech-startup-layout h4 {
  font-weight: 600;  /* Semi-Bold */
  font-size: 18px;
}

.tech-startup-layout body, .tech-startup-layout p {
  font-weight: 400;  /* Regular */
  font-size: 16px;
}
```

**Why Inter?**
- Modern, clean sans-serif designed specifically for computer screens
- High readability at small sizes (12px+)
- Used by tech companies (GitHub, Stripe, Vercel, Airbnb)
- Free and open source

**The Restaurant Analogy**: Inter is like the restaurant's menu font - clean, easy to read, matches the modern vibe. You wouldn't use Comic Sans at a 5-star restaurant!

---

### 3. **Frontend Directory Structure** (T004-T011)

We created a complete directory tree for the new quote-v2 flow:

```
src/
├── pages/quote-v2/              ← All 19 screens go here
│   ├── components/              ← 5 reusable components (PriceSidebar, LoadingAnimation, etc.)
│   │   ├── modals/              ← 6 modal dialogs
│   │   └── shared/              ← 2 shared UI wrappers (TechStartupLayout, TechStartupButton)
│   └── contexts/                ← QuoteContext provider (state management)
├── hooks/                       ← Custom React hooks (useSignature, useMockServices)
├── utils/flowTracker.ts         ← Route protection logic (prevents mixing flows)
└── services/signature-api.ts    ← HTTP client for Signature API
```

**Why separate directories?**

**`pages/quote-v2/`**: Isolates the new flow from the existing `/quote/*` pages
- Architectural Requirement AR-001: "System MUST preserve all existing /quote/* routes and pages unchanged"
- If we put new screens in `pages/quote/`, we risk accidentally modifying the classic flow
- Clean separation makes it easy to delete the old flow later if we want

**`components/`**: Reusable pieces used by multiple screens
- Example: PriceSidebar appears on 7 different screens (Summary, Coverage, AddOns, Review, etc.)
- Instead of copying the same code 7 times, we write it once in `components/PriceSidebar.tsx`
- If we need to fix a bug or change styling, we only update one file

**`components/modals/`**: Popup dialogs that overlay the screen
- 6 modals total: EditVehicle, EditVehicleFinanced, EditDriver, Signature, AccountCreation, Validation
- Modals have special behavior (focus locking, ESC key handling, backdrop clicks)
- Grouping them together makes it easy to apply consistent modal patterns

**`components/shared/`**: Layout wrappers and styled buttons
- TechStartupLayout: Wraps every screen with gradient background, Inter font, consistent spacing
- TechStartupButton: Styled button with purple gradient (reused 20+ times)
- Ensures consistent look without copying CSS to every screen

**`contexts/`**: React Context for global state
- QuoteContext provides quote data to all screens without prop drilling
- "Prop drilling" = passing data through 5 layers of components (slow, messy)
- Context = global data store accessible anywhere in the quote-v2 flow

**`hooks/`**: Custom React hooks (reusable logic)
- `useSignature()` - Fetch/create signatures via TanStack Query
- `useMockServices()` - Orchestrate mock API calls (VIN decoder, insurance history, etc.)
- Hooks extract complex logic from components to keep them clean

**`utils/flowTracker.ts`**: Session storage utility
- Tracks which flow the user is in ('classic' or 'tech-startup')
- Prevents users from starting in `/quote/*` and accidentally navigating to `/quote-v2/*`
- Stores in sessionStorage (persists across page refreshes, cleared when browser tab closes)

**`services/signature-api.ts`**: HTTP client
- Wrapper around `fetch()` for calling backend Signature API
- Methods: `createSignature()`, `getSignatureByQuoteId()`
- Handles error responses, JSON parsing, authentication headers

**The Restaurant Analogy**:
- `pages/quote-v2/` = Dining rooms (each screen is a different room)
- `components/` = Kitchen equipment (shared tools like ovens, mixers)
- `components/modals/` = Special event spaces (private rooms for specific occasions)
- `components/shared/` = Restaurant decor theme (consistent wallpaper, lighting)
- `contexts/` = Restaurant's order system (kitchen knows what every table ordered)
- `hooks/` = Chef's recipes (reusable cooking techniques)
- `utils/flowTracker.ts` = Host tracking which dining room customers chose
- `services/signature-api.ts` = Phone for calling suppliers

---

### 4. **Backend Directory Structure** (T012-T013)

We created placeholder files for the Signature backend service:

```
backend/src/
├── api/routes/signatures.controller.ts  ← NestJS controller (REST endpoints)
└── services/signature-service/          ← Business logic directory
```

**`signatures.controller.ts`**: HTTP request handler (empty file for now)
- Will implement in Phase 2:
  - POST `/api/v1/signatures` - Create new signature
  - GET `/api/v1/signatures/:quoteId` - Get signature by quote ID
- Uses NestJS decorators (`@Post()`, `@Get()`, `@Body()`)

**`signature-service/`**: Business logic layer (empty directory for now)
- Will implement in Phase 2:
  - `signature.service.ts` - SignatureService class
  - Methods: `createSignature()`, `getSignatureByQuoteId()`, `validateSignature()`
  - Handles database operations, validation, error handling

**Why separate controller and service?**
- **Controller**: Handles HTTP stuff (parsing request body, returning status codes)
- **Service**: Handles business logic (database queries, validation rules)
- Separation of concerns = easier to test, reuse, maintain

**NestJS Architecture Pattern**:
```
HTTP Request → Controller → Service → Database
HTTP Response ← Controller ← Service ← Database
```

**The Restaurant Analogy**:
- Controller = Waiter (takes orders, delivers food)
- Service = Chef (prepares food, follows recipes)
- Database = Storage room (ingredients, inventory)

---

### 5. **Database Directory Structure** (T014-T015)

We created a schema file for the new Signature entity:

```
database/
├── schema/signature.schema.ts   ← Drizzle ORM schema (empty file for now)
└── migrations/                  ← SQL migration files (directory exists)
```

**`signature.schema.ts`**: TypeScript schema definition (empty file for now)
- Will implement in Phase 2 using Drizzle ORM
- Defines the `signature` table with 10 fields:
  - `signature_id` (UUID primary key)
  - `quote_id` (UUID foreign key to quotes table)
  - `party_id` (UUID foreign key to parties table)
  - `signature_image_data` (TEXT - base64 PNG data)
  - `signature_format` (VARCHAR - 'PNG' or 'JPEG')
  - `signature_date` (TIMESTAMP)
  - `ip_address` (VARCHAR - for audit trail)
  - `user_agent` (TEXT - browser info)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

**`migrations/`**: SQL migration files (directory already exists)
- Will create `0002_add_signature_table.sql` in Phase 2
- Migrations are like Git commits for your database schema
- Track schema changes over time
- Can roll back if something breaks

**Why store signatures in the database?**
- Legal requirement: Insurance applications must be signed
- Audit trail: Track when and who signed (ip_address, user_agent, signature_date)
- Compliance: Signatures must be retrievable for 7 years (insurance regulations)
- Integration: Portal needs to display signature on policy documents

**The Restaurant Analogy**:
- Schema = Recipe card template (what ingredients are required, in what amounts)
- Migrations = Recipe version history (v1: added salt, v2: changed baking time)
- Database table = Recipe box (storage for all the actual recipe cards)

---

### 6. **Test Directory Structure** (T016)

We created a testing directory tree:

```
tests/quote-v2/
├── unit/
│   ├── components/   ← Component tests (PriceSidebar, LoadingAnimation, etc.)
│   └── hooks/        ← Hook tests (useSignature, useMockServices)
└── integration/      ← End-to-end flow tests (full quote flow)
```

**Why separate unit and integration tests?**

**Unit tests**: Test individual pieces in isolation
- Example: "Does PriceSidebar display the correct premium amount?"
- Fast (milliseconds)
- Easy to debug (if it fails, you know exactly which component broke)
- Run on every code change

**Integration tests**: Test multiple pieces working together
- Example: "Can user complete full quote flow from GetStarted to Success?"
- Slower (seconds to minutes)
- Harder to debug (failure could be in any component)
- Run before deployment

**Testing pyramid**:
```
       /\
      /  \  Integration (few tests, slow, high value)
     /____\
    /      \  Unit (many tests, fast, catch bugs early)
   /________\
```

**The Restaurant Analogy**:
- Unit tests = Taste-testing individual ingredients (is the salt salty? is the sugar sweet?)
- Integration tests = Taste-testing the finished dish (does the whole recipe work together?)

---

## Files Created/Modified

### **Created Directories** (13 total):
1. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote-v2/`
2. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote-v2/components/`
3. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote-v2/components/modals/`
4. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote-v2/components/shared/`
5. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote-v2/contexts/`
6. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/hooks/`
7. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/signature-service/`
8. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/tests/quote-v2/`
9. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/tests/quote-v2/unit/`
10. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/tests/quote-v2/unit/components/`
11. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/tests/quote-v2/unit/hooks/`
12. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/tests/quote-v2/integration/`

### **Created Empty Files** (4 total):
1. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/utils/flowTracker.ts`
2. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/services/signature-api.ts`
3. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/routes/signatures.controller.ts`
4. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/signature.schema.ts`

### **Modified Files** (3 total):
1. `index.html` - Added Inter font links (lines 35-38)
2. `package.json` - Added react-signature-canvas@1.0.7 and react-focus-lock@2.13.6
3. `specs/004-tech-startup-flow-redesign/tasks.md` - Marked T001-T020 complete

---

## Key Concepts Learned

### 1. **Parallel Implementation Strategy**

**What it means**: Building a new feature alongside the old one without breaking anything.

**Why we did this**:
- Existing `/quote/*` flow is in production with real users
- Can't afford downtime or bugs while building new flow
- Users can choose which flow they prefer (A/B testing)
- Easy to roll back if new flow has issues

**How we achieved isolation**:
- New routes: `/quote-v2/*` (completely separate from `/quote/*`)
- New directory: `src/pages/quote-v2/` (no shared code with old flow)
- Same backend APIs: Both flows use existing Quote API (no duplication)
- Same database: Both flows store data in same tables (no schema changes yet)

**Real-world analogy**: Building a new highway next to the old one while traffic still flows on the old highway. Once the new highway is done and tested, you can redirect traffic.

---

### 2. **Dependency Management with npm**

**What is npm?**: Node Package Manager - a tool for installing third-party libraries.

**Basic commands**:
```bash
npm install react-signature-canvas     # Install package
npm install react-focus-lock@^2.9.0    # Install specific version
npm list react-signature-canvas        # Verify installation
npm uninstall react-signature-canvas   # Remove package
```

**What happens when you run `npm install`?**
1. npm downloads the package from npmjs.com
2. Extracts files to `node_modules/` directory
3. Updates `package.json` (lists all dependencies)
4. Creates/updates `package-lock.json` (locks exact versions)

**Why lock versions?**
- `"react-signature-canvas": "^1.0.0"` means "1.0.0 or higher (up to 2.0.0)"
- `^` = caret (allows minor/patch updates, not major)
- `~` = tilde (allows patch updates only)
- No symbol = exact version

**Security vulnerabilities**:
- npm audit found 11 vulnerabilities (10 moderate, 1 high)
- These are in *dependencies of dependencies* (transitive dependencies)
- Not critical for a demo app (would fix before production)
- Run `npm audit fix` to auto-update safe fixes

---

### 3. **TypeScript Type Safety**

**What is TypeScript?**: JavaScript with types (prevents bugs at compile time).

**Example without TypeScript** (JavaScript - bugs at runtime):
```javascript
// JavaScript - no error until runtime
function addNumbers(a, b) {
  return a + b;
}

addNumbers(5, "10");  // Returns "510" (string concatenation - BUG!)
```

**Example with TypeScript** (compile-time error):
```typescript
// TypeScript - error before code even runs
function addNumbers(a: number, b: number): number {
  return a + b;
}

addNumbers(5, "10");  // ❌ ERROR: Argument of type 'string' is not assignable to parameter of type 'number'
```

**Why we installed `@types/react-signature-canvas`**:
- react-signature-canvas is written in JavaScript (no types)
- @types/react-signature-canvas adds TypeScript definitions
- Now TypeScript knows the API: `sigPadRef.current?.toDataURL('image/png')`
- Autocomplete works in VSCode
- Catch typos before running code

---

### 4. **Google Fonts CDN**

**What is a CDN?**: Content Delivery Network - fast servers around the world.

**Why use Google Fonts CDN instead of self-hosting?**
1. **Performance**: Google has servers in 200+ countries (faster than our server)
2. **Caching**: If user visited another site using Inter, it's already cached
3. **Optimization**: Google auto-serves .woff2 format (smallest, best compression)
4. **Zero config**: Just add `<link>` tag, it works

**How Google Fonts works**:
```
User visits → Browser sees <link> → Requests CSS from fonts.googleapis.com
→ CSS says "download Inter-Bold.woff2 from fonts.gstatic.com"
→ Browser downloads font file → Applies to text
```

**Why preconnect?**:
- Normal: Browser waits until it sees `<link>`, then establishes TCP connection (~150ms)
- Preconnect: Browser establishes connection *while* parsing HTML (~0ms when font is needed)
- Saves 100-200ms on first page load

---

### 5. **Directory Structure Best Practices**

**Feature-based organization** (what we used):
```
src/pages/quote-v2/       ← Feature: quote-v2 flow
  components/             ← Components used only in this feature
  contexts/               ← Context used only in this feature
```

**Alternative: Type-based organization** (NOT what we used):
```
src/
  components/             ← ALL components (mixing features)
  contexts/               ← ALL contexts (mixing features)
```

**Why feature-based is better**:
- Easier to delete a feature (delete one folder)
- Easier to find code (everything related in one place)
- Easier to reuse (copy folder to new project)
- Scales better (100+ components don't all live in one folder)

---

### 6. **React Hooks**

**What are hooks?**: Functions that let you "hook into" React features.

**Built-in hooks**:
- `useState()` - Store component state (like variables, but triggers re-render)
- `useEffect()` - Run code after render (like fetching data, subscribing to events)
- `useRef()` - Store mutable value that doesn't trigger re-render (like DOM references)
- `useContext()` - Access global state from Context

**Custom hooks**: Your own reusable functions that use built-in hooks
```typescript
// Custom hook: useSignature
function useSignature(quoteId: string) {
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/signatures/${quoteId}`)
      .then(res => res.json())
      .then(data => setSignature(data))
      .finally(() => setLoading(false));
  }, [quoteId]);

  return { signature, loading };
}

// Usage in component
function SignatureDisplay({ quoteId }) {
  const { signature, loading } = useSignature(quoteId);

  if (loading) return <p>Loading...</p>;
  return <img src={signature.imageData} />;
}
```

---

## The Restaurant Analogy

Phase 1 is like **planning to open a second restaurant location with a different theme**:

✅ **Ordered new equipment** (npm dependencies):
- Signature pad (react-signature-canvas) = Digital signature tablet
- Focus lock (react-focus-lock) = Child safety locks on private room doors

✅ **Designed the new location's signage** (Inter font):
- Modern, clean font for menus, signs, and decor
- Consistent with tech-startup vibe (like choosing Helvetica instead of Comic Sans)

✅ **Built the new restaurant layout** (directory structure):
- Dining rooms (pages/quote-v2)
- Kitchen areas (components, contexts)
- Storage rooms (services, utils)
- Special event spaces (modals)
- Testing kitchen (tests/quote-v2)

✅ **Prepared placeholder recipe cards** (empty files):
- flowTracker.ts = Host's seating chart
- signature-api.ts = Phone book for suppliers
- signatures.controller.ts = Waiter's order pad
- signature.schema.ts = Ingredient storage labels

✅ **Verified everything compiles** (npm run build):
- Made sure all the blueprints are correct
- Kitchen equipment fits in the spaces
- No typos in the menu

❌ **Haven't done yet**:
- Hired staff (implemented services)
- Stocked ingredients (database schemas)
- Trained chefs (business logic)
- Opened for customers (frontend screens)

**Current state**: You have the restaurant building, the equipment, and the plans. Now you need to stock the kitchen, hire staff, and create the menu (Phase 2).

---

## Next Steps: Phase 2 Preview

Phase 2 (Foundational) will build the core infrastructure:

1. **Database Schema** (Signature entity, Vehicle extension)
2. **Backend Services** (SignatureService, database migrations)
3. **Frontend Foundation** (QuoteContext, RouteGuard, TechStartupLayout)
4. **Routing Infrastructure** (Flow selector, route protection)

After Phase 2, we'll have a working foundation to build the 19 screens on top of.

---

**Total Progress**: 20/330 tasks complete (6%)

**Phase 1 Status**: ✅ **COMPLETE** - All dependencies installed, directory structure created, build verified
