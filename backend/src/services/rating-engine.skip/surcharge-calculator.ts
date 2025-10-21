/**
 * Surcharge Calculator (T059)
 *
 * Calculates premium surcharges (penalties) based on unfavorable customer characteristics.
 * Implements 8 standard auto insurance surcharges per spec FR-063:
 *
 * 1. YOUNG_DRIVER: 25-50% for drivers under 25 years old
 * 2. INEXPERIENCED_DRIVER: 15-30% for <3 years driving experience
 * 3. ACCIDENT_HISTORY: 20-40% per at-fault accident in last 3 years
 * 4. VIOLATION_HISTORY: 15-25% per major violation in last 3 years
 * 5. HIGH_MILEAGE: 10-20% for >15,000 miles/year
 * 6. HIGH_PERFORMANCE_VEHICLE: 25-50% for sports/luxury vehicles
 * 7. URBAN_LOCATION: 10-25% for high-crime urban areas
 * 8. POOR_CREDIT: 15-30% for credit score below threshold
 *
 * Surcharges are multiplicative - they compound to reflect increased risk.
 * Total surcharges can exceed 100% for very high-risk profiles.
 *
 * @module SurchargeCalculator
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * Surcharge information
 */
export interface SurchargeInfo {
  code: string;
  name: string;
  amount: number;
  percentage: number;
}

/**
 * Input data for surcharge calculation
 */
export interface SurchargeCalculationInput {
  vehicle: {
    make: string;
    model: string;
    year: number;
    vehicleType?: string; // 'SPORTS_CAR', 'LUXURY', 'STANDARD'
  };
  driver: {
    age: number;
    yearsLicensed: number;
    violations?: Array<{type: string; severity: string; date: Date}>;
    accidents?: Array<{type: string; atFault: boolean; date: Date}>;
    creditScore?: number;
  };
  location: {
    zipCode: string;
    state: string;
    urbanRuralCode?: string; // 'URBAN', 'SUBURBAN', 'RURAL'
    crimeIndex?: number; // 0-100, higher = more crime
  };
  annualMileage?: number;
}

/**
 * Surcharge Calculator Service
 *
 * Evaluates customer risk characteristics and policy details to determine
 * all applicable surcharges. Surcharges are applied multiplicatively to
 * reflect compounding risk.
 */
@Injectable()
export class SurchargeCalculator {
  private readonly logger = new Logger(SurchargeCalculator.name);

  // Risk thresholds
  private readonly YOUNG_DRIVER_AGE = 25;
  private readonly INEXPERIENCED_YEARS = 3;
  private readonly HIGH_MILEAGE_THRESHOLD = 15000;
  private readonly POOR_CREDIT_THRESHOLD = 600;
  private readonly HIGH_CRIME_INDEX = 60;

  /**
   * Calculate all applicable surcharges
   *
   * Evaluates each surcharge type and returns array of applied surcharges
   * with both dollar amount and percentage. Surcharges compound multiplicatively.
   *
   * @param input - Surcharge calculation input data
   * @param basePremium - Base premium before surcharges (optional, for amount calculation)
   * @returns Array of applicable surcharges
   */
  async calculateSurcharges(
    input: SurchargeCalculationInput,
    basePremium?: number
  ): Promise<SurchargeInfo[]> {
    const surcharges: SurchargeInfo[] = [];

    // 1. Young driver surcharge
    const youngDriverSurcharge = this.calculateYoungDriverSurcharge(input.driver.age);
    if (youngDriverSurcharge > 0) {
      surcharges.push({
        code: 'YOUNG_DRIVER',
        name: 'Young Driver Surcharge',
        amount: basePremium ? (basePremium * youngDriverSurcharge) : 0,
        percentage: youngDriverSurcharge * 100,
      });
    }

    // 2. Inexperienced driver surcharge
    const inexperiencedSurcharge = this.calculateInexperiencedDriverSurcharge(
      input.driver.yearsLicensed
    );
    if (inexperiencedSurcharge > 0) {
      surcharges.push({
        code: 'INEXPERIENCED_DRIVER',
        name: 'Inexperienced Driver Surcharge',
        amount: basePremium ? (basePremium * inexperiencedSurcharge) : 0,
        percentage: inexperiencedSurcharge * 100,
      });
    }

    // 3. Accident history surcharge
    const accidentSurcharge = this.calculateAccidentHistorySurcharge(
      input.driver.accidents || []
    );
    if (accidentSurcharge > 0) {
      surcharges.push({
        code: 'ACCIDENT_HISTORY',
        name: 'Accident History Surcharge',
        amount: basePremium ? (basePremium * accidentSurcharge) : 0,
        percentage: accidentSurcharge * 100,
      });
    }

    // 4. Violation history surcharge
    const violationSurcharge = this.calculateViolationHistorySurcharge(
      input.driver.violations || []
    );
    if (violationSurcharge > 0) {
      surcharges.push({
        code: 'VIOLATION_HISTORY',
        name: 'Violation History Surcharge',
        amount: basePremium ? (basePremium * violationSurcharge) : 0,
        percentage: violationSurcharge * 100,
      });
    }

    // 5. High mileage surcharge
    const highMileageSurcharge = this.calculateHighMileageSurcharge(input.annualMileage);
    if (highMileageSurcharge > 0) {
      surcharges.push({
        code: 'HIGH_MILEAGE',
        name: 'High Mileage Surcharge',
        amount: basePremium ? (basePremium * highMileageSurcharge) : 0,
        percentage: highMileageSurcharge * 100,
      });
    }

    // 6. High performance vehicle surcharge
    const highPerformanceSurcharge = this.calculateHighPerformanceVehicleSurcharge(
      input.vehicle
    );
    if (highPerformanceSurcharge > 0) {
      surcharges.push({
        code: 'HIGH_PERFORMANCE_VEHICLE',
        name: 'High Performance Vehicle Surcharge',
        amount: basePremium ? (basePremium * highPerformanceSurcharge) : 0,
        percentage: highPerformanceSurcharge * 100,
      });
    }

    // 7. Urban location surcharge
    const urbanSurcharge = this.calculateUrbanLocationSurcharge(input.location);
    if (urbanSurcharge > 0) {
      surcharges.push({
        code: 'URBAN_LOCATION',
        name: 'Urban Location Surcharge',
        amount: basePremium ? (basePremium * urbanSurcharge) : 0,
        percentage: urbanSurcharge * 100,
      });
    }

    // 8. Poor credit surcharge
    const poorCreditSurcharge = this.calculatePoorCreditSurcharge(input.driver.creditScore);
    if (poorCreditSurcharge > 0) {
      surcharges.push({
        code: 'POOR_CREDIT',
        name: 'Poor Credit Surcharge',
        amount: basePremium ? (basePremium * poorCreditSurcharge) : 0,
        percentage: poorCreditSurcharge * 100,
      });
    }

    this.logger.debug(
      `Applied ${surcharges.length} surcharges totaling ${surcharges.reduce((s, sc) => s + sc.percentage, 0).toFixed(1)}%`
    );

    return surcharges;
  }

  /**
   * Calculate young driver surcharge
   *
   * Drivers under 25 have significantly higher accident rates and lack
   * experience. This is one of the largest surcharges in auto insurance.
   *
   * @param age - Driver age
   * @returns Surcharge percentage (0 - 0.50)
   */
  private calculateYoungDriverSurcharge(age: number): number {
    if (age >= this.YOUNG_DRIVER_AGE) {
      return 0; // No surcharge for 25+
    }

    // Tiered surcharge based on age
    if (age < 18) {
      return 0.50; // 50% surcharge for drivers under 18
    } else if (age < 21) {
      return 0.40; // 40% surcharge for 18-20
    } else if (age < 25) {
      return 0.30; // 30% surcharge for 21-24
    }

    return 0;
  }

  /**
   * Calculate inexperienced driver surcharge
   *
   * New drivers (less than 3 years licensed) lack experience regardless
   * of age. This surcharge stacks with young driver surcharge.
   *
   * @param yearsLicensed - Years driver has been licensed
   * @returns Surcharge percentage (0 - 0.30)
   */
  private calculateInexperiencedDriverSurcharge(yearsLicensed: number): number {
    if (yearsLicensed >= this.INEXPERIENCED_YEARS) {
      return 0; // No surcharge for 3+ years experience
    }

    // Tiered surcharge based on experience
    if (yearsLicensed < 1) {
      return 0.30; // 30% surcharge for <1 year
    } else if (yearsLicensed < 2) {
      return 0.20; // 20% surcharge for 1-2 years
    } else {
      return 0.15; // 15% surcharge for 2-3 years
    }
  }

  /**
   * Calculate accident history surcharge
   *
   * At-fault accidents in the last 3 years indicate higher risk.
   * Multiple accidents compound the surcharge significantly.
   *
   * @param accidents - Driver accidents
   * @returns Surcharge percentage (0 - 1.20 for 3+ accidents)
   */
  private calculateAccidentHistorySurcharge(
    accidents: Array<{type: string; atFault: boolean; date: Date}>
  ): number {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    // Count at-fault accidents in last 3 years
    const recentAtFaultAccidents = accidents.filter(
      a => a.atFault && new Date(a.date) >= threeYearsAgo
    );

    if (recentAtFaultAccidents.length === 0) {
      return 0;
    }

    // 30% surcharge per at-fault accident (compounding)
    // 1 accident = 30%, 2 = 60%, 3 = 90%, etc.
    return recentAtFaultAccidents.length * 0.30;
  }

  /**
   * Calculate violation history surcharge
   *
   * Moving violations (speeding, reckless driving, DUI) in the last 3 years
   * indicate risky behavior. Major violations carry higher surcharges.
   *
   * @param violations - Driver violations
   * @returns Surcharge percentage (0 - 1.00 for multiple major violations)
   */
  private calculateViolationHistorySurcharge(
    violations: Array<{type: string; severity: string; date: Date}>
  ): number {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    // Filter violations in last 3 years
    const recentViolations = violations.filter(v => new Date(v.date) >= threeYearsAgo);

    if (recentViolations.length === 0) {
      return 0;
    }

    let totalSurcharge = 0;

    recentViolations.forEach(violation => {
      const severity = violation.severity?.toUpperCase() || 'MINOR';

      switch (severity) {
        case 'MAJOR': // DUI, reckless driving, hit-and-run
          totalSurcharge += 0.50; // 50% per major violation
          break;
        case 'MODERATE': // Speeding 20+ mph over, failure to yield
          totalSurcharge += 0.25; // 25% per moderate violation
          break;
        case 'MINOR': // Speeding <20 mph over, rolling stop
        default:
          totalSurcharge += 0.15; // 15% per minor violation
          break;
      }
    });

    return totalSurcharge;
  }

  /**
   * Calculate high mileage surcharge
   *
   * Drivers who drive more than 15,000 miles annually have greater
   * exposure to accidents. Very high mileage increases risk significantly.
   *
   * @param annualMileage - Estimated annual mileage
   * @returns Surcharge percentage (0 - 0.20)
   */
  private calculateHighMileageSurcharge(annualMileage?: number): number {
    if (!annualMileage || annualMileage <= this.HIGH_MILEAGE_THRESHOLD) {
      return 0;
    }

    if (annualMileage > 25000) {
      return 0.20; // 20% surcharge for very high mileage
    } else if (annualMileage > 20000) {
      return 0.15; // 15% surcharge for high mileage
    } else {
      return 0.10; // 10% surcharge for moderate high mileage
    }
  }

  /**
   * Calculate high performance vehicle surcharge
   *
   * Sports cars, luxury vehicles, and high-performance vehicles are
   * more expensive to repair and correlate with riskier driving behavior.
   *
   * @param vehicle - Vehicle information
   * @returns Surcharge percentage (0 - 0.50)
   */
  private calculateHighPerformanceVehicleSurcharge(vehicle: {
    make: string;
    model: string;
    year: number;
    vehicleType?: string;
  }): number {
    const make = vehicle.make?.toUpperCase() || '';
    const model = vehicle.model?.toUpperCase() || '';
    const vehicleType = vehicle.vehicleType?.toUpperCase() || '';

    // Check explicit vehicle type
    if (vehicleType === 'SPORTS_CAR') {
      return 0.40; // 40% surcharge for sports cars
    } else if (vehicleType === 'LUXURY') {
      return 0.30; // 30% surcharge for luxury vehicles
    }

    // Check make/model for performance indicators
    const sportsMakes = ['FERRARI', 'LAMBORGHINI', 'PORSCHE', 'CORVETTE', 'MUSTANG', 'CAMARO'];
    const luxuryMakes = ['BMW', 'MERCEDES-BENZ', 'AUDI', 'LEXUS', 'TESLA', 'CADILLAC'];

    if (sportsMakes.some(brand => make.includes(brand) || model.includes(brand))) {
      return 0.40; // Sports car surcharge
    }

    if (luxuryMakes.some(brand => make.includes(brand))) {
      return 0.25; // Luxury vehicle surcharge
    }

    return 0;
  }

  /**
   * Calculate urban location surcharge
   *
   * Urban areas have higher accident rates, theft rates, and vandalism.
   * High-crime urban areas carry the highest surcharge.
   *
   * @param location - Location information
   * @returns Surcharge percentage (0 - 0.25)
   */
  private calculateUrbanLocationSurcharge(location: {
    zipCode: string;
    state: string;
    urbanRuralCode?: string;
    crimeIndex?: number;
  }): number {
    const urbanRuralCode = location.urbanRuralCode?.toUpperCase();
    const crimeIndex = location.crimeIndex || 0;

    // High crime urban area
    if (urbanRuralCode === 'URBAN' && crimeIndex >= this.HIGH_CRIME_INDEX) {
      return 0.25; // 25% surcharge for high-crime urban
    }

    // Standard urban area
    if (urbanRuralCode === 'URBAN') {
      return 0.15; // 15% surcharge for standard urban
    }

    // Suburban area with high crime
    if (urbanRuralCode === 'SUBURBAN' && crimeIndex >= this.HIGH_CRIME_INDEX) {
      return 0.10; // 10% surcharge for high-crime suburban
    }

    return 0; // No surcharge for suburban/rural low-crime areas
  }

  /**
   * Calculate poor credit surcharge
   *
   * Credit score is statistically correlated with claim frequency and severity.
   * Lower credit scores indicate higher risk. Not all states allow credit-based
   * insurance scoring (CA, HI, MA, MI prohibit it).
   *
   * @param creditScore - Driver credit score (300-850)
   * @returns Surcharge percentage (0 - 0.30)
   */
  private calculatePoorCreditSurcharge(creditScore?: number): number {
    if (!creditScore) {
      return 0; // No data = no surcharge (neutral assumption)
    }

    if (creditScore >= 700) {
      return 0; // Good/excellent credit = no surcharge
    }

    // Tiered surcharge based on credit score
    if (creditScore < 500) {
      return 0.30; // 30% surcharge for very poor credit
    } else if (creditScore < 600) {
      return 0.20; // 20% surcharge for poor credit
    } else {
      return 0.10; // 10% surcharge for fair credit
    }
  }

  /**
   * Get total surcharge percentage from surcharge array
   *
   * @param surcharges - Array of surcharge info
   * @returns Total surcharge percentage
   */
  getTotalSurchargePercentage(surcharges: SurchargeInfo[]): number {
    return surcharges.reduce((sum, sc) => sum + sc.percentage, 0);
  }

  /**
   * Get total surcharge dollar amount from surcharge array
   *
   * @param surcharges - Array of surcharge info
   * @returns Total surcharge dollar amount
   */
  getTotalSurchargeAmount(surcharges: SurchargeInfo[]): number {
    return surcharges.reduce((sum, sc) => sum + sc.amount, 0);
  }
}
