/**
 * Additional Drivers Page
 *
 * Displays all drivers on the policy except the primary insured (read-only).
 * Design reference: self-service-screens/Additional Insured.png (adapted for drivers)
 */

import { useParams } from 'react-router-dom';
import { Card, Text } from '@sureapp/canary-design-system';
import { usePortalDashboard } from '../../hooks/usePortal';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { formatDateDisplay } from '../../utils/dateFormatter';

export default function AdditionalDrivers() {
  const { policyNumber } = useParams<{ policyNumber: string }>();
  const { data: dashboardData, isLoading, error } = usePortalDashboard(policyNumber!);

  if (isLoading || error || !dashboardData) {
    return <PortalLayout policyNumber={policyNumber!} activePage="drivers">Loading...</PortalLayout>;
  }

  const { additional_drivers } = dashboardData;

  return (
    <PortalLayout policyNumber={policyNumber!} activePage="drivers">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Additional insureds</h2>
        <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
          <span>✏️</span> Edit
        </button>
      </div>

      {additional_drivers && additional_drivers.length > 0 ? (
        <div className="space-y-6">
          {additional_drivers.map((driver: any, index: number) => (
            <Card key={index}>
              <div className="divide-y">
                {/* Driver Header */}
                <div className="p-6 bg-gray-50">
                  <Text className="font-medium">Additional insured {index + 1}</Text>
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 p-6">
                  <Text>Name</Text>
                  <Text className="text-right">
                    {driver.firstName} {driver.lastName}
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-6">
            <Text>No additional insureds on this policy.</Text>
          </div>
        </Card>
      )}
    </PortalLayout>
  );
}
