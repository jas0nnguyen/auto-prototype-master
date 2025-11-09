/**
 * Documents Page - Enhanced with real API integration
 *
 * Displays policy documents with download capability using:
 * - Real document API (not mock data)
 * - Document status badges
 * - File size display
 * - Download tracking
 *
 * Feature: 003-portal-document-download
 * Tasks: T028, T029
 */

import { useParams } from 'react-router-dom';
import { Card, Text, Button, Badge, Spinner, Alert } from '@sureapp/canary-design-system';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { useDocumentList, useDownloadDocument } from '../../hooks/useDocuments';
import { DocumentMetadata } from '../../services/document-api';

export default function Documents() {
  const { policyNumber } = useParams<{ policyNumber: string }>();
  const { data: response, isLoading, error } = useDocumentList(policyNumber!);
  const downloadDocument = useDownloadDocument(policyNumber!);

  if (isLoading) {
    return (
      <PortalLayout policyNumber={policyNumber!} activePage="documents">
        <div className="flex justify-center items-center p-12">
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

  /**
   * Get status badge color based on document status
   */
  const getStatusBadgeColor = (status: DocumentMetadata['document_status']) => {
    switch (status) {
      case 'READY':
        return 'success';
      case 'GENERATING':
        return 'warning';
      case 'FAILED':
        return 'error';
      case 'SUPERSEDED':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  /**
   * Get icon for document type
   * Using text-based icons for now (Canary may have icon components)
   */
  const getDocumentIcon = (type: DocumentMetadata['document_type']) => {
    switch (type) {
      case 'DECLARATIONS':
        return '📄';
      case 'POLICY_DOCUMENT':
        return '📋';
      case 'ID_CARD':
        return '🪪';
      case 'CLAIM_ATTACHMENT':
        return '📎';
      case 'PROOF_OF_INSURANCE':
        return '✅';
      default:
        return '📄';
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
            <Text size="lg" color="muted">
              No documents available yet
            </Text>
            <Text size="sm" color="muted" className="mt-2">
              Documents will appear here once your policy is bound
            </Text>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc: DocumentMetadata) => (
            <Card key={doc.document_id}>
              <div className="p-5 flex items-center justify-between gap-4">
                {/* Document Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Document Type Icon */}
                  <div className="text-3xl flex-shrink-0" aria-label="Document type icon">
                    {getDocumentIcon(doc.document_type)}
                  </div>

                  {/* Document Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Text className="font-medium truncate">
                        {doc.document_name}
                      </Text>

                      {/* Status Badge */}
                      <Badge
                        color={getStatusBadgeColor(doc.document_status)}
                        size="sm"
                      >
                        {doc.document_status}
                      </Badge>

                      {/* Current Version Badge */}
                      {doc.is_current && (
                        <Badge color="info" size="sm">
                          Current
                        </Badge>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 mt-1">
                      <Text size="xs" color="muted">
                        Version {doc.version}
                      </Text>
                      <Text size="xs" color="muted">
                        •
                      </Text>
                      <Text size="xs" color="muted">
                        {formatFileSize(doc.file_size_bytes)}
                      </Text>
                      {doc.accessed_count > 0 && (
                        <>
                          <Text size="xs" color="muted">
                            •
                          </Text>
                          <Text size="xs" color="muted">
                            Downloaded {doc.accessed_count} {doc.accessed_count === 1 ? 'time' : 'times'}
                          </Text>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {doc.document_status === 'GENERATING' ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <Text size="sm" color="muted">Generating...</Text>
                    </div>
                  ) : doc.document_status === 'READY' ? (
                    <Button
                      onClick={() => downloadDocument(doc.document_id)}
                      size="sm"
                      variant="primary"
                    >
                      Download
                    </Button>
                  ) : doc.document_status === 'FAILED' ? (
                    <Text size="sm" color="error">
                      Generation failed
                    </Text>
                  ) : (
                    <Text size="sm" color="muted">
                      Superseded
                    </Text>
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
