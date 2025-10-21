/**
 * Discount Calculator (T058)
 *
 * Calculates premium discounts based on favorable customer characteristics.
 * Implements 7 standard auto insurance discounts per spec FR-062:
 *
 * 1. MULTI_CAR: 10-20% for multiple vehicles on same policy
 * 2. GOOD_DRIVER: 15-25% for no accidents/violations 3+ years
 * 3. DEFENSIVE_DRIVING: 5-10% for defensive driving course completion
 * 4. LOW_MILEAGE: 5-15% for <7,500 miles/year
 * 5. HOMEOWNER: 5-10% for homeownership
 * 6. ADVANCE_QUOTE: 5% for quote 7+ days before effective date
 * 7. PAPERLESS: 3-5% for electronic documents and payment
 *
 * Total discounts are capped at 50% of base premium per industry standards.
 *
 * @module DiscountCalculator
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * Discount information
 */
export interface DiscountInfo {
  code: string;
  name: string;
  amount: number;
  percentage: number;
}

/**
 * Input data for discount calculation
 */
export interface DiscountCalculationInput {
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
  driver: {
    age: number;
    yearsLicensed: number;
    violations?: Array<{type: string; date: Date}>;
    accidents?: Array<{type: string; atFault: boolean; date: Date}>;
  };
  location: {
    zipCode: string;
    state: string;
  };
  effectiveDate: Date;
  annualMileage?: number;
  multiCarDiscount?: boolean; // Multiple vehicles on policy
  homeownerDiscount?: boolean; // Customer owns home
  defensiveDrivingCourse?: boolean; // Completed defensive driving course
  paperlessDiscount?: boolean; // Enrolled in paperless billing/docs
}

/**
 * Discount Calculator Service
 *
 * Evaluates customer characteristics and policy details to determine
 * all applicable discounts. Discounts are applied multiplicatively to
 * the adjusted premium.
 */
@Injectable()
export class DiscountCalculator {
  private readonly logger = new Logger(DiscountCalculator.name);

  // Maximum total discount allowed (industry standard cap)
  private readonly MAX_TOTAL_DISCOUNT_PERCENTAGE = 50;

  /**
   * Calculate all applicable discounts
   *
   * Evaluates each discount type and returns array of applied discounts
   * with both dollar amount and percentage. Total discount is capped at 50%.
   *
   * @param input - Discount calculation input data
   * @param basePremium - Base premium before discounts (optional, for amount calculation)
   * @returns Array of applicable discounts
   */
  async calculateDiscounts(
    input: DiscountCalculationInput,
    basePremium?: number
  ): Promise<DiscountInfo[]> {
    const discounts: DiscountInfo[] = [];

    // 1. Multi-car discount
    const multiCarDiscount = this.calculateMultiCarDiscount(input.multiCarDiscount);
    if (multiCarDiscount > 0) {
      discounts.push({
        code: 'MULTI_CAR',
        name: 'Multi-Car Discount',
        amount: basePremium ? (basePremium * multiCarDiscount) : 0,
        percentage: multiCarDiscount * 100,
      });
    }

    // 2. Good driver discount
    const goodDriverDiscount = this.calculateGoodDriverDiscount(
      input.driver.violations || [],
      input.driver.accidents || []
    );
    if (goodDriverDiscount > 0) {
      discounts.push({
        code: 'GOOD_DRIVER',
        name: 'Good Driver Discount',
        amount: basePremium ? (basePremium * goodDriverDiscount) : 0,
        percentage: goodDriverDiscount * 100,
      });
    }

    // 3. Defensive driving course discount
    const defensiveDrivingDiscount = this.calculateDefensiveDrivingDiscount(
      input.defensiveDrivingCourse
    );
    if (defensiveDrivingDiscount > 0) {
      discounts.push({
        code: 'DEFENSIVE_DRIVING',
        name: 'Defensive Driving Course Discount',
        amount: basePremium ? (basePremium * defensiveDrivingDiscount) : 0,
        percentage: defensiveDrivingDiscount * 100,
      });
    }

    // 4. Low mileage discount
    const lowMileageDiscount = this.calculateLowMileageDiscount(input.annualMileage);
    if (lowMileageDiscount > 0) {
      discounts.push({
        code: 'LOW_MILEAGE',
        name: 'Low Mileage Discount',
        amount: basePremium ? (basePremium * lowMileageDiscount) : 0,
        percentage: lowMileageDiscount * 100,
      });
    }

    // 5. Homeowner discount
    const homeownerDiscount = this.calculateHomeownerDiscount(input.homeownerDiscount);
    if (homeownerDiscount > 0) {
      discounts.push({
        code: 'HOMEOWNER',
        name: 'Homeowner Discount',
        amount: basePremium ? (basePremium * homeownerDiscount) : 0,
        percentage: homeownerDiscount * 100,
      });
    }

    // 6. Advance quote discount
    const advanceQuoteDiscount = this.calculateAdvanceQuoteDiscount(input.effectiveDate);
    if (advanceQuoteDiscount > 0) {
      discounts.push({
        code: 'ADVANCE_QUOTE',
        name: 'Advance Quote Discount',
        amount: basePremium ? (basePremium * advanceQuoteDiscount) : 0,
        percentage: advanceQuoteDiscount * 100,
      });
    }

    // 7. Paperless discount
    const paperlessDiscount = this.calculatePaperlessDiscount(input.paperlessDiscount);
    if (paperlessDiscount > 0) {
      discounts.push({
        code: 'PAPERLESS',
        name: 'Paperless Discount',
        amount: basePremium ? (basePremium * paperlessDiscount) : 0,
        percentage: paperlessDiscount * 100,
      });
    }

    // Apply total discount cap
    const totalDiscountPercentage = discounts.reduce((sum, d) => sum + d.percentage, 0);
    if (totalDiscountPercentage > this.MAX_TOTAL_DISCOUNT_PERCENTAGE) {
      this.logger.warn(
        `Total discount ${totalDiscountPercentage}% exceeds cap of ${this.MAX_TOTAL_DISCOUNT_PERCENTAGE}%. Applying cap.`
      );

      // Pro-rate discounts to fit within cap
      const scaleFactor = this.MAX_TOTAL_DISCOUNT_PERCENTAGE / totalDiscountPercentage;
      discounts.forEach(discount => {
        discount.percentage *= scaleFactor;
        discount.amount *= scaleFactor;
      });
    }

    this.logger.debug(
      `Applied ${discounts.length} discounts totaling ${discounts.reduce((s, d) => s + d.percentage, 0).toFixed(1)}%`
    );

    return discounts;
  }

  /**
   * Calculate multi-car discount
   *
   * Customers with multiple vehicles on the same policy get a discount
   * because they consolidate their insurance spend and are less likely to churn.
   *
   * @param hasMultipleCars - Multiple vehicles on policy
   * @returns Discount percentage (0 - 0.20)
   */
  private calculateMultiCarDiscount(hasMultipleCars?: boolean): number {
    if (!hasMultipleCars) {
      return 0;
    }

    // 15% discount for multi-car policies
    return 0.15;
  }

  /**
   * Calculate good driver discount
   *
   * Drivers with clean records (no at-fault accidents or violations in 3+ years)
   * demonstrate lower risk and receive a significant discount.
   *
   * @param violations - Driver violations
   * @param accidents - Driver accidents
   * @returns Discount percentage (0 - 0.25)
   */
  private calculateGoodDriverDiscount(
    violations: Array<{type: string; date: Date}>,
    accidents: Array<{type: string; atFault: boolean; date: Date}>
  ): number {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    // Check for violations in last 3 years
    const recentViolations = violations.filter(v => new Date(v.date) >= threeYearsAgo);

    // Check for at-fault accidents in last 3 years
    const recentAccidents = accidents.filter(
      a => a.atFault && new Date(a.date) >= threeYearsAgo
    );

    // Clean record = 20% discount
    if (recentViolations.length === 0 && recentAccidents.length === 0) {
      return 0.20;
    }

    return 0;
  }

  /**
   * Calculate defensive driving course discount
   *
   * Completion of an approved defensive driving course demonstrates
   * commitment to safe driving and earns a discount.
   *
   * @param completedCourse - Driver completed defensive driving course
   * @returns Discount percentage (0 - 0.10)
   */
  private calculateDefensiveDrivingDiscount(completedCourse?: boolean): number {
    if (!completedCourse) {
      return 0;
    }

    // 8% discount for defensive driving course
    return 0.08;
  }

  /**
   * Calculate low mileage discount
   *
   * Drivers who drive fewer miles annually have lower exposure to accidents.
   * Significant discount for very low mileage (<7,500 miles/year).
   *
   * @param annualMileage - Estimated annual mileage
   * @returns Discount percentage (0 - 0.15)
   */
  private calculateLowMileageDiscount(annualMileage?: number): number {
    if (!annualMileage) {
      return 0; // No data = no discount
    }

    if (annualMileage < 5000) {
      return 0.15; // 15% discount for very low mileage
    } else if (annualMileage < 7500) {
      return 0.10; // 10% discount for low mileage
    } else if (annualMileage < 10000) {
      return 0.05; // 5% discount for moderate low mileage
    }

    return 0; // No discount for normal/high mileage
  }

  /**
   * Calculate homeowner discount
   *
   * Homeowners are statistically more stable customers with better credit
   * and lower claim frequency. Many insurers bundle home and auto insurance.
   *
   * @param isHomeowner - Customer owns home
   * @returns Discount percentage (0 - 0.10)
   */
  private calculateHomeownerDiscount(isHomeowner?: boolean): number {
    if (!isHomeowner) {
      return 0;
    }

    // 8% discount for homeowners
    return 0.08;
  }

  /**
   * Calculate advance quote discount
   *
   * Quotes generated 7+ days before the effective date indicate planning
   * and less rush, correlating with more responsible customers.
   *
   * @param effectiveDate - Policy effective date
   * @returns Discount percentage (0 - 0.05)
   */
  private calculateAdvanceQuoteDiscount(effectiveDate: Date): number {
    const today = new Date();
    const daysUntilEffective = Math.floor(
      (new Date(effectiveDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilEffective >= 7) {
      return 0.05; // 5% discount for advance quotes
    }

    return 0;
  }

  /**
   * Calculate paperless discount
   *
   * Customers who opt for electronic documents and payment reduce
   * insurer's administrative costs and earn a small discount.
   *
   * @param isPaperless - Customer enrolled in paperless
   * @returns Discount percentage (0 - 0.05)
   */
  private calculatePaperlessDiscount(isPaperless?: boolean): number {
    if (!isPaperless) {
      return 0;
    }

    // 4% discount for paperless
    return 0.04;
  }

  /**
   * Get total discount percentage from discount array
   *
   * @param discounts - Array of discount info
   * @returns Total discount percentage
   */
  getTotalDiscountPercentage(discounts: DiscountInfo[]): number {
    return discounts.reduce((sum, d) => sum + d.percentage, 0);
  }

  /**
   * Get total discount dollar amount from discount array
   *
   * @param discounts - Array of discount info
   * @returns Total discount dollar amount
   */
  getTotalDiscountAmount(discounts: DiscountInfo[]): number {
    return discounts.reduce((sum, d) => sum + d.amount, 0);
  }
}
