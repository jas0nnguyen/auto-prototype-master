/**
 * Coverage Rating Service (T057)
 *
 * Calculates rating factors based on coverage selections including:
 * - Liability limits factor (higher limits: higher premium)
 * - Deductible factor (higher deductible: lower premium)
 * - Coverage type factor (full coverage vs basic)
 *
 * Coverage selection is the most direct driver-controlled factor affecting premium.
 * Customers can significantly adjust their premium by changing:
 * - Liability limits (required by law, but can exceed minimums)
 * - Physical damage deductibles ($250 - $1000+)
 * - Optional coverages (rental, roadside, gap insurance)
 *
 * @module CoverageRatingService
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * Coverage selection for rating
 */
export interface CoverageSelection {
  coverageType: string; // LIABILITY, COLLISION, COMPREHENSIVE, etc.
  limitAmount?: number;
  deductibleAmount?: number;
}

/**
 * Coverage subtotal breakdown
 */
export interface CoverageSubtotal {
  coverage: string;
  premium: number;
}

/**
 * Coverage Rating Service
 *
 * Calculates base premiums and coverage-specific factors.
 * Handles all coverage types defined in OMG Coverage Part reference data.
 */
@Injectable()
export class CoverageRatingService {
  private readonly logger = new Logger(CoverageRatingService.name);

  // Base annual premiums by coverage type (California baseline)
  // In production, these would be loaded from rating tables by state
  private readonly basePremiums: Record<string, number> = {
    'LIABILITY': 600,      // Bodily injury + property damage
    'COLLISION': 400,      // Physical damage from collisions
    'COMPREHENSIVE': 250,  // Physical damage from non-collision
    'UNINSURED_MOTORIST': 100,  // UM/UIM coverage
    'PERSONAL_INJURY_PROTECTION': 150, // PIP/Med pay
    'RENTAL_REIMBURSEMENT': 30,
    'ROADSIDE_ASSISTANCE': 20,
  };

  /**
   * Calculate base premium for all selected coverages
   *
   * Base premium varies by:
   * - Coverage type (liability more expensive than comprehensive)
   * - State (legal environment and minimum requirements)
   * - Limits selected
   * - Deductibles selected
   *
   * @param coverages - Array of coverage selections
   * @param state - Two-letter state code
   * @returns Total base premium before factors
   */
  async calculateBasePremium(coverages: CoverageSelection[], state: string): Promise<number> {
    let totalBasePremium = 0;

    for (const coverage of coverages) {
      const coverageBase = this.basePremiums[coverage.coverageType] || 0;

      // Apply limit and deductible adjustments
      const limitFactor = this.calculateLimitFactor(coverage.coverageType, coverage.limitAmount);
      const deductibleFactor = this.calculateDeductibleFactor(coverage.coverageType, coverage.deductibleAmount);

      const coveragePremium = coverageBase * limitFactor * deductibleFactor;
      totalBasePremium += coveragePremium;

      this.logger.debug(
        `${coverage.coverageType}: Base $${coverageBase} × Limit ${limitFactor} × Deductible ${deductibleFactor} = $${coveragePremium}`
      );
    }

    return totalBasePremium;
  }

  /**
   * Calculate overall coverage factor
   *
   * This represents the risk multiplier based on coverage selections beyond base premium.
   * Generally close to 1.0 since most adjustments are in base premium.
   *
   * @param coverages - Array of coverage selections
   * @returns Coverage factor (typically 0.95 - 1.05)
   */
  async calculateCoverageFactor(coverages: CoverageSelection[]): Promise<number> {
    // For most rating engines, coverage adjustments are built into base premium
    // This factor represents additional risk considerations

    const hasFullCoverage = coverages.some(c => c.coverageType === 'COLLISION') &&
                            coverages.some(c => c.coverageType === 'COMPREHENSIVE');

    const hasHighLimits = coverages.some(
      c => c.coverageType === 'LIABILITY' && (c.limitAmount || 0) >= 500000
    );

    // Full coverage with high limits = slightly better risk profile
    if (hasFullCoverage && hasHighLimits) {
      return 0.95; // More responsible customers
    }

    return 1.0; // Standard factor
  }

  /**
   * Get detailed premium breakdown by coverage
   *
   * @param coverages - Array of coverage selections
   * @returns Array of coverage subtotals
   */
  async getCoverageBreakdown(coverages: CoverageSelection[]): Promise<CoverageSubtotal[]> {
    const breakdown: CoverageSubtotal[] = [];

    for (const coverage of coverages) {
      const coverageBase = this.basePremiums[coverage.coverageType] || 0;
      const limitFactor = this.calculateLimitFactor(coverage.coverageType, coverage.limitAmount);
      const deductibleFactor = this.calculateDeductibleFactor(coverage.coverageType, coverage.deductibleAmount);

      const premium = coverageBase * limitFactor * deductibleFactor;

      breakdown.push({
        coverage: coverage.coverageType,
        premium: Math.round(premium * 100) / 100, // Round to cents
      });
    }

    return breakdown;
  }

  /**
   * Calculate limit-based factor
   *
   * Higher liability limits:
   * - Protect customer better
   * - Increase insurer exposure
   * - Correlate with more responsible drivers (slight discount effect)
   *
   * Standard limits (split limits):
   * - 25/50/25: State minimum (many states)
   * - 50/100/50: Recommended minimum
   * - 100/300/100: Good coverage
   * - 250/500/250: Excellent coverage
   * - 500/1000/500: High coverage
   *
   * Combined Single Limit (CSL):
   * - 100k, 300k, 500k, 1M, etc.
   *
   * @param coverageType - Type of coverage
   * @param limitAmount - Limit amount in dollars
   * @returns Limit factor (0.7 - 2.0)
   */
  private calculateLimitFactor(coverageType: string, limitAmount?: number): number {
    if (coverageType !== 'LIABILITY' || !limitAmount) {
      return 1.0;
    }

    // Liability limits affect premium significantly
    if (limitAmount <= 50000) {
      return 0.7; // Minimum coverage (25/50/25 or lower)
    } else if (limitAmount <= 100000) {
      return 0.85; // Low coverage (50/100/50)
    } else if (limitAmount <= 300000) {
      return 1.0; // Standard coverage (100/300/100)
    } else if (limitAmount <= 500000) {
      return 1.3; // Higher coverage (250/500/250)
    } else if (limitAmount <= 1000000) {
      return 1.6; // High coverage (500/1000/500 or 1M CSL)
    } else {
      return 2.0; // Very high coverage (over 1M)
    }
  }

  /**
   * Calculate deductible-based factor
   *
   * Higher deductibles:
   * - Reduce insurer's exposure on smaller claims
   * - Customer assumes more risk
   * - Lower premium (inverse relationship)
   *
   * Common deductibles:
   * - Collision: $250, $500, $1000, $2000
   * - Comprehensive: $100, $250, $500, $1000
   *
   * @param coverageType - Type of coverage
   * @param deductibleAmount - Deductible amount in dollars
   * @returns Deductible factor (0.7 - 1.15)
   */
  private calculateDeductibleFactor(coverageType: string, deductibleAmount?: number): number {
    // Only collision and comprehensive use deductibles
    if (!['COLLISION', 'COMPREHENSIVE'].includes(coverageType) || !deductibleAmount) {
      return 1.0;
    }

    // Lower deductible = higher premium (customer has less skin in the game)
    // Higher deductible = lower premium (customer assumes more risk)
    if (deductibleAmount <= 250) {
      return 1.15; // Low deductible
    } else if (deductibleAmount === 500) {
      return 1.0; // Standard deductible (baseline)
    } else if (deductibleAmount === 1000) {
      return 0.85; // High deductible
    } else if (deductibleAmount >= 2000) {
      return 0.7; // Very high deductible
    }

    return 1.0; // Default
  }

  /**
   * Validate that coverage limits meet state minimums
   *
   * Each state mandates minimum liability coverage.
   * This validation ensures compliance.
   *
   * @param coverages - Coverage selections
   * @param state - Two-letter state code
   * @returns Validation result with errors if any
   */
  async validateStateMinimums(coverages: CoverageSelection[], state: string): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // State minimum requirements (simplified - would be in database)
    const stateMinimums: Record<string, {bodilyInjury: number; propertyDamage: number}> = {
      'CA': {bodilyInjury: 30000, propertyDamage: 15000}, // 15/30/5 actual, using higher for demo
      'TX': {bodilyInjury: 60000, propertyDamage: 25000}, // 30/60/25
      'FL': {bodilyInjury: 20000, propertyDamage: 10000}, // 10/20/10
      'NY': {bodilyInjury: 50000, propertyDamage: 25000}, // 25/50/10
    };

    const minimums = stateMinimums[state] || {bodilyInjury: 50000, propertyDamage: 25000}; // Default

    // Check for liability coverage
    const liability = coverages.find(c => c.coverageType === 'LIABILITY');

    if (!liability) {
      errors.push('Liability coverage is required');
    } else if (liability.limitAmount && liability.limitAmount < minimums.bodilyInjury) {
      errors.push(`Liability limit must meet state minimum of $${minimums.bodilyInjury}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
