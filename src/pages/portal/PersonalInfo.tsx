/**
 * Personal Information Page
 *
 * Displays primary driver personal information (read-only).
 * Design reference: self-service-screens/Personal Info.png
 */

import { useParams } from 'react-router-dom';
import { Card, Text } from '@sureapp/canary-design-system';
import { usePortalDashboard } from '../../hooks/usePortal';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { formatDateDisplay } from '../../utils/dateFormatter';

export default function PersonalInfo() {
  const { policyNumber } = useParams<{ policyNumber: string }>();
  const { data: dashboardData, isLoading, error } = usePortalDashboard(policyNumber!);

  if (isLoading || error || !dashboardData) {
    return <PortalLayout policyNumber={policyNumber!}>Loading...</PortalLayout>;
  }

  const { primary_driver } = dashboardData;

  const formatPhone = (phone: string) => {
    // Format as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  return (
    <PortalLayout policyNumber={policyNumber!} activePage="personal-info">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Personal information</h2>
        <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
          <span>✏️</span> Edit
        </button>
      </div>

      <Card>
        <div className="divide-y">
          {/* Name */}
          <div className="grid grid-cols-2 p-6">
            <Text>Name</Text>
            <Text className="text-right">
              {primary_driver.firstName} {primary_driver.lastName}
            </Text>
          </div>

          {/* Date of Birth */}
          {primary_driver.birthDate && (
            <div className="grid grid-cols-2 p-6">
              <Text>Date of birth</Text>
              <Text className="text-right">{formatDateDisplay(primary_driver.birthDate)}</Text>
            </div>
          )}

          {/* Phone Number */}
          {primary_driver.phone && (
            <div className="grid grid-cols-2 p-6">
              <Text>Phone number</Text>
              <Text className="text-right">{formatPhone(primary_driver.phone)}</Text>
            </div>
          )}

          {/* Email Address */}
          {primary_driver.email && (
            <div className="grid grid-cols-2 p-6">
              <Text>Email address</Text>
              <Text className="text-right">{primary_driver.email}</Text>
            </div>
          )}

          {/* Mailing Address */}
          {primary_driver.address && (
            <div className="grid grid-cols-2 p-6">
              <Text>Mailing address</Text>
              <div className="text-right">
                <Text>{primary_driver.address.addressLine1}</Text>
                {primary_driver.address.addressLine2 && <Text>{primary_driver.address.addressLine2}</Text>}
                <Text>
                  {primary_driver.address.city}, {primary_driver.address.state} {primary_driver.address.zipCode}
                </Text>
              </div>
            </div>
          )}
        </div>
      </Card>
    </PortalLayout>
  );
}
