/**
 * Premium Calculator Orchestrator (T060)
 *
 * Main orchestration service that coordinates all rating calculators and produces
 * the final premium amount with complete audit trail.
 *
 * This service implements the multiplicative premium calculation model:
 *
 * Step 1: Calculate Base Premium
 *   Base Premium = Sum of coverage base rates from rating tables
 *
 * Step 2: Apply Rating Factors (Multiplicative)
 *   Adjusted Premium = Base Premium × Vehicle Factor × Driver Factor × Location Factor × Coverage Factor
 *
 * Step 3: Apply Discounts (Subtractive from Adjusted Premium)
 *   Premium After Discounts = Adjusted Premium - Total Discount Amount
 *
 * Step 4: Apply Surcharges (Additive to Premium After Discounts)
 *   Premium After Surcharges = Premium After Discounts + Total Surcharge Amount
 *
 * Step 5: Add Taxes and Fees
 *   Total Premium = Premium After Surcharges + Premium Tax + Policy Fee + DMV Fees
 *
 * All intermediate values, factors, discounts, and surcharges are persisted to the
 * premium_calculation table for complete audit trail and transparency.
 *
 * @module PremiumCalculator
 */

import { Injectable, Logger } from '@nestjs/common';
import { VehicleRatingService, VehicleInfo } from './vehicle-rating';
import { DriverRatingService, DriverInfo } from './driver-rating';
import { LocationRatingService, LocationInfo } from './location-rating';
import { CoverageRatingService, CoverageInfo } from './coverage-rating';
import { DiscountCalculator, DiscountInfo, DiscountCalculationInput } from './discount-calculator';
import { SurchargeCalculator, SurchargeInfo, SurchargeCalculationInput } from './surcharge-calculator';
import { TaxFeeCalculator, TaxFeeCalculationInput, TaxFeeBreakdown } from './tax-fee-calculator';

/**
 * Complete input for premium calculation
 */
export interface PremiumCalculationInput {
  vehicle: VehicleInfo;
  driver: DriverInfo;
  location: LocationInfo;
  coverages: CoverageInfo[];
  effectiveDate: Date;
  policyTerm?: number; // months, defaults to 12
  annualMileage?: number;

  // Discount eligibility flags
  multiCarDiscount?: boolean;
  homeownerDiscount?: boolean;
  defensiveDrivingCourse?: boolean;
  paperlessDiscount?: boolean;

  // Quote/policy identifiers for audit
  quoteId?: string;
  policyId?: string;
}

/**
 * Complete premium calculation result with audit trail
 */
export interface PremiumCalculationResult {
  // Step 1: Base Premium
  basePremium: number;

  // Step 2: Rating Factors and Adjusted Premium
  vehicleFactor: number;
  vehicleFactorDetails: any;
  driverFactor: number;
  driverFactorDetails: any;
  locationFactor: number;
  locationFactorDetails: any;
  coverageFactor: number;
  coverageFactorDetails: any;
  totalFactorMultiplier: number;
  adjustedPremium: number;

  // Step 3: Discounts
  discounts: DiscountInfo[];
  totalDiscountAmount: number;
  totalDiscountPercentage: number;
  premiumAfterDiscounts: number;

  // Step 4: Surcharges
  surcharges: SurchargeInfo[];
  totalSurchargeAmount: number;
  totalSurchargePercentage: number;
  premiumAfterSurcharges: number;

  // Step 5: Taxes and Fees
  taxesAndFees: TaxFeeBreakdown;
  totalTaxesAndFees: number;

  // Final Premium
  totalPremium: number;

  // Metadata
  calculationTimestamp: Date;
  calculationVersion: string;
  quoteId?: string;
  policyId?: string;
}

/**
 * Premium Calculator Service
 *
 * Orchestrates all rating calculators to produce final premium with complete audit trail.
 */
@Injectable()
export class PremiumCalculator {
  private readonly logger = new Logger(PremiumCalculator.name);

  // Rating engine version for audit trail
  private readonly CALCULATION_VERSION = '1.0.0';

  // Base premium per coverage (will be loaded from rating tables in production)
  private readonly BASE_RATES = {
    BODILY_INJURY: 400,
    PROPERTY_DAMAGE: 250,
    COLLISION: 500,
    COMPREHENSIVE: 300,
    UNINSURED_MOTORIST: 150,
    PERSONAL_INJURY_PROTECTION: 200,
  };

  constructor(
    private readonly vehicleRatingService: VehicleRatingService,
    private readonly driverRatingService: DriverRatingService,
    private readonly locationRatingService: LocationRatingService,
    private readonly coverageRatingService: CoverageRatingService,
    private readonly discountCalculator: DiscountCalculator,
    private readonly surchargeCalculator: SurchargeCalculator,
    private readonly taxFeeCalculator: TaxFeeCalculator,
  ) {}

  /**
   * Calculate premium with complete audit trail
   *
   * Orchestrates all rating factors, discounts, surcharges, taxes, and fees
   * to produce the final premium amount. Stores complete calculation details
   * for transparency and debugging.
   *
   * @param input - Complete premium calculation input
   * @returns Complete premium calculation result with audit trail
   */
  async calculatePremium(input: PremiumCalculationInput): Promise<PremiumCalculationResult> {
    const startTime = Date.now();
    this.logger.log('Starting premium calculation...');

    try {
      // STEP 1: Calculate Base Premium
      const basePremium = this.calculateBasePremium(input.coverages);
      this.logger.debug(`Base premium: $${basePremium.toFixed(2)}`);

      // STEP 2: Calculate Rating Factors
      const vehicleFactor = await this.vehicleRatingService.calculateVehicleFactor(input.vehicle);
      const vehicleFactorDetails = await this.vehicleRatingService.getFactorDetails(input.vehicle);

      const driverFactor = await this.driverRatingService.calculateDriverFactor(input.driver);
      const driverFactorDetails = await this.driverRatingService.getFactorDetails(input.driver);

      const locationFactor = await this.locationRatingService.calculateLocationFactor(input.location);
      const locationFactorDetails = await this.locationRatingService.getFactorDetails(input.location);

      const coverageFactor = await this.coverageRatingService.calculateCoverageFactor(input.coverages);
      const coverageFactorDetails = await this.coverageRatingService.getFactorDetails(input.coverages);

      // Total multiplicative factor
      const totalFactorMultiplier = vehicleFactor * driverFactor * locationFactor * coverageFactor;

      // Adjusted premium after all factors
      const adjustedPremium = basePremium * totalFactorMultiplier;

      this.logger.debug(
        `Rating factors - Vehicle: ${vehicleFactor.toFixed(2)}, Driver: ${driverFactor.toFixed(2)}, ` +
        `Location: ${locationFactor.toFixed(2)}, Coverage: ${coverageFactor.toFixed(2)}`
      );
      this.logger.debug(`Adjusted premium: $${adjustedPremium.toFixed(2)}`);

      // STEP 3: Calculate Discounts
      const discountInput: DiscountCalculationInput = {
        vehicle: {
          make: input.vehicle.make,
          model: input.vehicle.model,
          year: input.vehicle.year,
        },
        driver: {
          age: input.driver.age,
          yearsLicensed: input.driver.yearsLicensed,
          violations: input.driver.violations,
          accidents: input.driver.accidents,
        },
        location: {
          zipCode: input.location.zipCode,
          state: input.location.state,
        },
        effectiveDate: input.effectiveDate,
        annualMileage: input.annualMileage,
        multiCarDiscount: input.multiCarDiscount,
        homeownerDiscount: input.homeownerDiscount,
        defensiveDrivingCourse: input.defensiveDrivingCourse,
        paperlessDiscount: input.paperlessDiscount,
      };

      const discounts = await this.discountCalculator.calculateDiscounts(
        discountInput,
        adjustedPremium
      );

      const totalDiscountAmount = this.discountCalculator.getTotalDiscountAmount(discounts);
      const totalDiscountPercentage = this.discountCalculator.getTotalDiscountPercentage(discounts);
      const premiumAfterDiscounts = adjustedPremium - totalDiscountAmount;

      this.logger.debug(
        `Applied ${discounts.length} discounts totaling $${totalDiscountAmount.toFixed(2)} (${totalDiscountPercentage.toFixed(1)}%)`
      );

      // STEP 4: Calculate Surcharges
      const surchargeInput: SurchargeCalculationInput = {
        vehicle: {
          make: input.vehicle.make,
          model: input.vehicle.model,
          year: input.vehicle.year,
          vehicleType: this.determineVehicleType(input.vehicle),
        },
        driver: {
          age: input.driver.age,
          yearsLicensed: input.driver.yearsLicensed,
          violations: input.driver.violations?.map(v => ({
            type: v.type,
            severity: this.determineViolationSeverity(v.type),
            date: v.date,
          })),
          accidents: input.driver.accidents,
          creditScore: input.driver.creditScore,
        },
        location: {
          zipCode: input.location.zipCode,
          state: input.location.state,
          urbanRuralCode: input.location.territoryType,
          crimeIndex: this.getCrimeIndex(input.location.zipCode),
        },
        annualMileage: input.annualMileage,
      };

      const surcharges = await this.surchargeCalculator.calculateSurcharges(
        surchargeInput,
        premiumAfterDiscounts
      );

      const totalSurchargeAmount = this.surchargeCalculator.getTotalSurchargeAmount(surcharges);
      const totalSurchargePercentage = this.surchargeCalculator.getTotalSurchargePercentage(surcharges);
      const premiumAfterSurcharges = premiumAfterDiscounts + totalSurchargeAmount;

      this.logger.debug(
        `Applied ${surcharges.length} surcharges totaling $${totalSurchargeAmount.toFixed(2)} (${totalSurchargePercentage.toFixed(1)}%)`
      );

      // STEP 5: Calculate Taxes and Fees
      const taxFeeInput: TaxFeeCalculationInput = {
        premium: premiumAfterSurcharges,
        state: input.location.state,
        policyTerm: input.policyTerm || 12,
      };

      const taxesAndFees = await this.taxFeeCalculator.calculate(taxFeeInput);
      const totalTaxesAndFees = this.taxFeeCalculator.getTotalTaxesAndFees(taxesAndFees);

      this.logger.debug(`Taxes and fees: $${totalTaxesAndFees.toFixed(2)}`);

      // FINAL PREMIUM
      const totalPremium = premiumAfterSurcharges + totalTaxesAndFees;

      const calculationTime = Date.now() - startTime;
      this.logger.log(
        `Premium calculation completed in ${calculationTime}ms. ` +
        `Total premium: $${totalPremium.toFixed(2)}`
      );

      // Return complete result with audit trail
      return {
        // Step 1
        basePremium,

        // Step 2
        vehicleFactor,
        vehicleFactorDetails,
        driverFactor,
        driverFactorDetails,
        locationFactor,
        locationFactorDetails,
        coverageFactor,
        coverageFactorDetails,
        totalFactorMultiplier,
        adjustedPremium,

        // Step 3
        discounts,
        totalDiscountAmount,
        totalDiscountPercentage,
        premiumAfterDiscounts,

        // Step 4
        surcharges,
        totalSurchargeAmount,
        totalSurchargePercentage,
        premiumAfterSurcharges,

        // Step 5
        taxesAndFees,
        totalTaxesAndFees,

        // Final
        totalPremium,

        // Metadata
        calculationTimestamp: new Date(),
        calculationVersion: this.CALCULATION_VERSION,
        quoteId: input.quoteId,
        policyId: input.policyId,
      };
    } catch (error) {
      this.logger.error(`Premium calculation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculate base premium from coverage selections
   *
   * In production, this would query the rating_table database for base rates.
   * For now, uses hardcoded base rates.
   *
   * @param coverages - Selected coverages
   * @returns Base premium amount
   */
  private calculateBasePremium(coverages: CoverageInfo[]): number {
    let basePremium = 0;

    coverages.forEach(coverage => {
      const coverageType = coverage.coverageType?.toUpperCase().replace(/\s+/g, '_');
      const baseRate = this.BASE_RATES[coverageType] || 100;

      basePremium += baseRate;

      this.logger.debug(
        `Coverage ${coverageType}: base rate $${baseRate}, limit ${coverage.limitAmount || 'N/A'}, ` +
        `deductible ${coverage.deductibleAmount || 'N/A'}`
      );
    });

    return basePremium;
  }

  /**
   * Determine vehicle type for surcharge calculation
   *
   * Categorizes vehicles as SPORTS_CAR, LUXURY, or STANDARD based on make/model.
   *
   * @param vehicle - Vehicle information
   * @returns Vehicle type category
   */
  private determineVehicleType(vehicle: VehicleInfo): string {
    const make = vehicle.make?.toUpperCase() || '';
    const model = vehicle.model?.toUpperCase() || '';

    const sportsMakes = ['FERRARI', 'LAMBORGHINI', 'PORSCHE', 'CORVETTE', 'MUSTANG', 'CAMARO'];
    const luxuryMakes = ['BMW', 'MERCEDES-BENZ', 'AUDI', 'LEXUS', 'TESLA', 'CADILLAC'];

    if (sportsMakes.some(brand => make.includes(brand) || model.includes(brand))) {
      return 'SPORTS_CAR';
    }

    if (luxuryMakes.some(brand => make.includes(brand))) {
      return 'LUXURY';
    }

    return 'STANDARD';
  }

  /**
   * Determine violation severity
   *
   * Categorizes violations as MAJOR, MODERATE, or MINOR based on type.
   *
   * @param violationType - Type of violation
   * @returns Severity level
   */
  private determineViolationSeverity(violationType: string): string {
    const type = violationType?.toUpperCase() || '';

    if (type.includes('DUI') || type.includes('RECKLESS') || type.includes('HIT') || type.includes('RUN')) {
      return 'MAJOR';
    }

    if (type.includes('SPEEDING') && (type.includes('20') || type.includes('EXCESSIVE'))) {
      return 'MODERATE';
    }

    if (type.includes('FAILURE') || type.includes('YIELD')) {
      return 'MODERATE';
    }

    return 'MINOR';
  }

  /**
   * Get crime index for zip code
   *
   * In production, this would query a crime statistics database.
   * For now, returns mock value based on zip code pattern.
   *
   * @param zipCode - ZIP code
   * @returns Crime index (0-100, higher = more crime)
   */
  private getCrimeIndex(zipCode: string): number {
    // Mock implementation - in production, query crime statistics database
    // Urban areas tend to have higher crime indices
    const firstDigit = parseInt(zipCode?.charAt(0) || '0');

    // Simple heuristic: lower zip codes (East Coast) tend to be more urban
    if (firstDigit <= 2) {
      return 65; // Urban East Coast
    } else if (firstDigit <= 5) {
      return 45; // Mixed areas
    } else {
      return 30; // Rural/Suburban
    }
  }

  /**
   * Persist premium calculation to database
   *
   * Stores complete calculation audit trail to premium_calculation table.
   * This method would be called by the quote/policy service after calculation.
   *
   * @param result - Premium calculation result
   * @param policyId - Policy identifier
   * @returns Premium calculation ID
   */
  async persistCalculation(
    result: PremiumCalculationResult,
    policyId: string
  ): Promise<string> {
    // This will be implemented when we integrate with Drizzle ORM
    // For now, just log that we would persist
    this.logger.debug(`Would persist premium calculation for policy ${policyId}`);

    // In production, this would insert to premium_calculation table:
    // - All rating factors as JSONB
    // - All discounts and surcharges as JSONB arrays
    // - All intermediate amounts
    // - Taxes and fees breakdown
    // - Final premium
    // - Calculation metadata (timestamp, version, etc.)

    return `calc_${Date.now()}`; // Mock calculation ID
  }
}
