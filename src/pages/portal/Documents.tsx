/**
 * Documents Page
 *
 * Displays policy documents with download capability.
 * Design reference: self-service-screens/Documents.png
 */

import { useParams } from 'react-router-dom';
import { Card, Text } from '@sureapp/canary-design-system';
import { usePortalDashboard } from '../../hooks/usePortal';
import { PortalLayout } from '../../components/portal/PortalLayout';

export default function Documents() {
  const { policyNumber } = useParams<{ policyNumber: string }>();
  const { data: dashboardData, isLoading, error } = usePortalDashboard(policyNumber!);

  if (isLoading || error || !dashboardData) {
    return (
      <PortalLayout policyNumber={policyNumber!} activePage="documents">
        Loading...
      </PortalLayout>
    );
  }

  const documents = dashboardData.documents || [];

  /**
   * Format date for display
   */
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  /**
   * Get display name for document type
   */
  const getDocumentTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      POLICY_DOCUMENT: 'Policy Document',
      ID_CARD: 'Insurance ID Card',
      DECLARATIONS: 'Policy Declarations',
      ENDORSEMENT: 'Policy Endorsement',
      CANCELLATION: 'Cancellation Notice',
      RENEWAL: 'Renewal Notice',
    };
    return typeMap[type] || type;
  };

  /**
   * Handle document download (mock)
   */
  const handleDownload = (doc: any) => {
    // In production, this would download the actual file
    alert(`Download mock: ${doc.document_name}\n\nIn production, this would download the document from:\n${doc.storage_url}`);
  };

  /**
   * Handle document view (mock)
   */
  const handleView = (doc: any) => {
    // In production, this would open the document in a new tab
    alert(`View mock: ${doc.document_name}\n\nIn production, this would open the document in a new tab.`);
  };

  return (
    <PortalLayout policyNumber={policyNumber!} activePage="documents">
      <h2 className="text-2xl font-bold mb-6">Documents</h2>

      {documents.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Text>No documents available</Text>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc: any) => (
            <Card key={doc.document_id}>
              <div className="p-6 flex items-center justify-between">
                {/* Document Info */}
                <div className="flex items-center gap-4">
                  {/* PDF Icon */}
                  <div className="w-12 h-12 rounded bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-xs">PDF</span>
                  </div>

                  {/* Document Name */}
                  <Text className="font-medium">
                    {doc.document_name || getDocumentTypeName(doc.document_type)}
                  </Text>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleView(doc)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>👁️</span> View
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>⬇️</span> Download
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
