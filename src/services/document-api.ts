/**
 * Document API Client - Frontend HTTP client for document operations
 *
 * Provides methods to interact with document API endpoints:
 * - List documents for a policy
 * - Download document by ID
 *
 * Feature: 003-portal-document-download
 * Task: T026
 */

export interface DocumentMetadata {
  document_id: string;
  document_number: string;
  document_type: 'DECLARATIONS' | 'POLICY_DOCUMENT' | 'ID_CARD' | 'CLAIM_ATTACHMENT' | 'PROOF_OF_INSURANCE';
  document_name: string;
  version: number;
  is_current: boolean;
  document_status: 'GENERATING' | 'READY' | 'FAILED' | 'SUPERSEDED';
  storage_url: string | null;
  file_size_bytes: number | null;
  mime_type: string;
  created_at: Date;
  accessed_at: Date | null;
  accessed_count: number;
}

export interface ListDocumentsResponse {
  success: boolean;
  data: DocumentMetadata[];
  meta: {
    policy_number: string;
    total: number;
    filter: {
      document_type: string | null;
      include_superseded: boolean;
    };
  };
}

/**
 * Document API Client
 *
 * Handles all HTTP requests to the document API endpoints.
 * Base URL is configured via environment variable or defaults to localhost.
 */
class DocumentAPIClient {
  private readonly baseURL: string;

  constructor() {
    // Use Vite environment variable for API base URL
    // In development: http://localhost:3000
    // In production: auto-configured by Vercel
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  /**
   * List all documents for a policy
   *
   * @param policyNumber - Human-readable policy number (e.g., DZQV87Z4FH)
   * @param options - Query options
   * @returns Promise with array of document metadata
   *
   * @example
   * const documents = await documentAPI.listDocuments('DZQV87Z4FH');
   * const allVersions = await documentAPI.listDocuments('DZQV87Z4FH', { includeSuperseded: true });
   */
  async listDocuments(
    policyNumber: string,
    options: {
      documentType?: DocumentMetadata['document_type'];
      includeSuperseded?: boolean;
    } = {}
  ): Promise<ListDocumentsResponse> {
    const { documentType, includeSuperseded = false } = options;

    // Build query parameters
    const params = new URLSearchParams();
    if (documentType) {
      params.append('document_type', documentType);
    }
    if (includeSuperseded) {
      params.append('include_superseded', 'true');
    }

    const queryString = params.toString();
    const url = `${this.baseURL}/api/v1/portal/${policyNumber}/documents${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch documents: ${response.statusText}`);
      }

      const result: ListDocumentsResponse = await response.json();
      return result;
    } catch (error) {
      console.error('[DocumentAPI] Failed to list documents:', error);
      throw error;
    }
  }

  /**
   * Download a document by ID
   *
   * Opens the document download URL in a new window/tab.
   * The backend will redirect to the signed Blob storage URL.
   *
   * @param policyNumber - Human-readable policy number
   * @param documentId - UUID of the document
   *
   * @example
   * documentAPI.downloadDocument('DZQV87Z4FH', '123e4567-e89b-12d3-a456-426614174000');
   */
  downloadDocument(policyNumber: string, documentId: string): void {
    const url = `${this.baseURL}/api/v1/portal/${policyNumber}/documents/${documentId}/download`;

    // Open download URL in new window
    // Backend will redirect to signed Blob URL
    window.open(url, '_blank');
  }

  /**
   * Get download URL for a document
   *
   * Returns the URL without triggering download.
   * Useful for custom download handling or UI components.
   *
   * @param policyNumber - Human-readable policy number
   * @param documentId - UUID of the document
   * @returns Download URL string
   */
  getDownloadURL(policyNumber: string, documentId: string): string {
    return `${this.baseURL}/api/v1/portal/${policyNumber}/documents/${documentId}/download`;
  }
}

// Export singleton instance
export const documentAPI = new DocumentAPIClient();
