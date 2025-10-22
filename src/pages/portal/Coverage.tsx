/**
 * Coverage Page
 *
 * Displays policy coverage details (read-only).
 * Design reference: self-service-screens/Coverage.png
 */

import { useParams } from 'react-router-dom';
import { Card, Text } from '@sureapp/canary-design-system';
import { usePortalDashboard } from '../../hooks/usePortal';
import { PortalLayout } from '../../components/portal/PortalLayout';

export default function Coverage() {
  const { policyNumber } = useParams<{ policyNumber: string }>();
  const { data: dashboardData, isLoading, error } = usePortalDashboard(policyNumber!);

  if (isLoading || error || !dashboardData) {
    return (
      <PortalLayout policyNumber={policyNumber!} activePage="coverage">
        Loading...
      </PortalLayout>
    );
  }

  const { quote_snapshot } = dashboardData;
  const coverages = quote_snapshot?.coverages || {};

  /**
   * Format split limit (e.g., "100/300" -> "$100,000 / $300,000")
   */
  const formatSplitLimit = (limit: string) => {
    if (!limit) return 'Not selected';
    const parts = limit.split('/');
    if (parts.length === 2) {
      const first = parseInt(parts[0]) * 1000;
      const second = parseInt(parts[1]) * 1000;
      return `$${first.toLocaleString()} / $${second.toLocaleString()}`;
    }
    return limit;
  };

  /**
   * Format single limit (e.g., "50" -> "$50,000")
   */
  const formatLimit = (limit: string | number) => {
    if (!limit) return 'Not selected';
    const amount = typeof limit === 'string' ? parseInt(limit) : limit;
    return `$${(amount * 1000).toLocaleString()}`;
  };

  /**
   * Format deductible (e.g., 500 -> "$500")
   */
  const formatDeductible = (deductible: number) => {
    if (!deductible) return 'Not applicable';
    return `$${deductible.toLocaleString()}`;
  };

  return (
    <PortalLayout policyNumber={policyNumber!} activePage="coverage">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Coverage</h2>
        <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
          <span>✏️</span> Edit
        </button>
      </div>

      {/* Base Coverage */}
      <Card className="mb-6">
        <div className="p-6 border-b bg-gray-50">
          <Text className="font-medium">Base coverage</Text>
        </div>

        <div className="divide-y">
          {/* Personal Property Coverage (renters equivalent) */}
          <div className="grid grid-cols-2 p-6">
            <Text>Personal property coverage</Text>
            <Text className="text-right">$50,000</Text>
          </div>

          {/* Liability Coverage */}
          <div className="grid grid-cols-2 p-6">
            <Text>Liability coverage</Text>
            <Text className="text-right">$25,000</Text>
          </div>

          {/* Deductible */}
          <div className="grid grid-cols-2 p-6">
            <Text>Deductible</Text>
            <Text className="text-right">$250</Text>
          </div>
        </div>
      </Card>

      {/* Optional Coverages */}
      <Card>
        <div className="p-6 border-b bg-gray-50">
          <Text className="font-medium">Optional coverages</Text>
        </div>

        <div className="divide-y">
          {/* Personal Property Sublimits */}
          <div className="grid grid-cols-2 p-6">
            <Text>Personal property sublimits</Text>
            <Text className="text-right">Platinum enhancement</Text>
          </div>

          {/* Pet Damage */}
          <div className="grid grid-cols-2 p-6">
            <Text>Pet damage</Text>
            <Text className="text-right">Included</Text>
          </div>

          {/* Identity Fraud */}
          <div className="grid grid-cols-2 p-6">
            <Text>Identity fraud</Text>
            <Text className="text-right">$5,000</Text>
          </div>

          {/* Windstorm or Hail Exclusion */}
          <div className="grid grid-cols-2 p-6">
            <Text>Windstorm or hail exclusion</Text>
            <Text className="text-right">Included</Text>
          </div>

          {/* Earthquake */}
          <div className="grid grid-cols-2 p-6">
            <Text>Earthquake</Text>
            <Text className="text-right">$8,000</Text>
          </div>
        </div>
      </Card>
    </PortalLayout>
  );
}
