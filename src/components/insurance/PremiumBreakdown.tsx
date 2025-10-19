import React from 'react';
import {
  Card,
  Layout,
  Text,
  List,
} from '@sureapp/canary-design-system';

interface Coverage {
  bodilyInjuryLimit: string;
  propertyDamageLimit: string;
  hasCollision: boolean;
  collisionDeductible: string;
  hasComprehensive: boolean;
  comprehensiveDeductible: string;
  hasUninsured: boolean;
  hasRoadside: boolean;
  hasRental: boolean;
  rentalLimit: string;
}

interface Premium {
  monthly: number;
  sixMonth: number;
}

interface PremiumBreakdownProps {
  coverage: Coverage;
  premium: Premium;
}

const PremiumBreakdown: React.FC<PremiumBreakdownProps> = ({ coverage, premium }) => {
  // Calculate individual coverage costs
  const baseLiability = 95;
  const collisionCost = coverage.hasCollision ? 32 : 0;
  const comprehensiveCost = coverage.hasComprehensive ? 28 : 0;
  const uninsuredCost = coverage.hasUninsured ? 15 : 0;
  const roadsideCost = coverage.hasRoadside ? 5 : 0;
  const rentalCost = coverage.hasRental ? 8 : 0;

  // Deductible discounts
  const collisionDeductibleDiscount = coverage.hasCollision
    ? ({
        '250': 0,
        '500': -5,
        '1000': -10,
        '2500': -15,
      }[coverage.collisionDeductible] || 0)
    : 0;

  const comprehensiveDeductibleDiscount = coverage.hasComprehensive
    ? ({
        '250': 0,
        '500': -3,
        '1000': -6,
        '2500': -10,
      }[coverage.comprehensiveDeductible] || 0)
    : 0;

  const totalDiscounts = Math.abs(collisionDeductibleDiscount) + Math.abs(comprehensiveDeductibleDiscount);

  return (
    <Card padding="medium">
      <Layout display="flex-column" gap="small">
        <Text variant="body-regular" weight="bold">
          How Your Premium is Calculated
        </Text>

        <List>
          <List.Row>
            <List.Item>Base Liability Coverage</List.Item>
            <List.Item align="right">${baseLiability}/mo</List.Item>
          </List.Row>

          {coverage.hasCollision && (
            <List.Row>
              <List.Item>
                Collision (${coverage.collisionDeductible} deductible)
              </List.Item>
              <List.Item align="right">
                ${collisionCost + collisionDeductibleDiscount}/mo
              </List.Item>
            </List.Row>
          )}

          {coverage.hasComprehensive && (
            <List.Row>
              <List.Item>
                Comprehensive (${coverage.comprehensiveDeductible} deductible)
              </List.Item>
              <List.Item align="right">
                ${comprehensiveCost + comprehensiveDeductibleDiscount}/mo
              </List.Item>
            </List.Row>
          )}

          {coverage.hasUninsured && (
            <List.Row>
              <List.Item>Uninsured Motorist Coverage</List.Item>
              <List.Item align="right">${uninsuredCost}/mo</List.Item>
            </List.Row>
          )}

          {coverage.hasRoadside && (
            <List.Row>
              <List.Item>24/7 Roadside Assistance</List.Item>
              <List.Item align="right">${roadsideCost}/mo</List.Item>
            </List.Row>
          )}

          {coverage.hasRental && (
            <List.Row>
              <List.Item>
                Rental Reimbursement (${coverage.rentalLimit}/day)
              </List.Item>
              <List.Item align="right">${rentalCost}/mo</List.Item>
            </List.Row>
          )}

          {totalDiscounts > 0 && (
            <List.Row>
              <List.Item>
                <Text color="success">Higher Deductible Savings</Text>
              </List.Item>
              <List.Item align="right">
                <Text color="success">-${totalDiscounts}/mo</Text>
              </List.Item>
            </List.Row>
          )}
        </List>

        <div
          style={{
            borderTop: '2px solid #e5e7eb',
            paddingTop: '0.75rem',
            marginTop: '0.5rem',
          }}
        >
          <Layout display="flex" flexAlign="space-between">
            <Text variant="body-large" weight="bold">
              Total Monthly Premium
            </Text>
            <Text variant="body-large" weight="bold" color="primary">
              ${premium.monthly}
            </Text>
          </Layout>
          <Layout display="flex" flexAlign="space-between" style={{ marginTop: '0.25rem' }}>
            <Text variant="body-small" color="subtle">
              6-month total
            </Text>
            <Text variant="body-small" color="subtle">
              ${premium.sixMonth}
            </Text>
          </Layout>
        </div>

        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
          <Text variant="caption-small" color="subtle">
            💡 <strong>Tip:</strong> You saved ${totalDiscounts}/month by choosing higher deductibles.
            This means you pay more out-of-pocket if you file a claim, but you save ${totalDiscounts * 6} over 6 months in premiums.
          </Text>
        </div>
      </Layout>
    </Card>
  );
};

export default PremiumBreakdown;
