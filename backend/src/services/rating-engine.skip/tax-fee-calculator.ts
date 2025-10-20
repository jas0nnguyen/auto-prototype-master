/**
 * Tax and Fee Calculator (T060b)
 *
 * Calculates state-specific taxes and fees that are added to the premium.
 *
 * Implements three types of charges per FR-064:
 * 1. Premium Tax (2-4% by state) - Required tax on insurance premiums
 * 2. Policy Fee ($10-$25) - Administrative fee charged by insurer
 * 3. DMV Fees (varies by state) - Department of Motor Vehicles fees
 *
 * Tax and fee rates vary significantly by state due to different
 * regulatory requirements and state insurance departments.
 *
 * @module TaxFeeCalculator
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * Input for tax and fee calculation
 */
export interface TaxFeeCalculationInput {
  premium: number; // Premium before taxes and fees
  state: string; // Two-letter state code
  policyTerm: number; // Policy term in months
}

/**
 * Breakdown of taxes and fees
 */
export interface TaxFeeBreakdown {
  // Premium Tax
  premiumTaxPercentage: number;
  premiumTaxAmount: number;

  // Fees
  policyFeeAmount: number;
  dmvFeeAmount: number;

  // Totals
  totalTaxes: number;
  totalFees: number;
  totalTaxesAndFees: number;
}

/**
 * State-specific tax and fee rates
 */
interface StateRates {
  premiumTaxRate: number; // Percentage (e.g., 2.5 = 2.5%)
  policyFee: number; // Flat fee in dollars
  dmvFee: number; // DMV fee in dollars
}

/**
 * Tax and Fee Calculator Service
 *
 * Calculates state-specific taxes and fees that are added to the insurance premium.
 */
@Injectable()
export class TaxFeeCalculator {
  private readonly logger = new Logger(TaxFeeCalculator.name);

  /**
   * State-specific rates
   *
   * In production, these would be loaded from a database table and updated
   * as state regulations change. Rates shown here are representative averages.
   *
   * Sources:
   * - Premium tax rates from state insurance departments
   * - Policy fees are insurer-specific but regulated by state maximums
   * - DMV fees from state DMV schedules
   */
  private readonly STATE_RATES: Record<string, StateRates> = {
    // California
    CA: {
      premiumTaxRate: 2.35,
      policyFee: 15.00,
      dmvFee: 25.00,
    },

    // Texas
    TX: {
      premiumTaxRate: 1.75,
      policyFee: 12.00,
      dmvFee: 20.00,
    },

    // Florida
    FL: {
      premiumTaxRate: 1.75,
      policyFee: 14.00,
      dmvFee: 22.00,
    },

    // New York
    NY: {
      premiumTaxRate: 2.50,
      policyFee: 18.00,
      dmvFee: 30.00,
    },

    // Pennsylvania
    PA: {
      premiumTaxRate: 2.00,
      policyFee: 13.00,
      dmvFee: 24.00,
    },

    // Illinois
    IL: {
      premiumTaxRate: 2.25,
      policyFee: 16.00,
      dmvFee: 23.00,
    },

    // Ohio
    OH: {
      premiumTaxRate: 1.40,
      policyFee: 11.00,
      dmvFee: 18.00,
    },

    // Georgia
    GA: {
      premiumTaxRate: 2.50,
      policyFee: 14.00,
      dmvFee: 21.00,
    },

    // North Carolina
    NC: {
      premiumTaxRate: 1.90,
      policyFee: 13.00,
      dmvFee: 19.00,
    },

    // Michigan
    MI: {
      premiumTaxRate: 1.25,
      policyFee: 15.00,
      dmvFee: 26.00,
    },

    // New Jersey
    NJ: {
      premiumTaxRate: 2.10,
      policyFee: 17.00,
      dmvFee: 28.00,
    },

    // Virginia
    VA: {
      premiumTaxRate: 2.25,
      policyFee: 14.00,
      dmvFee: 22.00,
    },

    // Washington
    WA: {
      premiumTaxRate: 2.00,
      policyFee: 15.00,
      dmvFee: 24.00,
    },

    // Arizona
    AZ: {
      premiumTaxRate: 2.00,
      policyFee: 12.00,
      dmvFee: 20.00,
    },

    // Massachusetts
    MA: {
      premiumTaxRate: 2.28,
      policyFee: 16.00,
      dmvFee: 27.00,
    },

    // Tennessee
    TN: {
      premiumTaxRate: 1.75,
      policyFee: 12.00,
      dmvFee: 19.00,
    },

    // Indiana
    IN: {
      premiumTaxRate: 1.30,
      policyFee: 11.00,
      dmvFee: 17.00,
    },

    // Missouri
    MO: {
      premiumTaxRate: 2.00,
      policyFee: 13.00,
      dmvFee: 20.00,
    },

    // Maryland
    MD: {
      premiumTaxRate: 2.00,
      policyFee: 15.00,
      dmvFee: 25.00,
    },

    // Wisconsin
    WI: {
      premiumTaxRate: 2.00,
      policyFee: 13.00,
      dmvFee: 21.00,
    },

    // Colorado
    CO: {
      premiumTaxRate: 2.00,
      policyFee: 14.00,
      dmvFee: 22.00,
    },

    // Minnesota
    MN: {
      premiumTaxRate: 2.00,
      policyFee: 14.00,
      dmvFee: 23.00,
    },

    // South Carolina
    SC: {
      premiumTaxRate: 1.25,
      policyFee: 12.00,
      dmvFee: 18.00,
    },

    // Alabama
    AL: {
      premiumTaxRate: 2.45,
      policyFee: 13.00,
      dmvFee: 19.00,
    },

    // Louisiana
    LA: {
      premiumTaxRate: 2.25,
      policyFee: 14.00,
      dmvFee: 21.00,
    },

    // Kentucky
    KY: {
      premiumTaxRate: 1.90,
      policyFee: 12.00,
      dmvFee: 18.00,
    },

    // Oregon
    OR: {
      premiumTaxRate: 2.30,
      policyFee: 15.00,
      dmvFee: 23.00,
    },

    // Oklahoma
    OK: {
      premiumTaxRate: 2.25,
      policyFee: 12.00,
      dmvFee: 19.00,
    },

    // Connecticut
    CT: {
      premiumTaxRate: 1.75,
      policyFee: 16.00,
      dmvFee: 26.00,
    },

    // Utah
    UT: {
      premiumTaxRate: 2.25,
      policyFee: 13.00,
      dmvFee: 20.00,
    },

    // Nevada
    NV: {
      premiumTaxRate: 3.50,
      policyFee: 14.00,
      dmvFee: 22.00,
    },

    // Arkansas
    AR: {
      premiumTaxRate: 2.50,
      policyFee: 12.00,
      dmvFee: 18.00,
    },

    // Mississippi
    MS: {
      premiumTaxRate: 3.00,
      policyFee: 11.00,
      dmvFee: 17.00,
    },

    // Kansas
    KS: {
      premiumTaxRate: 2.00,
      policyFee: 12.00,
      dmvFee: 19.00,
    },

    // New Mexico
    NM: {
      premiumTaxRate: 3.00,
      policyFee: 13.00,
      dmvFee: 20.00,
    },

    // Nebraska
    NE: {
      premiumTaxRate: 1.00,
      policyFee: 12.00,
      dmvFee: 18.00,
    },

    // West Virginia
    WV: {
      premiumTaxRate: 3.00,
      policyFee: 12.00,
      dmvFee: 17.00,
    },

    // Idaho
    ID: {
      premiumTaxRate: 1.50,
      policyFee: 11.00,
      dmvFee: 16.00,
    },

    // Hawaii
    HI: {
      premiumTaxRate: 4.265,
      policyFee: 18.00,
      dmvFee: 30.00,
    },

    // New Hampshire
    NH: {
      premiumTaxRate: 1.25,
      policyFee: 15.00,
      dmvFee: 24.00,
    },

    // Maine
    ME: {
      premiumTaxRate: 2.00,
      policyFee: 14.00,
      dmvFee: 22.00,
    },

    // Rhode Island
    RI: {
      premiumTaxRate: 2.00,
      policyFee: 16.00,
      dmvFee: 25.00,
    },

    // Montana
    MT: {
      premiumTaxRate: 2.75,
      policyFee: 12.00,
      dmvFee: 18.00,
    },

    // Delaware
    DE: {
      premiumTaxRate: 2.00,
      policyFee: 15.00,
      dmvFee: 23.00,
    },

    // South Dakota
    SD: {
      premiumTaxRate: 2.50,
      policyFee: 11.00,
      dmvFee: 17.00,
    },

    // North Dakota
    ND: {
      premiumTaxRate: 2.00,
      policyFee: 11.00,
      dmvFee: 16.00,
    },

    // Alaska
    AK: {
      premiumTaxRate: 2.70,
      policyFee: 17.00,
      dmvFee: 27.00,
    },

    // Vermont
    VT: {
      premiumTaxRate: 2.00,
      policyFee: 14.00,
      dmvFee: 22.00,
    },

    // Wyoming
    WY: {
      premiumTaxRate: 0.75,
      policyFee: 10.00,
      dmvFee: 15.00,
    },
  };

  /**
   * Default rates for unknown states
   */
  private readonly DEFAULT_RATES: StateRates = {
    premiumTaxRate: 2.00,
    policyFee: 14.00,
    dmvFee: 21.00,
  };

  /**
   * Calculate taxes and fees
   *
   * Calculates state-specific premium tax, policy fee, and DMV fees.
   *
   * @param input - Tax and fee calculation input
   * @returns Complete breakdown of taxes and fees
   */
  async calculate(input: TaxFeeCalculationInput): Promise<TaxFeeBreakdown> {
    const stateCode = input.state?.toUpperCase();
    const rates = this.STATE_RATES[stateCode] || this.DEFAULT_RATES;

    if (!this.STATE_RATES[stateCode]) {
      this.logger.warn(
        `Unknown state code: ${stateCode}. Using default rates. ` +
        `Premium Tax: ${this.DEFAULT_RATES.premiumTaxRate}%, ` +
        `Policy Fee: $${this.DEFAULT_RATES.policyFee}, ` +
        `DMV Fee: $${this.DEFAULT_RATES.dmvFee}`
      );
    }

    // Calculate premium tax (percentage of premium)
    const premiumTaxAmount = this.roundCurrency(
      (input.premium * rates.premiumTaxRate) / 100
    );

    // Policy fee and DMV fee are flat amounts
    const policyFeeAmount = rates.policyFee;
    const dmvFeeAmount = rates.dmvFee;

    // Totals
    const totalTaxes = premiumTaxAmount;
    const totalFees = policyFeeAmount + dmvFeeAmount;
    const totalTaxesAndFees = totalTaxes + totalFees;

    this.logger.debug(
      `State: ${stateCode}, Premium Tax: ${rates.premiumTaxRate}% ($${premiumTaxAmount.toFixed(2)}), ` +
      `Policy Fee: $${policyFeeAmount.toFixed(2)}, DMV Fee: $${dmvFeeAmount.toFixed(2)}, ` +
      `Total: $${totalTaxesAndFees.toFixed(2)}`
    );

    return {
      premiumTaxPercentage: rates.premiumTaxRate,
      premiumTaxAmount,
      policyFeeAmount,
      dmvFeeAmount,
      totalTaxes,
      totalFees,
      totalTaxesAndFees,
    };
  }

  /**
   * Get total taxes and fees from breakdown
   *
   * @param breakdown - Tax and fee breakdown
   * @returns Total taxes and fees amount
   */
  getTotalTaxesAndFees(breakdown: TaxFeeBreakdown): number {
    return breakdown.totalTaxesAndFees;
  }

  /**
   * Get state-specific rates
   *
   * Utility method to retrieve rates for a specific state.
   *
   * @param stateCode - Two-letter state code
   * @returns State-specific rates or default rates
   */
  getStateRates(stateCode: string): StateRates {
    const state = stateCode?.toUpperCase();
    return this.STATE_RATES[state] || this.DEFAULT_RATES;
  }

  /**
   * Round currency to 2 decimal places
   *
   * @param amount - Amount to round
   * @returns Rounded amount
   */
  private roundCurrency(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  /**
   * Validate state code
   *
   * Checks if the provided state code is valid US state/territory.
   *
   * @param stateCode - Two-letter state code
   * @returns True if valid, false otherwise
   */
  isValidStateCode(stateCode: string): boolean {
    const state = stateCode?.toUpperCase();
    return this.STATE_RATES.hasOwnProperty(state);
  }

  /**
   * Get list of supported states
   *
   * @returns Array of supported state codes
   */
  getSupportedStates(): string[] {
    return Object.keys(this.STATE_RATES).sort();
  }
}
