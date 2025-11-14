import React from 'react';
import {
  Layout,
  Card,
  Title,
  Text
} from '@sureapp/canary-design-system';
import './PriceSidebar.css';

/**
 * PriceSidebar Component - T095
 *
 * Displays quote pricing information in a sticky sidebar:
 * - 6-month term
 * - Due today amount
 * - Payment plan details
 * - Total premium
 * - Discount breakdowns
 *
 * Responsive behavior:
 * - Desktop (≥1024px): Sticky sidebar at top: 120px
 * - Mobile (<1024px): Fixed bottom bar with "View Details" button
 *
 * Data source: quote prop passed from parent component
 */

interface Discount {
  name: string;
  amount: number;
}

interface PriceSidebarProps {
  quote?: any;
  isLoading?: boolean;
}

export const PriceSidebar: React.FC<PriceSidebarProps> = ({ quote, isLoading = false }) => {
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = React.useState(false);

  console.log('[PriceSidebar] Quote:', quote);
  console.log('[PriceSidebar] Premium:', quote?.premium);

  // Extract premium data from quote
  const sixMonthPremium = quote?.premium?.total || quote?.premium?.sixMonth || 0;
  const dueToday = quote?.premium?.dueToday || (sixMonthPremium / 6) || 0;
  const remainingPayments = 5; // Standard 6-month policy = 1 down + 5 remaining
  const paymentAmount = sixMonthPremium > 0 ? sixMonthPremium / 6 : 0;

  // Extract discounts from quote
  const discounts: Discount[] = quote?.discounts?.map(d => ({
    name: d.name || d.code,
    amount: d.amount
  })) || [];

  // Calculate subtotal before discounts
  const totalDiscounts = discounts.reduce((acc, d) => acc + Math.abs(d.amount), 0);
  const subtotal = sixMonthPremium + totalDiscounts;

  // Loading state
  if (isLoading) {
    return (
      <>
        <div className="price-sidebar-desktop">
          <Card padding="large">
            <Layout display="flex-column" gap="medium" flexAlign="center">
              <Text variant="body-regular" color="subtle">
                Loading quote...
              </Text>
            </Layout>
          </Card>
        </div>
        <div className="price-sidebar-mobile">
          <div className="price-sidebar-mobile-bar">
            <Text variant="body-small" color="subtle">
              Loading...
            </Text>
          </div>
        </div>
      </>
    );
  }

  // If no quote data yet, show placeholder
  if (!quote) {
    return (
      <>
        <div className="price-sidebar-desktop">
          <Card padding="large">
            <Layout display="flex-column" gap="medium">
              <Title variant="title-3">Your Quote</Title>
              <Text variant="body-regular" color="subtle">
                Quote details will appear here
              </Text>
            </Layout>
          </Card>
        </div>
        <div className="price-sidebar-mobile">
          <div className="price-sidebar-mobile-bar">
            <Text variant="body-small" color="subtle">
              No quote data
            </Text>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="price-sidebar-desktop">
        <Card padding="large">
          <Layout display="flex-column" gap="medium">
            <Title variant="title-3">Your Quote</Title>

            {/* Monthly Price - Primary Display */}
            <Layout
              display="flex-column"
              gap="small"
              padding="medium"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
              }}
            >
              <Text variant="body-small" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Monthly Payment
              </Text>
              <Title variant="display-2" style={{ color: '#ffffff' }}>
                ${paymentAmount.toFixed(2)}
              </Title>
              <Text variant="body-small" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                /month
              </Text>
            </Layout>

            {/* 6-Month Total */}
            <Layout display="flex" flexJustify="space-between" flexAlign="center">
              <Text variant="body-regular" color="subtle">
                6-Month Total
              </Text>
              <Text variant="title-4" style={{ fontWeight: 700 }}>
                ${sixMonthPremium.toFixed(2)}
              </Text>
            </Layout>

            <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

            <Layout display="flex-column" gap="small">
              <Layout display="flex" flexJustify="space-between">
                <Text variant="body-regular">Due Today</Text>
                <Text variant="body-regular" style={{ fontWeight: 600 }}>
                  ${dueToday.toFixed(2)}
                </Text>
              </Layout>

              <Layout display="flex" flexJustify="space-between">
                <Text variant="body-small" color="subtle">
                  Remaining {remainingPayments} payments
                </Text>
                <Text variant="body-small" color="subtle">
                  ${paymentAmount.toFixed(2)}/mo
                </Text>
              </Layout>
            </Layout>

            {discounts.length > 0 && (
              <>
                <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

                <Layout display="flex-column" gap="small">
                  <Text variant="body-small" style={{ fontWeight: 600 }}>
                    Discounts Applied
                  </Text>

                  {discounts.map(discount => (
                    <Layout
                      key={discount.name}
                      display="flex"
                      flexJustify="space-between"
                    >
                      <Text variant="body-small" color="subtle">
                        {discount.name}
                      </Text>
                      <Text
                        variant="body-small"
                        style={{ color: '#10b981', fontWeight: 600 }}
                      >
                        ${Math.abs(discount.amount)}
                      </Text>
                    </Layout>
                  ))}
                </Layout>

                <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

                <Layout display="flex" flexJustify="space-between">
                  <Text variant="body-small" color="subtle">
                    Subtotal before discounts
                  </Text>
                  <Text variant="body-small" color="subtle">
                    ${subtotal.toFixed(2)}
                  </Text>
                </Layout>
              </>
            )}
          </Layout>
        </Card>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="price-sidebar-mobile">
        <div className="price-sidebar-mobile-bar">
          <div>
            <Text variant="body-small" color="subtle">
              Monthly Payment
            </Text>
            <Text variant="title-4" style={{ fontWeight: 700 }}>
              ${paymentAmount.toFixed(2)}/mo
            </Text>
            <Text variant="body-small" color="subtle" style={{ fontSize: '12px', marginTop: '2px' }}>
              ${sixMonthPremium.toFixed(2)} 6-month total
            </Text>
          </div>
          <button
            className="view-details-button"
            onClick={() => setIsMobileDetailsOpen(true)}
          >
            View Details
          </button>
        </div>

        {/* Mobile Details Modal */}
        {isMobileDetailsOpen && (
          <div
            className="mobile-details-overlay"
            onClick={() => setIsMobileDetailsOpen(false)}
          >
            <div
              className="mobile-details-content"
              onClick={(e) => e.stopPropagation()}
            >
              <Card padding="large">
                <Layout display="flex-column" gap="medium">
                  <Layout display="flex" flexJustify="space-between" flexAlign="center">
                    <Title variant="title-3">Your Quote</Title>
                    <button
                      onClick={() => setIsMobileDetailsOpen(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                  </Layout>

                  {/* Monthly Price - Primary Display */}
                  <Layout
                    display="flex-column"
                    gap="small"
                    padding="medium"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                    }}
                  >
                    <Text variant="body-small" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Monthly Payment
                    </Text>
                    <Title variant="display-2" style={{ color: '#ffffff' }}>
                      ${paymentAmount.toFixed(2)}
                    </Title>
                    <Text variant="body-small" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      /month
                    </Text>
                  </Layout>

                  {/* 6-Month Total */}
                  <Layout display="flex" flexJustify="space-between" flexAlign="center">
                    <Text variant="body-regular" color="subtle">
                      6-Month Total
                    </Text>
                    <Text variant="title-4" style={{ fontWeight: 700 }}>
                      ${sixMonthPremium.toFixed(2)}
                    </Text>
                  </Layout>

                  <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

                  <Layout display="flex-column" gap="small">
                    <Layout display="flex" flexJustify="space-between">
                      <Text variant="body-regular">Due Today</Text>
                      <Text variant="body-regular" style={{ fontWeight: 600 }}>
                        ${dueToday.toFixed(2)}
                      </Text>
                    </Layout>

                    <Layout display="flex" flexJustify="space-between">
                      <Text variant="body-small" color="subtle">
                        Remaining {remainingPayments} payments
                      </Text>
                      <Text variant="body-small" color="subtle">
                        ${paymentAmount.toFixed(2)}/mo
                      </Text>
                    </Layout>
                  </Layout>

                  {discounts.length > 0 && (
                    <>
                      <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

                      <Layout display="flex-column" gap="small">
                        <Text variant="body-small" style={{ fontWeight: 600 }}>
                          Discounts Applied
                        </Text>

                        {discounts.map(discount => (
                          <Layout
                            key={discount.name}
                            display="flex"
                            flexJustify="space-between"
                          >
                            <Text variant="body-small" color="subtle">
                              {discount.name}
                            </Text>
                            <Text
                              variant="body-small"
                              style={{ color: '#10b981', fontWeight: 600 }}
                            >
                              ${Math.abs(discount.amount)}
                            </Text>
                          </Layout>
                        ))}
                      </Layout>
                    </>
                  )}
                </Layout>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
