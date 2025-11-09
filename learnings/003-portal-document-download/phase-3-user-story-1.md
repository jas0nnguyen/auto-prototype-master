# Phase 3: User Story 1 - View and Download Documents (Tasks T020-T030)

**Completed**: 2025-11-09
**Goal**: Enable policyholders to view document lists and download PDFs from the self-service portal
**Feature**: 003-portal-document-download

## What We Built

Phase 3 implemented the complete MVP for document viewing and downloading. Policyholders can now:
1. Navigate to the Documents section of their portal
2. See a list of all available documents (declarations page, policy documents, ID cards)
3. Download any document with a single click
4. See document status (GENERATING, READY, FAILED, SUPERSEDED)
5. View document metadata (version, file size, download count)

This phase connected three major systems:
- **Backend Services**: Document CRUD operations and PDF generation orchestration
- **REST API**: Portal-accessible endpoints for listing and downloading documents
- **Frontend UI**: Enhanced Documents page with real-time status and download buttons

---

## Part 1: Backend Document Service (T020-T022)

### What We Built: DocumentService

The DocumentService is the "brain" of the document system. It handles:
- Creating document records in the database
- Fetching documents by policy
- Updating document status (GENERATING → READY → SUPERSEDED)
- Orchestrating the full PDF generation workflow
- Logging download access for audit trails

**File**: `backend/src/services/document-service/document.service.ts`

### Key Concepts

#### 1. CRUD Operations
CRUD = Create, Read, Update, Delete - the four basic database operations

```typescript
// CREATE: Add new document record
async createDocument(data: { policy_id, document_type, ... }): Promise<DocumentMetadata> {
  const document_number = this.generateDocumentNumber(); // DZDOC-XXXXXXXX
  const [createdDocument] = await this.db.insert(document).values({...}).returning();
  return this.mapToDocumentMetadata(createdDocument);
}

// READ: Get document by ID
async getDocument(documentId: string): Promise<DocumentMetadata> {
  const [foundDocument] = await this.db
    .select()
    .from(document)
    .where(eq(document.document_id, documentId));

  if (!foundDocument) {
    throw new NotFoundException(`Document not found: ${documentId}`);
  }

  return this.mapToDocumentMetadata(foundDocument);
}

// READ: Get all documents for a policy
async getDocumentsByPolicy(policyId: string, options): Promise<DocumentMetadata[]> {
  const conditions = [eq(document.policy_id, policyId)];

  if (options.current_only) {
    conditions.push(eq(document.is_current, true));
  }

  const documents = await this.db
    .select()
    .from(document)
    .where(and(...conditions))
    .orderBy(desc(document.generated_at));

  return documents.map(this.mapToDocumentMetadata);
}

// UPDATE: Change document status
async updateDocumentStatus(documentId: string, status: DocumentStatus, metadata): Promise<DocumentMetadata> {
  const updateData: any = { document_status: status };

  if (status === 'READY') {
    updateData.generated_at = new Date();
  }

  if (status === 'SUPERSEDED') {
    updateData.superseded_at = new Date();
    updateData.is_current = false;
  }

  const [updatedDocument] = await this.db
    .update(document)
    .set(updateData)
    .where(eq(document.document_id, documentId))
    .returning();

  return this.mapToDocumentMetadata(updatedDocument);
}
```

**Restaurant Analogy**: CRUD operations are like a restaurant order management system:
- **CREATE**: Taking a new order (write it down)
- **READ**: Checking what orders exist (read the order pad)
- **UPDATE**: Modifying an order (customer changes their mind)
- **DELETE**: Canceling an order (customer leaves)

#### 2. Document Number Generation

Human-readable IDs make debugging and customer support easier:

```typescript
private generateDocumentNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous: 0O, 1I
  let number = 'DZDOC-';
  for (let i = 0; i < 8; i++) {
    number += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return number; // Example: DZDOC-A3B7K9M2
}
```

**Why human-readable IDs?**
- Customers can reference documents: "I'm looking at DZDOC-A3B7K9M2"
- Support team can search by document number
- Database still uses UUIDs for relationships (document_id)
- Similar pattern to policy numbers (DZQV87Z4FH)

#### 3. Document Generation Orchestration (T021)

This is the "conductor" method that coordinates 7 different services:

```typescript
async generateDocuments(request: DocumentGenerationRequest): Promise<DocumentMetadata[]> {
  const { policy_id, document_type, vehicle_id } = request;

  // STEP 1: Fetch policy data from database
  const [policyData] = await this.db
    .select()
    .from(policy)
    .where(eq(policy.policy_identifier, policy_id));

  const vehicles = await this.db
    .select()
    .from(vehicle)
    .where(eq(vehicle.policy_id, policy_id));

  // STEP 2: Get next version number
  const nextVersion = await this.getNextVersion(policy_id, 'DECLARATIONS');

  // STEP 3: Create document record in GENERATING status
  const documentRecord = await this.createDocument({
    policy_id,
    document_type: 'DECLARATIONS',
    document_name: 'Auto Insurance Declarations - DZQV87Z4FH.pdf',
    version: nextVersion,
  });

  // STEP 4: Render HTML template with policy data
  const templateData = mapPolicyToDeclarationsData(policyData, vehicles, [], []);
  const html = await this.templateService.renderTemplate('declarations-page.hbs', templateData);

  // STEP 5: Generate PDF from HTML using Playwright
  const pdfBuffer = await this.pdfGenerator.generatePDF(html, {
    format: 'Letter',
    printBackground: true,
  });

  // STEP 6: Upload PDF to Vercel Blob
  const filename = `policies/${policyData.policy_number}/documents/declarations-v1.pdf`;
  const { url, size } = await this.storageService.uploadDocument(filename, pdfBuffer);

  // STEP 7: Update document status to READY
  const updatedDocument = await this.updateDocumentStatus(
    documentRecord.document_id,
    'READY',
    { storage_url: url, file_size_bytes: size }
  );

  return [updatedDocument];
}
```

**Restaurant Analogy**: Like a head chef coordinating a complex dish:
1. **Get ingredients** (fetch policy data)
2. **Prep work** (create document record, get version number)
3. **Follow recipe** (render template with data)
4. **Cook** (generate PDF)
5. **Plate and store** (upload to Blob storage)
6. **Mark ready to serve** (update status to READY)

#### 4. Audit Logging (T022)

Track every document download for compliance and analytics:

```typescript
async logDownload(documentId: string): Promise<void> {
  await this.db
    .update(document)
    .set({
      accessed_at: new Date(),
      accessed_count: sql`${document.accessed_count} + 1`, // Atomic increment
    })
    .where(eq(document.document_id, documentId));
}
```

**Why atomic increment?**
- `sql\`${document.accessed_count} + 1\`` runs on database server
- Prevents race conditions (two downloads at same time)
- Database guarantees correct count

**Regular increment (BAD)**:
```typescript
// NEVER do this - race condition!
const doc = await getDocument(documentId);
doc.accessed_count = doc.accessed_count + 1; // Lost update if concurrent
await update(doc);
```

---

## Part 2: REST API Controller (T023-T025)

### What We Built: DocumentsController

The DocumentsController exposes HTTP endpoints for the frontend to call:
- `GET /api/v1/portal/:policyNumber/documents` - List documents
- `GET /api/v1/portal/:policyNumber/documents/:documentId/download` - Download document

**File**: `backend/src/api/routes/documents.controller.ts`

### Key Concepts

#### 1. NestJS Controller Decorators

Decorators tell NestJS how to route HTTP requests:

```typescript
@Controller('api/v1/portal')  // Base path for all routes in this controller
export class DocumentsController {

  @Get(':policyNumber/documents')  // Full path: GET /api/v1/portal/DZQV87Z4FH/documents
  async listDocuments(
    @Param('policyNumber') policyNumber: string,     // Extract from URL path
    @Query('document_type') documentType?: string,   // Extract from query string
  ) {
    // Implementation
  }

  @Get(':policyNumber/documents/:documentId/download')
  async downloadDocument(
    @Param('policyNumber') policyNumber: string,
    @Param('documentId') documentId: string,
    @Res() res: Response,  // Direct access to Express response
  ) {
    // Implementation
  }
}
```

**Decorator Breakdown**:
- `@Controller('path')` - Defines base URL for all endpoints
- `@Get(':param')` - Handles GET requests, `:param` is a URL parameter
- `@Param('name')` - Extracts URL path parameter
- `@Query('name')` - Extracts query string parameter (?name=value)
- `@Res()` - Gives direct access to Express response object

#### 2. List Documents Endpoint (T024)

```typescript
@Get(':policyNumber/documents')
async listDocuments(
  @Param('policyNumber') policyNumber: string,
  @Query('document_type') documentType?: DocumentType,
  @Query('include_superseded') includeSuperseded?: string,
) {
  // Step 1: Verify policy exists and get policy_id
  const [policyData] = await this.db
    .select()
    .from(policy)
    .where(eq(policy.policy_number, policyNumber));

  if (!policyData) {
    throw new NotFoundException(`Policy not found: ${policyNumber}`);
  }

  // Step 2: Fetch documents using DocumentService
  const documents = await this.documentService.getDocumentsByPolicy(
    policyData.policy_identifier,
    {
      current_only: includeSuperseded !== 'true',
      document_type: documentType,
    }
  );

  // Step 3: Return standardized response
  return {
    success: true,
    data: documents,
    meta: {
      policy_number: policyNumber,
      total: documents.length,
    },
  };
}
```

**Example Request/Response**:

```bash
# Request
GET /api/v1/portal/DZQV87Z4FH/documents?document_type=DECLARATIONS

# Response
{
  "success": true,
  "data": [
    {
      "document_id": "123e4567-e89b-12d3-a456-426614174000",
      "document_number": "DZDOC-A3B7K9M2",
      "document_type": "DECLARATIONS",
      "document_name": "Auto Insurance Declarations - DZQV87Z4FH.pdf",
      "version": 1,
      "is_current": true,
      "document_status": "READY",
      "storage_url": "https://...vercel-storage.com/...",
      "file_size_bytes": 245678,
      "created_at": "2025-11-09T10:30:00Z",
      "accessed_count": 3
    }
  ],
  "meta": {
    "policy_number": "DZQV87Z4FH",
    "total": 1
  }
}
```

#### 3. Download Endpoint (T025)

```typescript
@Get(':policyNumber/documents/:documentId/download')
async downloadDocument(
  @Param('policyNumber') policyNumber: string,
  @Param('documentId') documentId: string,
  @Res() res: Response,
) {
  // Step 1: Verify policy exists
  const [policyData] = await this.db
    .select()
    .from(policy)
    .where(eq(policy.policy_number, policyNumber));

  if (!policyData) {
    throw new NotFoundException(`Policy not found`);
  }

  // Step 2: Fetch document
  const document = await this.documentService.getDocument(documentId);

  // Step 3: Check if document is ready
  if (document.document_status !== 'READY') {
    return res.status(HttpStatus.ACCEPTED).json({
      success: false,
      message: `Document is currently ${document.document_status}`,
    });
  }

  // Step 4: Log download for audit trail
  await this.documentService.logDownload(documentId);

  // Step 5: Redirect to Blob storage URL
  return res.redirect(HttpStatus.TEMPORARY_REDIRECT, document.storage_url);
}
```

**Why redirect instead of streaming?**
- Vercel Blob URLs are optimized for direct download
- Reduces serverless function execution time
- Blob storage handles CDN, compression, bandwidth
- 307 Temporary Redirect preserves HTTP method

**Restaurant Analogy**: Like a host directing you to the buffet table instead of carrying each plate to your table - you go directly to where the food is stored.

---

## Part 3: Frontend Integration (T026-T029)

### What We Built: React Components & Hooks

The frontend implementation consists of:
1. **DocumentAPI Client** - HTTP client for calling backend
2. **useDocuments Hooks** - TanStack Query hooks for data fetching
3. **Enhanced Documents Page** - UI with icons, badges, and download buttons

### Key Concepts

#### 1. Document API Client (T026)

**File**: `src/services/document-api.ts`

```typescript
class DocumentAPIClient {
  private readonly baseURL: string;

  constructor() {
    // Environment variable for API URL
    // Dev: http://localhost:3000
    // Prod: auto-configured by Vercel
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  async listDocuments(policyNumber: string, options = {}): Promise<ListDocumentsResponse> {
    // Build query string
    const params = new URLSearchParams();
    if (options.documentType) params.append('document_type', options.documentType);
    if (options.includeSuperseded) params.append('include_superseded', 'true');

    const url = `${this.baseURL}/api/v1/portal/${policyNumber}/documents?${params}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }

    return await response.json();
  }

  downloadDocument(policyNumber: string, documentId: string): void {
    const url = `${this.baseURL}/api/v1/portal/${policyNumber}/documents/${documentId}/download`;
    window.open(url, '_blank'); // Open in new tab
  }
}

// Export singleton instance
export const documentAPI = new DocumentAPIClient();
```

**Why singleton pattern?**
- One instance shared across entire app
- Consistent baseURL configuration
- Prevents multiple HTTP client instances

#### 2. TanStack Query Hooks (T027)

**File**: `src/hooks/useDocuments.ts`

TanStack Query provides:
- **Automatic caching** - Fetch once, reuse data
- **Background refetching** - Keep data fresh
- **Loading/error states** - Built-in UI state management
- **Retry logic** - Auto-retry failed requests

```typescript
// Query key factory - unique identifiers for cached data
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (policyNumber: string, filters?) =>
    [...documentKeys.lists(), policyNumber, filters] as const,
};

// Hook to fetch document list
export function useDocumentList(policyNumber: string, filters?) {
  return useQuery<ListDocumentsResponse, Error>({
    queryKey: documentKeys.list(policyNumber, filters),
    queryFn: () => documentAPI.listDocuments(policyNumber, filters),
    staleTime: 1000 * 60 * 5,  // 5 minutes - data stays fresh
    gcTime: 1000 * 60 * 30,    // 30 minutes - keep in cache
    retry: 2,                   // Retry failed requests twice
    enabled: !!policyNumber,    // Only run if policyNumber exists
  });
}

// Hook to download document
export function useDownloadDocument(policyNumber: string) {
  return (documentId: string) => {
    documentAPI.downloadDocument(policyNumber, documentId);
  };
}
```

**Cache Keys Explained**:
- `['documents', 'list', 'DZQV87Z4FH']` - All documents for policy DZQV87Z4FH
- `['documents', 'list', 'DZQV87Z4FH', { documentType: 'DECLARATIONS' }]` - Filtered list
- Different keys = different cache entries

**Restaurant Analogy**: Query keys are like table numbers at a restaurant:
- Table 5 orders ("DZQV87Z4FH") are different from Table 7 orders ("DZPV12345678")
- Each table's order is cached separately
- Kitchen knows which table to serve when food is ready

#### 3. Enhanced Documents Page (T028, T029)

**File**: `src/pages/portal/Documents.tsx`

```typescript
export default function Documents() {
  const { policyNumber } = useParams<{ policyNumber: string }>();

  // Fetch documents using TanStack Query hook
  const { data: response, isLoading, error } = useDocumentList(policyNumber!);
  const downloadDocument = useDownloadDocument(policyNumber!);

  if (isLoading) {
    return (
      <PortalLayout policyNumber={policyNumber!} activePage="documents">
        <div className="flex justify-center p-12">
          <Spinner />
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout policyNumber={policyNumber!} activePage="documents">
        <Alert color="error">
          Failed to load documents: {error.message}
        </Alert>
      </PortalLayout>
    );
  }

  const documents = response?.data || [];

  return (
    <PortalLayout policyNumber={policyNumber!} activePage="documents">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Documents</h2>
        <Text color="muted" size="sm">
          View and download your insurance policy documents
        </Text>
      </div>

      {documents.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Text size="lg" color="muted">No documents available yet</Text>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc: DocumentMetadata) => (
            <Card key={doc.document_id}>
              <div className="p-5 flex items-center justify-between gap-4">
                {/* Document icon and details */}
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{getDocumentIcon(doc.document_type)}</div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Text className="font-medium">{doc.document_name}</Text>

                      {/* Status badge */}
                      <Badge color={getStatusBadgeColor(doc.document_status)} size="sm">
                        {doc.document_status}
                      </Badge>

                      {/* Current version badge */}
                      {doc.is_current && (
                        <Badge color="info" size="sm">Current</Badge>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 mt-1">
                      <Text size="xs" color="muted">Version {doc.version}</Text>
                      <Text size="xs" color="muted">•</Text>
                      <Text size="xs" color="muted">{formatFileSize(doc.file_size_bytes)}</Text>
                      {doc.accessed_count > 0 && (
                        <>
                          <Text size="xs" color="muted">•</Text>
                          <Text size="xs" color="muted">
                            Downloaded {doc.accessed_count} times
                          </Text>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action button based on status */}
                <div>
                  {doc.document_status === 'GENERATING' ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <Text size="sm">Generating...</Text>
                    </div>
                  ) : doc.document_status === 'READY' ? (
                    <Button
                      onClick={() => downloadDocument(doc.document_id)}
                      size="sm"
                      variant="primary"
                    >
                      Download
                    </Button>
                  ) : (
                    <Text size="sm" color="error">Generation failed</Text>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
```

**Key UI Features**:
1. **Status-aware UI**: Different display based on document_status
2. **Loading states**: Spinner while fetching, error alert on failure
3. **Document icons**: Visual differentiation (📄 declarations, 🪪 ID card, etc.)
4. **Status badges**: Color-coded (green=READY, yellow=GENERATING, red=FAILED)
5. **Metadata display**: Version, file size, download count
6. **Responsive actions**: Download button only shows when READY

---

## Files Created/Modified

### Backend Files Created

1. **`backend/src/services/document-service/document.service.ts`** (545 lines)
   - DocumentService class with CRUD methods
   - Document generation orchestration
   - Audit logging
   - Version management
   - Document number generation

2. **`backend/src/api/routes/documents.controller.ts`** (197 lines)
   - DocumentsController with 2 endpoints
   - List documents endpoint
   - Download document endpoint
   - Policy verification logic

### Backend Files Modified

3. **`backend/src/services/document-service/document.module.ts`**
   - Added DocumentService to providers
   - Registered DocumentsController
   - Exported DocumentService for use in other modules

### Frontend Files Created

4. **`src/services/document-api.ts`** (145 lines)
   - DocumentAPIClient class
   - listDocuments method
   - downloadDocument method
   - getDownloadURL method

5. **`src/hooks/useDocuments.ts`** (111 lines)
   - Query key factory
   - useDocumentList hook
   - useDownloadDocument hook
   - useDocumentURL hook

### Frontend Files Modified

6. **`src/pages/portal/Documents.tsx`** (210 lines)
   - Enhanced with real API integration
   - Added document status badges
   - Added file size display
   - Added download tracking
   - Replaced mock data with TanStack Query

---

## Key Concepts Learned

### 1. Service Orchestration

**What it is**: One service coordinating multiple other services to complete a complex workflow

**DocumentService.generateDocuments()** orchestrates 7 steps:
1. Database query (fetch policy data)
2. Version calculation (getNextVersion)
3. Database insert (createDocument)
4. Template rendering (TemplateService)
5. PDF generation (PDFGeneratorService)
6. File upload (StorageService)
7. Database update (updateDocumentStatus)

**Why orchestration matters**:
- Each service has one responsibility (Single Responsibility Principle)
- Services are reusable independently
- Easy to test each service in isolation
- Orchestrator handles the "big picture" workflow

### 2. RESTful API Design

**REST = Representational State Transfer**

Our endpoints follow REST principles:
- **Resources** identified by URLs: `/portal/:policyNumber/documents`
- **HTTP verbs** indicate action: `GET` (read), `POST` (create), etc.
- **Stateless** requests: Each request contains all needed info
- **Standard responses**: JSON with `success`, `data`, `meta`

**URL Structure**:
```
/api/v1/portal/:policyNumber/documents
│   │    │         │              │
│   │    │         │              └─ Resource collection
│   │    │         └─ Resource identifier (policy number)
│   │    └─ API scope (portal vs admin)
│   └─ API version
└─ Base path
```

### 3. Client-Side State Management with TanStack Query

**Traditional approach (WITHOUT TanStack Query)**:
```typescript
function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments()
      .then(data => setDocuments(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // Manual refetch on user action
  const refetch = () => {
    setLoading(true);
    fetchDocuments()...
  };
}
```

**Modern approach (WITH TanStack Query)**:
```typescript
function Documents() {
  const { data, isLoading, error } = useDocumentList(policyNumber);

  // TanStack Query handles:
  // - Caching (no duplicate requests)
  // - Automatic refetching (keeps data fresh)
  // - Loading/error states
  // - Retry logic
  // - Background updates
}
```

**Benefits**:
- Less boilerplate code
- Automatic caching across components
- Optimistic updates
- Request deduplication

### 4. TypeScript Enums and Union Types

**Document Status as Union Type**:
```typescript
type DocumentStatus = 'GENERATING' | 'READY' | 'FAILED' | 'SUPERSEDED';

// TypeScript ensures only valid values
const status: DocumentStatus = 'READY'; // ✅ OK
const badStatus: DocumentStatus = 'PENDING'; // ❌ Compile error
```

**Benefits**:
- Autocomplete in VS Code
- Compile-time type checking
- Self-documenting code
- Impossible to typo status values

### 5. Conditional Rendering in React

**Render different UI based on data state**:

```typescript
{documents.length === 0 ? (
  <EmptyState />
) : (
  <DocumentList />
)}

{doc.document_status === 'GENERATING' ? (
  <Spinner />
) : doc.document_status === 'READY' ? (
  <DownloadButton />
) : (
  <ErrorMessage />
)}
```

**Pattern**: Ternary operator for 2-way choice, nested ternaries for 3+ way choice

### 6. HTTP Status Codes

Our API uses standard HTTP status codes:
- **200 OK**: Successful GET request
- **307 Temporary Redirect**: Download redirect to Blob URL
- **404 Not Found**: Policy or document doesn't exist
- **202 Accepted**: Request accepted but processing not complete (GENERATING status)
- **500 Internal Server Error**: Unexpected server error

---

## The Restaurant Analogy for Phase 3

Phase 3 is like **completing the customer-facing dining experience**:

✅ **Built the Order Processing System**:
- **DocumentService** = Head Chef coordinating the kitchen
  - Takes orders (createDocument)
  - Checks what's available (getDocumentsByPolicy)
  - Prepares complex dishes (generateDocuments orchestration)
  - Updates order status (updateDocumentStatus)
  - Tracks customer satisfaction (logDownload audit trail)

✅ **Set Up the Service Counter** (API Endpoints):
- **List Menu** endpoint = Display case showing all available dishes
  - Customers can see what's ready
  - Filter by type (appetizers, mains, desserts)
  - See which version is current
- **Pickup Window** endpoint = Download station
  - Verify customer's order
  - Log pickup time
  - Direct customer to food storage (Blob URL redirect)

✅ **Built the Customer App** (Frontend):
- **DocumentAPI Client** = Mobile ordering app
  - Sends requests to the service counter
  - Handles responses
  - Opens new tabs for downloads
- **useDocuments Hooks** = Smart caching system
  - Remembers recent orders
  - Auto-refreshes menu when needed
  - Retries failed orders
- **Documents Page** = Digital menu board
  - Shows available dishes with photos (icons)
  - Displays status badges (Ready, Cooking, Failed)
  - Shows portion sizes (file size)
  - Tracks popularity (download count)

**Current State**: Customers can now:
1. View the full menu (all documents for their policy)
2. See what's being prepared vs ready to serve
3. Order with one click (download button)
4. Track their order history (accessed_count)

**Next Phase**: Add automatic reordering when menu changes (auto-regeneration on policy updates)

---

## Total Progress

**Phase 3 Complete**: 11/12 tasks (92%)
- ✅ T020: DocumentService CRUD methods
- ✅ T021: Document generation orchestration
- ✅ T022: Audit logging
- ✅ T023: DocumentsController
- ✅ T024: List documents endpoint
- ✅ T025: Download endpoint
- ✅ T026: Document API client
- ✅ T027: TanStack Query hooks
- ✅ T028: Enhanced Documents page
- ✅ T029: Document icons and badges
- ✅ T030: Integration point documented (ready for QuoteService.bindPolicy)
- ⏳ T031: End-to-end testing (manual verification pending)

**Overall Progress**: 30/51 tasks complete (59%)

---

## What's Next?

**Phase 4**: Auto-regeneration on policy changes (User Story 2)
- Trigger document generation when coverage changes
- Supersede old versions automatically
- Status polling for "Generating..." indicator
- Real-time updates in UI

**Phase 5**: Document history and versioning (User Story 3)
- View all document versions
- Filter by document type
- Show superseded documents
- Highlight current version

**Phase 6**: Production readiness
- Error handling improvements
- Performance optimization
- Monitoring and alerts
- Documentation updates

---

## Learning Resources

### Code Examples

**Example 1: Full Document Generation Flow**

```typescript
// 1. User binds policy (in QuoteService.bindPolicy)
await policyService.updateStatus(policyId, 'IN_FORCE');

// 2. Trigger document generation
const documents = await documentService.generateDocuments({
  policy_id: policyId,
  document_type: 'DECLARATIONS',
});

// 3. Documents now visible in portal
// User visits /portal/DZQV87Z4FH/documents
// Frontend calls: GET /api/v1/portal/DZQV87Z4FH/documents

// 4. API returns document list
{
  "success": true,
  "data": [
    {
      "document_id": "...",
      "document_status": "READY",
      "storage_url": "https://...vercel-storage.com/...",
      ...
    }
  ]
}

// 5. User clicks Download button
// Frontend calls: GET /api/v1/portal/DZQV87Z4FH/documents/{documentId}/download

// 6. Backend logs download and redirects
await documentService.logDownload(documentId); // Increment accessed_count
res.redirect(307, document.storage_url); // Redirect to Blob

// 7. Browser downloads PDF from Vercel Blob
```

### TypeScript Type Safety Example

```typescript
// Define strict types for document operations
interface CreateDocumentRequest {
  policy_id: string;
  document_type: DocumentType; // Only valid types allowed
  document_name: string;
  vehicle_id?: string;
  version?: number;
}

// TypeScript catches errors at compile time
const request: CreateDocumentRequest = {
  policy_id: '123',
  document_type: 'INVALID_TYPE', // ❌ Compile error!
  document_name: 'Test',
};

// Correct usage
const validRequest: CreateDocumentRequest = {
  policy_id: '123',
  document_type: 'DECLARATIONS', // ✅ Valid
  document_name: 'Test',
};
```

### React Component Composition Example

```typescript
// Reusable document card component
function DocumentCard({ document, onDownload }: {
  document: DocumentMetadata;
  onDownload: (id: string) => void;
}) {
  return (
    <Card>
      <DocumentIcon type={document.document_type} />
      <DocumentDetails document={document} />
      <DocumentActions document={document} onDownload={onDownload} />
    </Card>
  );
}

// Used in Documents page
function Documents() {
  const { data } = useDocumentList(policyNumber);
  const downloadDocument = useDownloadDocument(policyNumber);

  return (
    <div>
      {data.map(doc => (
        <DocumentCard
          key={doc.document_id}
          document={doc}
          onDownload={downloadDocument}
        />
      ))}
    </div>
  );
}
```

---

**Generated**: 2025-11-09
**Feature**: 003-portal-document-download
**Phase**: 3 of 6 (User Story 1 - MVP)
