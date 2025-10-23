/**
 * Portal Dashboard Page (Overview)
 *
 * Displays policy overview with quick access to key information.
 * Design reference: self-service-screens/Overview.png
 */

import { useParams } from 'react-router-dom';
import { Card, Text } from '@sureapp/canary-design-system';
import { usePortalDashboard } from '../../hooks/usePortal';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { formatDateDisplay } from '../../utils/dateFormatter';

export default function Dashboard() {
  const { policyNumber } = useParams<{ policyNumber: string }>();
  const { data: dashboardData, isLoading, error } = usePortalDashboard(policyNumber!);

  if (isLoading || error || !dashboardData) {
    return <PortalLayout policyNumber={policyNumber!} activePage="overview">Loading...</PortalLayout>;
  }

  const { policy, premium } = dashboardData;

  // Format currency
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  return (
    <PortalLayout policyNumber={policyNumber!} activePage="overview">
      <h2 className="text-2xl font-bold mb-6">Overview</h2>

      <Card>
        <table className="w-full">
          <tbody className="divide-y divide-gray-200">
            {/* Renters / Policy Number */}
            <tr>
              <td className="p-6">
                <Text>Renters</Text>
              </td>
              <td className="p-6 text-right">
                <Text>Policy #{policy.policy_number}</Text>
              </td>
            </tr>

            {/* Status */}
            <tr>
              <td className="p-6">
                <Text>Status</Text>
              </td>
              <td className="p-6 text-right">
                <Text>{policy.status === 'IN_FORCE' ? 'Active' : policy.status}</Text>
              </td>
            </tr>

            {/* Policy Term */}
            <tr>
              <td className="p-6">
                <Text>Policy term</Text>
              </td>
              <td className="p-6 text-right">
                <Text>
                  {formatDateDisplay(policy.effective_date)} - {formatDateDisplay(policy.expiration_date)}
                </Text>
              </td>
            </tr>

            {/* Total Premium */}
            <tr>
              <td className="p-6">
                <Text>Total premium</Text>
              </td>
              <td className="p-6 text-right">
                <Text>{formatCurrency(premium.total || premium.sixMonthTotal || 0)}</Text>
              </td>
            </tr>

            {/* Payment Plan */}
            <tr>
              <td className="p-6">
                <Text>Payment plan</Text>
              </td>
              <td className="p-6 text-right">
                <Text>{premium.paymentPlan === 'full' ? 'Paid in Full' : 'Monthly'}</Text>
              </td>
            </tr>

            {/* Next Payment */}
            {premium.paymentPlan === 'monthly' && (
              <tr>
                <td className="p-6">
                  <Text>Next payment amount</Text>
                </td>
                <td className="p-6 text-right">
                  <Text>{formatCurrency(premium.monthlyPayment || 0)}</Text>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </PortalLayout>
  );
}
