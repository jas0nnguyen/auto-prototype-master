# Vercel Blob Installation Instructions

## Required Action

The StorageService has been created but requires the `@vercel/blob` package to be installed.

## Installation Steps

### 1. Navigate to backend directory
```bash
cd /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend
```

### 2. Install the package
```bash
npm install @vercel/blob
```

### 3. Verify installation
```bash
# Check package.json dependencies
grep "@vercel/blob" package.json
```

Expected output:
```json
"@vercel/blob": "^0.23.0" (or latest version)
```

### 4. Import DocumentServiceModule in app.module.ts

The DocumentServiceModule needs to be added to your main app module.

**File**: `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/app.module.ts`

Add:
```typescript
import { DocumentServiceModule } from './services/document-service/document-service.module';

@Module({
  imports: [
    // ... existing imports
    DocumentServiceModule,
  ],
})
export class AppModule {}
```

### 5. Verify environment variable

Ensure `.env` contains:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_0RcHeX7fy2LiIUHA_uaBMqtPS6G2pEOIJ92OFcpCZsD3n4t
```

This token is already configured in your `.env` file.

## What Was Created

### Files Created:
1. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/document-service/storage.service.ts`
   - StorageService with upload, delete, getFileSize, and generateDownloadURL methods
   - Retry logic for uploads (2 attempts)
   - Comprehensive error handling and logging

2. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/document-service/document-service.module.ts`
   - NestJS module that exports StorageService

3. `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/document-service/README.md`
   - Documentation for the document service

## Implementation Details

### Upload Method Signature
```typescript
async uploadDocument(
  filename: string,        // e.g., "policies/DZPV12345678/documents/declarations-v1.pdf"
  fileBuffer: Buffer,      // PDF as Buffer
  contentType: string = 'application/pdf'
): Promise<{ url: string; size: number }>
```

### Download URL Generation
```typescript
async generateDownloadURL(url: string): Promise<string>
```

**MVP Implementation**: Returns the Vercel Blob URL directly (URLs are public with `access: 'public'`)

**Future Enhancement**: Could implement time-limited tokens using Vercel Blob's signed URL feature when needed.

### Error Handling
- Automatic retry on upload failure (2 attempts with 1-second delay)
- Validates BLOB_READ_WRITE_TOKEN presence (logs warning if missing)
- Throws `InternalServerErrorException` with descriptive messages
- Comprehensive logging for all operations

## Next Steps

After running the installation command, you can:
1. Import StorageService in other services (like PDFGeneratorService)
2. Use it to upload generated PDFs
3. Store document URLs in the database
4. Generate download links for portal users

## Testing

To test the service:
```typescript
import { StorageService } from './services/document-service/storage.service';

// In a service or controller
const result = await this.storageService.uploadDocument(
  'policies/DZPV12345678/documents/test-v1.pdf',
  Buffer.from('test pdf content'),
  'application/pdf'
);

console.log('Uploaded:', result.url);
console.log('Size:', result.size);
```

## Troubleshooting

### "BLOB_READ_WRITE_TOKEN is not configured"
- Check `.env` file contains the token
- Restart the backend server after adding the token

### "Failed to upload document after 2 attempts"
- Verify token has read/write permissions
- Check network connectivity
- Verify Vercel Blob storage is accessible

### Import errors
- Ensure `npm install @vercel/blob` completed successfully
- Check `node_modules/@vercel/blob` exists
- Restart TypeScript server in your IDE
