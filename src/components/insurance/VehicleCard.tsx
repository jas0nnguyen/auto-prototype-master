/**
 * VehicleCard Component (T076)
 *
 * Displays vehicle information in a card format.
 * Used in quote results and policy details pages.
 */

import React from 'react';
import {
  Card,
  Text,
  Badge,
  Divider,
  Stack,
} from '@sureapp/canary-design-system';

/**
 * Props for VehicleCard component
 */
interface VehicleCardProps {
  /** Vehicle year (e.g., 2023) */
  year: number;

  /** Vehicle make (e.g., 'Toyota') */
  make: string;

  /** Vehicle model (e.g., 'Camry') */
  model: string;

  /** Vehicle trim level (optional, e.g., 'LE', 'XLE') */
  trim?: string;

  /** Vehicle VIN (optional) */
  vin?: string;

  /** Estimated vehicle value */
  estimatedValue?: number;

  /** Annual mileage */
  annualMileage?: number;

  /** Vehicle usage type (e.g., 'PERSONAL', 'COMMUTE', 'BUSINESS') */
  usageType?: string;

  /** NHTSA safety rating (1-5 stars) */
  safetyRating?: number;

  /** Currency code (default: 'USD') */
  currency?: string;

  /** Optional click handler */
  onClick?: () => void;
}

/**
 * VehicleCard Component
 */
const VehicleCard: React.FC<VehicleCardProps> = ({
  year,
  make,
  model,
  trim,
  vin,
  estimatedValue,
  annualMileage,
  usageType,
  safetyRating,
  currency = 'USD',
  onClick,
}) => {
  /**
   * Format currency value
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Format mileage with thousands separator
   */
  const formatMileage = (miles: number): string => {
    return new Intl.NumberFormat('en-US').format(miles) + ' mi/year';
  };

  /**
   * Format usage type to display-friendly text
   */
  const formatUsageType = (usage: string): string => {
    const usageMap: Record<string, string> = {
      'PERSONAL': 'Personal Use',
      'COMMUTE': 'Commuting',
      'BUSINESS': 'Business Use',
    };
    return usageMap[usage] || usage;
  };

  /**
   * Build vehicle title
   * Example: "2023 Toyota Camry LE"
   */
  const vehicleTitle = [year, make, model, trim]
    .filter(Boolean)
    .join(' ');

  return (
    <Card
      variant="outlined"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Stack spacing="small">
        {/* Header: Vehicle Title and Safety Rating */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="title-3" weight="semibold">
            {vehicleTitle}
          </Text>

          {safetyRating && (
            <Badge
              color={safetyRating >= 5 ? 'green' : safetyRating >= 4 ? 'blue' : 'yellow'}
              size="small"
            >
              {safetyRating}★ Safety
            </Badge>
          )}
        </div>

        <Divider />

        {/* VIN (if provided) */}
        {vin && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text variant="body-small" color="secondary">
              VIN:
            </Text>
            <Text variant="body-small" weight="medium" style={{ fontFamily: 'monospace' }}>
              {vin}
            </Text>
          </div>
        )}

        {/* Estimated Value */}
        {estimatedValue && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text variant="body-small" color="secondary">
              Estimated Value:
            </Text>
            <Text variant="body-small" weight="medium">
              {formatCurrency(estimatedValue)}
            </Text>
          </div>
        )}

        {/* Annual Mileage */}
        {annualMileage && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text variant="body-small" color="secondary">
              Annual Mileage:
            </Text>
            <Text variant="body-small" weight="medium">
              {formatMileage(annualMileage)}
            </Text>
          </div>
        )}

        {/* Usage Type */}
        {usageType && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text variant="body-small" color="secondary">
              Usage:
            </Text>
            <Text variant="body-small" weight="medium">
              {formatUsageType(usageType)}
            </Text>
          </div>
        )}
      </Stack>
    </Card>
  );
};

export default VehicleCard;
