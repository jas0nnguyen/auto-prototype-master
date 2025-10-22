/**
 * Vehicle Details Page
 *
 * Displays all vehicles insured on the policy (read-only).
 * Design reference: self-service-screens/Property Details.png (adapted for vehicles)
 */

import { useParams } from 'react-router-dom';
import { Card, Text } from '@sureapp/canary-design-system';
import { usePortalDashboard } from '../../hooks/usePortal';
import { PortalLayout } from '../../components/portal/PortalLayout';

export default function VehicleDetails() {
  const { policyNumber } = useParams<{ policyNumber: string }>();
  const { data: dashboardData, isLoading, error } = usePortalDashboard(policyNumber!);

  if (isLoading || error || !dashboardData) {
    return <PortalLayout policyNumber={policyNumber!} activePage="vehicles">Loading...</PortalLayout>;
  }

  const { vehicles } = dashboardData;

  return (
    <PortalLayout policyNumber={policyNumber!} activePage="vehicles">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Property details</h2>
        <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
          <span>✏️</span> Edit
        </button>
      </div>

      {vehicles && vehicles.length > 0 ? (
        <Card>
          <div className="divide-y">
            {/* Address - Using first vehicle's data as placeholder */}
            <div className="grid grid-cols-2 p-6">
              <Text>Address</Text>
              <div className="text-right">
                <Text>{vehicles[0].year} {vehicles[0].make} {vehicles[0].model}</Text>
                {vehicles[0].vin && <Text className="text-gray-600">{vehicles[0].vin}</Text>}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-6">
            <Text>No property details found on this policy.</Text>
          </div>
        </Card>
      )}
    </PortalLayout>
  );
}
