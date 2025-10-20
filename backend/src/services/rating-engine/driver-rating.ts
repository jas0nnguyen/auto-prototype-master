/**
 * Driver Rating Service (T055)
 *
 * Calculates rating factors based on driver characteristics including:
 * - Age factor (16-25: 1.5-2.0, 25-65: 0.9-1.0, 65+: 1.1)
 * - Experience factor (0-3 years: 1.3, 3-10: 1.0, 10+: 0.9)
 * - Violations factor (each ticket: +15%, each accident: +20%, DUI: +75%)
 *
 * Driver characteristics are the strongest predictor of claim frequency and severity.
 * Younger, inexperienced drivers have significantly higher accident rates.
 *
 * @module DriverRatingService
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * Driver violation information
 */
export interface DriverViolation {
  type: string; // SPEEDING, DUI, RECKLESS, etc.
  date: Date;
}

/**
 * Driver accident information
 */
export interface DriverAccident {
  type: string; // COLLISION, PROPERTY_DAMAGE, etc.
  atFault: boolean;
  date: Date;
}

/**
 * Driver information for rating
 */
export interface DriverInfo {
  age: number;
  yearsLicensed: number;
  gender?: string;
  maritalStatus?: string;
  violations?: DriverViolation[];
  accidents?: DriverAccident[];
  continuousCoverage?: boolean;
}

/**
 * Detailed breakdown of driver rating factors
 */
export interface DriverFactorDetails {
  ageFactor: number;
  experienceFactor: number;
  genderFactor: number;
  maritalStatusFactor: number;
  violationsFactor: number;
  accidentsFactor: number;
  continuousCoverageFactor: number;
  totalFactor: number;
}

/**
 * Driver Rating Service
 *
 * Analyzes driver characteristics to determine risk-based premium multipliers.
 * Driver factors are typically the most significant component of auto insurance rating.
 */
@Injectable()
export class DriverRatingService {
  private readonly logger = new Logger(DriverRatingService.name);

  /**
   * Calculate overall driver rating factor
   *
   * Combines all driver-specific factors:
   * - Age (young drivers have much higher accident rates)
   * - Experience (years licensed)
   * - Driving record (violations and accidents)
   * - Demographics (gender, marital status where legally permitted)
   * - Coverage history (continuous coverage indicates responsibility)
   *
   * @param driver - Driver information
   * @returns Combined driver rating factor (typically 0.8 - 3.0)
   */
  async calculateDriverFactor(driver: DriverInfo): Promise<number> {
    const details = await this.getFactorDetails(driver);
    return details.totalFactor;
  }

  /**
   * Get detailed breakdown of driver rating factors
   *
   * @param driver - Driver information
   * @returns Detailed factor breakdown
   */
  async getFactorDetails(driver: DriverInfo): Promise<DriverFactorDetails> {
    const ageFactor = this.calculateAgeFactor(driver.age);
    const experienceFactor = this.calculateExperienceFactor(driver.yearsLicensed, driver.age);
    const genderFactor = this.calculateGenderFactor(driver.gender);
    const maritalStatusFactor = this.calculateMaritalStatusFactor(driver.maritalStatus);
    const violationsFactor = this.calculateViolationsFactor(driver.violations || []);
    const accidentsFactor = this.calculateAccidentsFactor(driver.accidents || []);
    const continuousCoverageFactor = this.calculateContinuousCoverageFactor(driver.continuousCoverage);

    // Combined factor is multiplicative
    const totalFactor =
      ageFactor *
      experienceFactor *
      genderFactor *
      maritalStatusFactor *
      violationsFactor *
      accidentsFactor *
      continuousCoverageFactor;

    return {
      ageFactor,
      experienceFactor,
      genderFactor,
      maritalStatusFactor,
      violationsFactor,
      accidentsFactor,
      continuousCoverageFactor,
      totalFactor,
    };
  }

  /**
   * Calculate age-based rating factor
   *
   * Age bands reflect actuarial claim data:
   * - 16-20: Highest risk (inexperience + risk-taking behavior)
   * - 21-24: Very high risk (still developing judgment)
   * - 25-64: Lowest risk (experience + responsibility)
   * - 65+: Moderate increase (slower reflexes)
   *
   * @param age - Driver age
   * @returns Age factor (0.85 - 2.5)
   */
  private calculateAgeFactor(age: number): number {
    if (age < 18) {
      return 2.5; // Very high risk - minimum licensed age
    } else if (age < 21) {
      return 2.0; // High risk - teen drivers
    } else if (age < 25) {
      return 1.5; // Elevated risk - young adults
    } else if (age < 30) {
      return 1.2; // Moderate risk
    } else if (age < 65) {
      return 0.9; // Lowest risk - mature drivers
    } else if (age < 75) {
      return 1.0; // Slight increase - senior drivers
    } else {
      return 1.2; // Moderate increase - elderly drivers
    }
  }

  /**
   * Calculate experience-based rating factor
   *
   * Years licensed is a strong predictor independent of age.
   * New drivers lack:
   * - Hazard recognition skills
   * - Defensive driving experience
   * - Vehicle control in emergencies
   *
   * @param yearsLicensed - Years driver has held license
   * @param age - Driver age (to calculate reasonable experience)
   * @returns Experience factor (0.9 - 1.4)
   */
  private calculateExperienceFactor(yearsLicensed: number, age: number): number {
    // Cap years licensed at (age - 16) to prevent unrealistic values
    const maxPossibleYears = Math.max(0, age - 16);
    const adjustedYears = Math.min(yearsLicensed, maxPossibleYears);

    if (adjustedYears < 1) {
      return 1.4; // Brand new driver
    } else if (adjustedYears < 3) {
      return 1.3; // Very inexperienced
    } else if (adjustedYears < 5) {
      return 1.15; // Still learning
    } else if (adjustedYears < 10) {
      return 1.0; // Moderate experience
    } else {
      return 0.9; // Highly experienced - discount
    }
  }

  /**
   * Calculate gender-based rating factor
   *
   * NOTE: Gender-based rating is prohibited in some states.
   * Use only where legally permitted.
   *
   * Actuarial data shows different claim patterns, but this is controversial
   * and regulated differently by state.
   *
   * @param gender - Driver gender
   * @returns Gender factor (0.95 - 1.1)
   */
  private calculateGenderFactor(gender?: string): number {
    if (!gender) {
      return 1.0; // No data = neutral
    }

    // Simplified factors - in production, would vary by age and state law
    const genderLower = gender.toLowerCase();

    if (genderLower === 'female' || genderLower === 'f') {
      return 0.95; // Slightly lower risk statistically
    } else if (genderLower === 'male' || genderLower === 'm') {
      return 1.05; // Slightly higher risk statistically
    } else {
      return 1.0; // Other/non-binary = neutral
    }
  }

  /**
   * Calculate marital status rating factor
   *
   * Married drivers statistically have:
   * - Lower accident rates
   * - More conservative driving behavior
   * - Household responsibility
   *
   * @param maritalStatus - Driver marital status
   * @returns Marital status factor (0.85 - 1.0)
   */
  private calculateMaritalStatusFactor(maritalStatus?: string): number {
    if (!maritalStatus) {
      return 1.0;
    }

    const statusLower = maritalStatus.toLowerCase();

    if (statusLower === 'married') {
      return 0.85; // Married drivers get discount
    } else {
      return 1.0; // Single/divorced/widowed = baseline
    }
  }

  /**
   * Calculate violations-based rating factor
   *
   * Traffic violations indicate risky driving behavior:
   * - Speeding: +10-15% per ticket
   * - Reckless driving: +30-40%
   * - DUI/DWI: +75-100%
   *
   * Violations typically affect rates for 3 years from date.
   *
   * @param violations - Driver violations in last 3 years
   * @returns Violations factor (1.0 - 2.5)
   */
  private calculateViolationsFactor(violations: DriverViolation[]): number {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    // Filter to violations in last 3 years
    const recentViolations = violations.filter(v => new Date(v.date) >= threeYearsAgo);

    if (recentViolations.length === 0) {
      return 1.0; // Clean record
    }

    let factor = 1.0;

    for (const violation of recentViolations) {
      const typeLower = violation.type.toLowerCase();

      if (typeLower.includes('dui') || typeLower.includes('dwi')) {
        factor *= 1.75; // 75% surcharge for DUI
      } else if (typeLower.includes('reckless')) {
        factor *= 1.35; // 35% surcharge for reckless driving
      } else if (typeLower.includes('speeding')) {
        factor *= 1.15; // 15% surcharge for speeding
      } else {
        factor *= 1.10; // 10% surcharge for other violations
      }
    }

    // Cap maximum violations factor
    return Math.min(factor, 2.5);
  }

  /**
   * Calculate accidents-based rating factor
   *
   * At-fault accidents are the strongest predictor of future accidents:
   * - First at-fault accident: +20-30%
   * - Multiple accidents: Multiplicative increase
   * - Not-at-fault accidents: No penalty (sometimes minor increase)
   *
   * Accidents typically affect rates for 3-5 years.
   *
   * @param accidents - Driver accidents in last 5 years
   * @returns Accidents factor (1.0 - 3.0)
   */
  private calculateAccidentsFactor(accidents: DriverAccident[]): number {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    // Filter to at-fault accidents in last 5 years
    const recentAtFaultAccidents = accidents.filter(
      a => a.atFault && new Date(a.date) >= fiveYearsAgo
    );

    if (recentAtFaultAccidents.length === 0) {
      return 1.0; // No at-fault accidents
    }

    // Each at-fault accident adds 25% increase
    const factor = 1 + (recentAtFaultAccidents.length * 0.25);

    // Cap maximum accident factor
    return Math.min(factor, 3.0);
  }

  /**
   * Calculate continuous coverage factor
   *
   * Drivers with continuous coverage (no lapses >30 days):
   * - Demonstrate financial responsibility
   * - Less likely to file claims
   * - Lower risk profile
   *
   * @param hasContinuousCoverage - Driver has maintained continuous coverage
   * @returns Continuous coverage factor (0.90 - 1.15)
   */
  private calculateContinuousCoverageFactor(hasContinuousCoverage?: boolean): number {
    if (hasContinuousCoverage === true) {
      return 0.95; // 5% discount for continuous coverage
    } else if (hasContinuousCoverage === false) {
      return 1.15; // 15% surcharge for lapse in coverage
    } else {
      return 1.0; // Unknown = neutral
    }
  }
}
