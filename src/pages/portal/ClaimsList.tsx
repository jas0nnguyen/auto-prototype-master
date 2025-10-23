/**
 * Portal Claims List Page
 *
 * Displays all claims for the policy with ability to file new claims.
 * Design reference: self-service-screens/Claims.png
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Card, Text } from '@sureapp/canary-design-system';
import { usePortalDashboard } from '../../hooks/usePortal';
import { PortalLayout } from '../../components/portal/PortalLayout';

export default function ClaimsList() {
  const { policyNumber } = useParams<{ policyNumber: string }>();
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, error } = usePortalDashboard(policyNumber!);

  if (isLoading || error || !dashboardData) {
    return (
      <PortalLayout policyNumber={policyNumber!} activePage="claims">
        Loading...
      </PortalLayout>
    );
  }

  const { claims } = dashboardData;

  // Format date as MM/DD/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Get badge color for claim status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'info'; // blue
      case 'UNDER_REVIEW':
        return 'warning'; // yellow
      case 'APPROVED':
      case 'PAID':
        return 'success'; // green
      case 'DENIED':
        return 'danger'; // red
      case 'CLOSED':
        return 'default'; // gray
      default:
        return 'default';
    }
  };

  // Format loss type for display
  const formatLossType = (lossType: string) => {
    return lossType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <PortalLayout policyNumber={policyNumber!} activePage="claims">
      <h2 className="text-2xl font-bold mb-6">Claims</h2>

      {/* No Claims - Contact Info Card */}
      <Card className="mb-6">
        <div className="p-6">
          <Text className="mb-4">
            For information about an existing claim or to speak with someone regarding your claim:
          </Text>
          <div className="space-y-1">
            <Text className="font-medium">North American Risk Services (NARS)</Text>
            <Text>Email: reportaclaim@narisk.com</Text>
            <Text>Phone: 1-800-315-6090</Text>
          </div>
        </div>
      </Card>

      {/* File New Claim Button */}
      <button
        onClick={() => navigate(`/portal/${policyNumber}/claims/new`)}
        className="px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
      >
        File a new claim
      </button>
    </PortalLayout>
  );
}
