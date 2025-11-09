# Feature 003 - Phase 1: Setup (Tasks T001-T004)

**Completed**: 2025-11-09
**Goal**: Install dependencies and configure environment for document rendering and download feature

---

## What We Built

Phase 1 set up the foundation for the document rendering system by installing the necessary libraries and configuring Vercel Blob storage for generated PDFs.

### 1. Template Engine Installation (T001)

**What we installed**: Handlebars.js template engine

```bash
npm install handlebars @types/handlebars --save
```

**What it does**: Handlebars allows us to merge dynamic data into HTML templates to create personalized documents.

**Think of it like**: Mad Libs for web pages. You create an HTML template with placeholders like `{{policyholder_name}}`, and Handlebars fills them in with real data.

**Example**:
```html
<!-- Template -->
<h1>Hello {{name}}!</h1>

<!-- + Data -->
{
  "name": "John Smith"
}

<!-- = Result -->
<h1>Hello John Smith!</h1>
```

For insurance documents, we'll use this to fill policy numbers, vehicle details, coverage amounts, etc. into the declarations page template.

**Why Handlebars?**
- Matches the syntax of our existing HTML template (`{{variable}}`)
- Auto-escapes HTML (prevents security issues)
- Has built-in TypeScript types (`@types/handlebars`)
- Simple and well-documented

---

### 2. Serverless PDF Generation (T002)

**What we installed**: @sparticuz/chromium

```bash
npm install @sparticuz/chromium --save
```

**What it does**: This is a special version of the Chromium browser (the engine behind Google Chrome) that's been optimized to run in serverless environments like Vercel.

**Why do we need a browser?** To convert HTML documents into PDFs, we need to render them exactly as they would appear in a web browser, then save that as a PDF file.

**Think of it like**: Taking a screenshot of a webpage and saving it as a PDF, but doing it automatically on the server.

**The Restaurant Analogy**:
- Regular Chromium: Full sit-down restaurant with dining room, kitchen, storage
- @sparticuz/chromium: Food truck - same quality food, but stripped down to essentials to fit in a small space (serverless function)

**Why @sparticuz/chromium specifically?**
- **Regular Chromium**: ~300MB - Too large for Vercel's 50MB function limit
- **@sparticuz/chromium**: ~40MB (Brotli-compressed) - Fits perfectly in serverless
- Optimized for fast startup (important for serverless "cold starts")
- Works with Playwright (already in our project for testing)

---

### 3. File Storage SDK (T003)

**What we installed**: @vercel/blob

```bash
npm install @vercel/blob --save
```

**What it does**: Vercel Blob is a cloud storage service for files (like AWS S3, but simpler). This SDK lets us upload PDF files and get download links.

**Think of it like**: Google Drive or Dropbox - you upload files, get a link to share them.

**How it works**:
1. Generate PDF from HTML template
2. Upload PDF to Vercel Blob → Get back a URL
3. Save URL in database
4. When user clicks "Download", redirect them to that URL

**Why Vercel Blob?**
- **Cost**: ~$4/month for 10,000 policies (well under $50 budget)
- **Speed**: CDN-optimized (files served from closest data center)
- **Simple**: 3 lines of code to upload a file
- **Integrated**: Built by Vercel, works seamlessly with Vercel deployment

**Cost Breakdown** (from research.md):
- 10,000 policies × 5 documents each = 50,000 files
- Average file size: 500KB (declarations page PDF)
- Total storage: 25GB
- Storage cost: 25GB × $0.023/GB = **$0.58/month**
- Bandwidth cost: ~$2.50/month
- Total: ~$3.28/month 🎉

---

### 4. Environment Configuration (T004)

**What we configured**: Vercel Blob authentication token

**File modified**: `.env`

**What we added**:
```bash
# ============================================
# VERCEL BLOB STORAGE (Document Generation)
# ============================================
# Get your token from: https://vercel.com/dashboard/stores
# Instructions: See specs/003-portal-document-download/quickstart.md
# IMPORTANT: Replace 'your_vercel_blob_token_here' with actual token
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

**What is an environment variable?**
- A configuration value stored outside of code
- Keeps secrets (like API tokens) out of git
- Different values for development vs production

**Think of it like**: The combination to a safe. You don't write it in your code (where everyone can see it), you keep it in a secure place and reference it when needed.

**How to get the token**:
1. Go to https://vercel.com/dashboard
2. Navigate to "Storage" → "Blob"
3. Create a new Blob store (or use existing)
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Replace `your_vercel_blob_token_here` in `.env`

**Security note**: The `.env` file is already in `.gitignore`, so this token won't be committed to git. Good!

---

## Files Created/Modified

### Modified Files:
1. **`package.json`** (automatically updated by npm)
   - Added `handlebars` and `@types/handlebars`
   - Added `@sparticuz/chromium`
   - Added `@vercel/blob`

2. **`package-lock.json`** (automatically updated by npm)
   - Locked dependency versions
   - Added 98 new packages total (including sub-dependencies)

3. **`.env`** (manually edited)
   - Added Vercel Blob configuration section
   - Added `BLOB_READ_WRITE_TOKEN` placeholder

4. **`specs/003-portal-document-download/tasks.md`** (tracked progress)
   - Marked T001-T004 as complete ✅
   - Updated progress: 4/51 tasks (8%)
   - Marked Phase 1 as COMPLETE

### Created Files:
- None (Phase 1 is setup only, no new source files)

---

## Key Concepts Learned

### 1. npm install Command

**Syntax**: `npm install <package-name> --save`

**What it does**:
- Downloads the package from npm registry
- Installs it in `node_modules/` directory
- Updates `package.json` with the new dependency
- Updates `package-lock.json` to lock the exact version

**--save flag**: Adds package to `dependencies` section of package.json (required for production)

**Alternative flags**:
- `--save-dev` or `-D`: Adds to `devDependencies` (only needed for development)
- `--global` or `-g`: Installs globally (available system-wide)

### 2. TypeScript Type Definitions (@types/*)

**What are @types packages?**
- TypeScript definitions for JavaScript libraries
- Provide autocomplete and type checking in IDEs
- Prevent errors by catching type mismatches at compile time

**Example**: `handlebars` is JavaScript, so TypeScript doesn't know its types. `@types/handlebars` teaches TypeScript about Handlebars' structure.

**When installed**:
```typescript
import Handlebars from 'handlebars';

// TypeScript knows this is valid:
const template = Handlebars.compile('<h1>{{title}}</h1>');

// TypeScript catches this error:
const bad = Handlebars.compil('<h1>{{title}}</h1>'); // Error: Property 'compil' does not exist
```

### 3. Serverless Functions

**What is "serverless"?**
- Your code runs on-demand, not on a 24/7 server
- Only pay for execution time (not idle time)
- Auto-scales up and down based on traffic

**The Tradeoff**:
- **Pro**: Cost-effective, auto-scaling, no server management
- **Con**: "Cold starts" (first request after idle is slower)

**Why it matters for PDF generation**:
- Generating PDFs is resource-intensive
- With serverless, we only pay when generating
- With traditional server, we'd pay 24/7 even if not generating

**Vercel Functions**:
- Default timeout: 10 seconds
- Max timeout: 60 seconds (requires Vercel Pro plan)
- Memory: 512MB-1GB (configurable)

### 4. Environment Variables in Node.js

**How to use in code**:
```typescript
// Access environment variable
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

// Check if it's configured
if (!blobToken) {
  throw new Error('BLOB_READ_WRITE_TOKEN not configured');
}
```

**Why use .env files?**
- **Security**: Keep secrets out of code
- **Flexibility**: Different values per environment (dev/staging/prod)
- **Team collaboration**: Each developer has their own tokens

**Best practices**:
- ✅ Add `.env` to `.gitignore`
- ✅ Provide `.env.example` with placeholder values
- ✅ Document how to get tokens in README/quickstart
- ❌ Never commit real tokens to git
- ❌ Never hardcode secrets in code

---

## The Restaurant Analogy

Phase 1 is like **ordering supplies before opening a new restaurant kitchen**:

### What We Did:

**1. Handlebars (Template Engine)**
- Like buying **recipe templates** with blanks to fill in
- Example: "__ oz beef, __ slices cheese" → "8 oz beef, 2 slices cheese"
- Each customer gets the same recipe format, but personalized amounts

**2. @sparticuz/chromium (PDF Browser)**
- Like buying a **food truck** instead of a full restaurant
- Same cooking capability, but optimized for mobile/on-demand service
- Fits in tight spaces (serverless function limits)

**3. @vercel/blob (File Storage)**
- Like having **off-site freezer storage** for prepared meals
- Store finished dishes (PDFs), get pickup instructions (URLs)
- Pay only for what you store (not for empty freezer space)

**4. BLOB_READ_WRITE_TOKEN (API Key)**
- Like the **key to the freezer warehouse**
- Without it, you can't access your storage
- Keep it safe, don't share it publicly

---

## Total Progress

**Feature 003 Progress**: 4/51 tasks complete (8%)

**Phase Completion**:
- ✅ Phase 1: Setup (4/4 tasks) - **COMPLETE** 🎉
- ⏭️ Phase 2: Foundational Infrastructure (0/15 tasks) - Next!
- ⏭️ Phase 3: User Story 1 (0/12 tasks)
- ⏭️ Phase 4: User Story 2 (0/8 tasks)
- ⏭️ Phase 5: User Story 3 (0/6 tasks)
- ⏭️ Phase 6: Polish & Production (0/6 tasks)

---

## What's Next: Phase 2

Phase 2 will build the foundational infrastructure that all user stories depend on:

1. **Database Schema** (T005-T008)
   - Create `documents` table with versioning
   - Add enums for document types and statuses
   - Create indexes for fast queries

2. **Template Engine Integration** (T009-T012)
   - Create TemplateService to compile Handlebars
   - Convert HTML template to .hbs format
   - Add custom helpers (formatCurrency, formatDate)
   - Build data transformation utilities

3. **PDF Generator Service** (T013-T015)
   - Create PDFGeneratorService using Playwright
   - Integrate @sparticuz/chromium
   - Add browser lifecycle management
   - Implement retry logic (3 attempts)

4. **Storage Service** (T016-T017)
   - Create StorageService for Vercel Blob
   - Implement upload/download methods
   - Generate signed URLs (1-hour expiration)

5. **NestJS Module Setup** (T018-T019)
   - Create DocumentModule
   - Import all services
   - Integrate with app.module.ts

**Phase 2 is BLOCKING** - No user stories can proceed until Phase 2 completes!

---

## Glossary

- **npm**: Node Package Manager - tool for installing JavaScript libraries
- **Dependency**: A library your project needs to function
- **Handlebars**: Template engine for merging data into HTML
- **Chromium**: Open-source browser engine (basis for Chrome)
- **Serverless**: Code execution model where you only pay for actual compute time
- **Blob Storage**: Object storage for files (Binary Large OBjects)
- **Environment Variable**: Configuration value stored outside code
- **.env file**: Local file containing environment variables
- **API Token**: Secret key used to authenticate with external services
- **TypeScript**: Superset of JavaScript with static type checking

---

**Learning Document Created**: 2025-11-09
**Feature**: 003-portal-document-download
**Phase**: 1 (Setup)
**Tasks Covered**: T001-T004
