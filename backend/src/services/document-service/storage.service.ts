import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { put, del, head } from '@vercel/blob';

/**
 * StorageService - Handles document upload, deletion, and URL management using Vercel Blob Storage
 *
 * Features:
 * - Upload PDF documents to Vercel Blob with retry logic
 * - Delete documents from Vercel Blob
 * - Retrieve file metadata (size)
 * - Generate download URLs (currently public, extensible for time-limited tokens)
 *
 * Path Pattern: policies/{policyNumber}/documents/{documentType}-v{version}.pdf
 *
 * Environment Variables:
 * - BLOB_READ_WRITE_TOKEN: Vercel Blob API token with read/write permissions
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly MAX_RETRIES = 2;
  private readonly token: string;

  constructor() {
    this.token = process.env.BLOB_READ_WRITE_TOKEN || '';

    if (!this.token) {
      this.logger.warn('BLOB_READ_WRITE_TOKEN is not configured. Document upload will fail.');
    }
  }

  /**
   * Upload a document to Vercel Blob storage
   *
   * @param filename - Full path including policy number and document type (e.g., "policies/DZPV12345678/documents/declarations-v1.pdf")
   * @param fileBuffer - PDF file as Buffer
   * @param contentType - MIME type (default: 'application/pdf')
   * @returns Object with public URL and file size in bytes
   *
   * @throws InternalServerErrorException if upload fails after retries
   *
   * @example
   * const result = await storageService.uploadDocument(
   *   'policies/DZPV12345678/documents/declarations-v1.pdf',
   *   pdfBuffer,
   *   'application/pdf'
   * );
   * console.log(result.url); // https://...vercel-storage.com/policies/DZPV12345678/documents/declarations-v1.pdf
   * console.log(result.size); // 245678
   */
  async uploadDocument(
    filename: string,
    fileBuffer: Buffer,
    contentType: string = 'application/pdf',
  ): Promise<{ url: string; size: number }> {
    this.logger.log(`Uploading document: ${filename} (${fileBuffer.length} bytes)`);

    let lastError: Error | null = null;

    // Retry logic: attempt upload up to MAX_RETRIES times
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const blob = await put(filename, fileBuffer, {
          access: 'public', // Public access for MVP simplicity
          contentType,
          token: this.token,
        });

        this.logger.log(`Document uploaded successfully: ${blob.url} (${fileBuffer.length} bytes)`);

        return {
          url: blob.url,
          size: fileBuffer.length,
        };
      } catch (error) {
        lastError = error as Error;
        this.logger.error(
          `Upload attempt ${attempt}/${this.MAX_RETRIES} failed for ${filename}: ${error.message}`,
        );

        // Wait 1 second before retry (except on last attempt)
        if (attempt < this.MAX_RETRIES) {
          await this.delay(1000);
        }
      }
    }

    // All retries failed
    throw new InternalServerErrorException(
      `Failed to upload document after ${this.MAX_RETRIES} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Delete a document from Vercel Blob storage
   *
   * @param url - Full Vercel Blob URL to delete
   * @throws InternalServerErrorException if deletion fails
   *
   * @example
   * await storageService.deleteDocument('https://...vercel-storage.com/policies/DZPV12345678/documents/declarations-v1.pdf');
   */
  async deleteDocument(url: string): Promise<void> {
    this.logger.log(`Deleting document: ${url}`);

    try {
      await del(url, {
        token: this.token,
      });

      this.logger.log(`Document deleted successfully: ${url}`);
    } catch (error) {
      this.logger.error(`Failed to delete document ${url}: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to delete document: ${error.message}`,
      );
    }
  }

  /**
   * Get the size of a file in Vercel Blob storage
   *
   * @param url - Full Vercel Blob URL
   * @returns File size in bytes
   * @throws InternalServerErrorException if file metadata retrieval fails
   *
   * @example
   * const size = await storageService.getFileSize('https://...vercel-storage.com/policies/DZPV12345678/documents/declarations-v1.pdf');
   * console.log(size); // 245678
   */
  async getFileSize(url: string): Promise<number> {
    this.logger.log(`Retrieving file size for: ${url}`);

    try {
      const metadata = await head(url, {
        token: this.token,
      });

      this.logger.log(`File size retrieved: ${metadata.size} bytes`);
      return metadata.size;
    } catch (error) {
      this.logger.error(`Failed to retrieve file size for ${url}: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to retrieve file metadata: ${error.message}`,
      );
    }
  }

  /**
   * Generate a download URL for a document
   *
   * For MVP: Returns the Vercel Blob URL directly (URLs include auth token by default)
   *
   * Future Enhancement: Could implement time-limited signed URLs using Vercel Blob's
   * signed URL feature when it becomes available, or implement custom token-based access.
   *
   * @param url - Vercel Blob URL
   * @returns Download URL (currently same as input URL)
   *
   * @example
   * const downloadUrl = await storageService.generateDownloadURL('https://...vercel-storage.com/policies/DZPV12345678/documents/declarations-v1.pdf');
   * // Returns same URL for MVP (already includes auth)
   */
  async generateDownloadURL(url: string): Promise<string> {
    this.logger.log(`Generating download URL for: ${url}`);

    // For MVP: Vercel Blob URLs are already public with access: 'public'
    // No additional signing needed
    // Future: Could implement time-limited tokens here if needed

    return url;
  }

  /**
   * Helper: Delay execution for a given number of milliseconds
   * Used for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
