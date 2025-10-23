/**
 * Billing History Page
 *
 * Displays payment history and billing information for a policy.
 * Design reference: self-service-screens/Billing.png
 */

import { useParams } from 'react-router-dom';
import { Card, Text } from '@sureapp/canary-design-system';
import { usePortalDashboard } from '../../hooks/usePortal';
import { PortalLayout } from '../../components/portal/PortalLayout';

export default function BillingHistory() {
  const { policyNumber } = useParams<{ policyNumber: string }>();
  const { data: dashboardData, isLoading, error } = usePortalDashboard(policyNumber!);

  if (isLoading || error || !dashboardData) {
    return (
      <PortalLayout policyNumber={policyNumber!} activePage="billing">
        Loading...
      </PortalLayout>
    );
  }

  const { payment_history, premium } = dashboardData;

  // Format dates as MM/DD/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  // Format payment method with last 4 digits
  const formatPaymentMethod = (method: string, last4: string, cardBrand?: string) => {
    const methodType = method === 'credit_card' ? 'Credit Card' : 'Bank Account';
    const brand = cardBrand ? ` (${cardBrand})` : '';
    return `${methodType}${brand} ending in ${last4}`;
  };

  // Get status badge color
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
      case 'ERROR':
        return 'error';
      default:
        return 'default';
    }
  };

  // Calculate next payment due date (30 days from last payment)
  const getNextPaymentDate = () => {
    if (!payment_history || payment_history.length === 0) return null;

    const lastPayment = payment_history[payment_history.length - 1];
    const lastDate = new Date(lastPayment.payment_date);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 30);

    return formatDate(nextDate.toISOString());
  };

  const nextPaymentDate = premium?.paymentPlan === 'monthly' ? getNextPaymentDate() : null;

  return (
    <PortalLayout policyNumber={policyNumber!} activePage="billing">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Billing</h2>
        <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
          <span>✏️</span> Edit
        </button>
      </div>

      {/* Billing Information Card */}
      <Card className="mb-6">
        <div className="divide-y">
          {/* Payment Plan */}
          <div className="grid grid-cols-2 p-6">
            <Text>Payment plan</Text>
            <Text className="text-right">
              {premium?.paymentPlan === 'full' ? 'Paid in Full' : 'Monthly'}
            </Text>
          </div>

          {/* Payment Method */}
          {payment_history && payment_history.length > 0 && (
            <div className="grid grid-cols-2 p-6">
              <Text>Payment method</Text>
              <Text className="text-right">
                {payment_history[0].card_brand && (
                  <span className="inline-block mr-2">
                    {payment_history[0].card_brand.toUpperCase()}
                  </span>
                )}
                Ending in {payment_history[0].last_four_digits}
              </Text>
            </div>
          )}

          {/* Next Payment Amount (for monthly plans) */}
          {premium?.paymentPlan === 'monthly' && premium.monthlyPayment && (
            <div className="grid grid-cols-2 p-6">
              <Text>Next payment amount</Text>
              <Text className="text-right">
                {formatCurrency(premium.monthlyPayment)}
              </Text>
            </div>
          )}

          {/* Next Bill Date (for monthly plans) */}
          {nextPaymentDate && (
            <div className="grid grid-cols-2 p-6">
              <Text>Next bill date</Text>
              <Text className="text-right">{nextPaymentDate}</Text>
            </div>
          )}
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="mb-6">
        <div className="p-6">
          <Text className="mb-3">
            For information about billing or to speak with someone regarding your bill:
          </Text>
          <div className="space-y-1">
            <Text className="font-medium">Sure</Text>
            <Text>Phone: (844) 335-5441</Text>
            <Text>Email: support@sureapp.com</Text>
            <Text className="text-gray-600">Mon-Fri, 8am-4pm CT</Text>
          </div>
        </div>
      </Card>

      {/* Cancel Policy Link */}
      <div>
        <button className="text-red-600 hover:text-red-700 text-sm">Cancel Policy</button>
      </div>
    </PortalLayout>
  );
}
