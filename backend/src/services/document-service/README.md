# Document Service Module

## Overview

Provides document generation and storage services for the auto insurance platform. Currently implements Vercel Blob storage integration for PDF document uploads, downloads, and management.

## Components

### StorageService (T016, T017)

Handles document storage operations using Vercel Blob SDK.

**Features:**
- Upload PDF documents with retry logic (2 attempts)
- Delete documents from storage
- Retrieve file metadata (size)
- Generate download URLs (public access for MVP)

**Configuration:**
- Environment variable: `BLOB_READ_WRITE_TOKEN`
- Access mode: `public` (for MVP simplicity)
- Content type: `application/pdf`
- Path pattern: `policies/{policyNumber}/documents/{documentType}-v{version}.pdf`

**Methods:**
```typescript
// Upload document
uploadDocument(filename: string, fileBuffer: Buffer, contentType?: string): Promise<{url: string, size: number}>

// Delete document
deleteDocument(url: string): Promise<void>

// Get file size
getFileSize(url: string): Promise<number>

// Generate download URL (returns URL directly for MVP)
generateDownloadURL(url: string): Promise<string>
```

**Example Usage:**
```typescript
import { StorageService } from './storage.service';

// Upload a document
const result = await storageService.uploadDocument(
  'policies/DZPV12345678/documents/declarations-v1.pdf',
  pdfBuffer,
  'application/pdf'
);
console.log(result.url);  // https://...vercel-storage.com/policies/DZPV12345678/documents/declarations-v1.pdf
console.log(result.size); // 245678

// Generate download URL
const downloadUrl = await storageService.generateDownloadURL(result.url);

// Delete document
await storageService.deleteDocument(result.url);
```

## Installation

### 1. Install @vercel/blob SDK

```bash
cd backend
npm install @vercel/blob
```

### 2. Configure Environment Variable

Ensure `.env` file contains:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

Get your token from: https://vercel.com/dashboard/stores

### 3. Import Module

Add to `app.module.ts`:
```typescript
import { DocumentServiceModule } from './services/document-service/document-service.module';

@Module({
  imports: [
    // ... other modules
    DocumentServiceModule,
  ],
})
export class AppModule {}
```

## Error Handling

All methods include comprehensive error handling:

- **Upload failures**: Automatic retry (2 attempts) with 1-second delay
- **Validation**: Checks for BLOB_READ_WRITE_TOKEN presence
- **Logging**: Detailed logs for all operations and failures
- **Exceptions**: Throws `InternalServerErrorException` with descriptive messages

## Future Enhancements

### Signed URLs (T017 Enhancement)

Currently, `generateDownloadURL()` returns the Vercel Blob URL directly (URLs include auth by default with public access).

**Future implementation** could add time-limited access:
```typescript
async generateDownloadURL(url: string, expiresIn: number = 3600): Promise<string> {
  // Option 1: Use Vercel Blob signed URLs (when available)
  // Option 2: Implement custom token-based access control
  // Option 3: Use presigned URLs with custom authentication
}
```

### Document Versioning

Path pattern already supports versioning:
- `documents/declarations-v1.pdf`
- `documents/declarations-v2.pdf`

Future implementation could add:
- Automatic version tracking
- Version history retrieval
- Cleanup of old versions

## Testing

Unit tests should cover:
- Successful upload
- Upload retry on failure
- Delete operations
- File size retrieval
- URL generation
- Error handling for missing token
- Error handling for invalid URLs

## Dependencies

- `@vercel/blob`: ^0.23.0 (or latest)
- `@nestjs/common`: For Injectable decorator and exceptions
- Environment: BLOB_READ_WRITE_TOKEN

## Files

```
backend/src/services/document-service/
├── README.md                          # This file
├── document-service.module.ts         # NestJS module
└── storage.service.ts                 # Vercel Blob storage service (T016, T017)
```

## Related Specs

- `specs/003-portal-document-download/spec.md` - Feature specification
- `specs/003-portal-document-download/tasks.md` - Implementation tasks
- `.env` - Environment configuration
