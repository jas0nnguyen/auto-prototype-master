/**
 * useDocuments - TanStack Query hooks for document operations
 *
 * Provides React hooks for:
 * - Fetching document list with automatic caching and refetching
 * - Downloading documents
 *
 * Feature: 003-portal-document-download
 * Task: T027
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { documentAPI, DocumentMetadata, ListDocumentsResponse } from '../services/document-api';

/**
 * Query key factory for document-related queries
 *
 * Provides consistent query keys for cache management:
 * - documents.list(policyNumber) - All documents for a policy
 * - documents.list(policyNumber, {filters}) - Filtered documents
 */
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (policyNumber: string, filters?: {
    documentType?: DocumentMetadata['document_type'];
    includeSuperseded?: boolean;
  }) => [...documentKeys.lists(), policyNumber, filters] as const,
  detail: (documentId: string) => [...documentKeys.all, 'detail', documentId] as const,
};

/**
 * Hook to fetch documents for a policy
 *
 * Automatically fetches and caches document list.
 * Refetches when policy number or filters change.
 *
 * @param policyNumber - Human-readable policy number (e.g., DZQV87Z4FH)
 * @param options - Query options and filters
 * @returns TanStack Query result with document list
 *
 * @example
 * ```tsx
 * function DocumentsPage() {
 *   const { data, isLoading, error } = useDocumentList('DZQV87Z4FH');
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Alert>Error loading documents</Alert>;
 *
 *   return (
 *     <div>
 *       {data.data.map(doc => (
 *         <DocumentRow key={doc.document_id} document={doc} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDocumentList(
  policyNumber: string,
  filters?: {
    documentType?: DocumentMetadata['document_type'];
    includeSuperseded?: boolean;
  },
  queryOptions?: Omit<UseQueryOptions<ListDocumentsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListDocumentsResponse, Error>({
    queryKey: documentKeys.list(policyNumber, filters),
    queryFn: () => documentAPI.listDocuments(policyNumber, filters),
    staleTime: 1000 * 60 * 5, // 5 minutes - documents don't change frequently
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache for portal navigation
    retry: 2, // Retry failed requests twice
    enabled: !!policyNumber, // Only run query if policyNumber exists
    ...queryOptions,
  });
}

/**
 * Hook to download a document
 *
 * Returns a function that triggers document download in new window/tab.
 * Logs download access and redirects to Blob storage URL.
 *
 * @param policyNumber - Human-readable policy number
 * @returns Download function
 *
 * @example
 * ```tsx
 * function DownloadButton({ documentId }: { documentId: string }) {
 *   const policyNumber = 'DZQV87Z4FH';
 *   const downloadDocument = useDownloadDocument(policyNumber);
 *
 *   return (
 *     <Button onClick={() => downloadDocument(documentId)}>
 *       Download
 *     </Button>
 *   );
 * }
 * ```
 */
export function useDownloadDocument(policyNumber: string) {
  return (documentId: string) => {
    documentAPI.downloadDocument(policyNumber, documentId);
  };
}

/**
 * Hook to get download URL for a document
 *
 * Returns the download URL without triggering download.
 * Useful for custom link components or programmatic access.
 *
 * @param policyNumber - Human-readable policy number
 * @param documentId - Document UUID
 * @returns Download URL string
 *
 * @example
 * ```tsx
 * function DocumentLink({ documentId }: { documentId: string }) {
 *   const policyNumber = 'DZQV87Z4FH';
 *   const downloadURL = useDocumentURL(policyNumber, documentId);
 *
 *   return <a href={downloadURL} target="_blank" rel="noopener noreferrer">Download</a>;
 * }
 * ```
 */
export function useDocumentURL(policyNumber: string, documentId: string): string {
  return documentAPI.getDownloadURL(policyNumber, documentId);
}
