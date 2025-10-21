/**
 * Rating Engine Service (T053)
 *
 * Base rating engine service that orchestrates the premium calculation process.
 * Combines all rating factors (vehicle, driver, location, coverage) to produce
 * the final premium amount with itemized breakdown.
 *
 * This is the main entry point for premium calculations and coordinates:
 * - Vehicle rating factors (age, make, model, safety features)
 * - Driver rating factors (age, experience, violations)
 * - Location rating factors (zip code, territory, state)
 * - Coverage rating factors (limits, deductibles, coverage selection)
 * - Discount application (7 standard discounts)
 * - Surcharge application (8 standard surcharges)
 * - Tax and fee calculation
 *
 * Formula: Base Premium × Vehicle Factor × Driver Factor × Location Factor × Coverage Factor
 *          × (1 - Total Discounts) × (1 + Total Surcharges) + Taxes + Fees = Total Premium
 *
 * @module RatingEngineService
 */

import { Injectable, Logger } from '@nestjs/common';
import { VehicleRatingService } from './vehicle-rating';
import { DriverRatingService } from './driver-rating';
import { LocationRatingService } from './location-rating';
import { CoverageRatingService } from './coverage-rating';
import { DiscountCalculator } from './discount-calculator';
import { SurchargeCalculator } from './surcharge-calculator';
import { PremiumCalculator } from './premium-calculator';
import { TaxFeeCalculator } from './tax-fee-calculator';

/**
 * Input data for rating calculation
 */
export interface RatingInput {
  // Vehicle information
  vehicle: {
    year: number;
    make: string;
    model: string;
    vin: string;
    bodyType?: string;
    marketValue?: number;
    safetyRating?: number;
    antiTheftDevice?: boolean;
  };

  // Driver information
  driver: {
    age: number;
    yearsLicensed: number;
    gender?: string;
    maritalStatus?: string;
    violations?: Array<{type: string; date: Date}>;
    accidents?: Array<{type: string; atFault: boolean; date: Date}>;
    continuousCoverage?: boolean;
  };

  // Location information
  location: {
    zipCode: string;
    state: string;
    municipality?: string;
    territoryType?: 'URBAN' | 'SUBURBAN' | 'RURAL';
  };

  // Coverage selections
  coverages: Array<{
    coverageType: string;
    limitAmount?: number;
    deductibleAmount?: number;
  }>;

  // Additional quote parameters
  effectiveDate: Date;
  policyTerm: number; // months
  annualMileage?: number;
}

/**
 * Output of rating calculation with complete breakdown
 */
export interface RatingOutput {
  basePremium: number;
  vehicleFactor: number;
  driverFactor: number;
  locationFactor: number;
  coverageFactor: number;
  adjustedPremium: number;
  discounts: Array<{code: string; name: string; amount: number}>;
  totalDiscounts: number;
  surcharges: Array<{code: string; name: string; amount: number}>;
  totalSurcharges: number;
  subtotal: number;
  taxes: Array<{type: string; amount: number}>;
  fees: Array<{type: string; amount: number}>;
  totalTaxesAndFees: number;
  totalPremium: number;
  breakdown: {
    coverageSubtotals: Array<{coverage: string; premium: number}>;
    factorDetails: Record<string, any>;
  };
}

/**
 * Rating Engine Service
 *
 * Orchestrates the entire premium calculation workflow by calling specialized
 * rating calculators and combining their results.
 */
@Injectable()
export class RatingEngineService {
  private readonly logger = new Logger(RatingEngineService.name);

  constructor(
    private readonly vehicleRating: VehicleRatingService,
    private readonly driverRating: DriverRatingService,
    private readonly locationRating: LocationRatingService,
    private readonly coverageRating: CoverageRatingService,
    private readonly discountCalculator: DiscountCalculator,
    private readonly surchargeCalculator: SurchargeCalculator,
    private readonly premiumCalculator: PremiumCalculator,
    private readonly taxFeeCalculator: TaxFeeCalculator,
  ) {}

  /**
   * Calculate premium for an auto insurance quote
   *
   * This method orchestrates the entire rating process:
   * 1. Calculate base premium by coverage type
   * 2. Apply vehicle rating factors
   * 3. Apply driver rating factors
   * 4. Apply location rating factors
   * 5. Apply coverage-specific factors
   * 6. Apply discounts
   * 7. Apply surcharges
   * 8. Add taxes and fees
   *
   * @param input - Rating calculation input data
   * @returns Complete premium breakdown with all factors
   */
  async calculatePremium(input: RatingInput): Promise<RatingOutput> {
    this.logger.log(`Starting premium calculation for ${input.vehicle.year} ${input.vehicle.make} ${input.vehicle.model}`);

    try {
      // Step 1: Calculate base premium for each coverage
      const basePremium = await this.coverageRating.calculateBasePremium(
        input.coverages,
        input.location.state,
      );

      this.logger.debug(`Base premium calculated: $${basePremium}`);

      // Step 2: Calculate rating factors
      const vehicleFactor = await this.vehicleRating.calculateVehicleFactor(input.vehicle);
      const driverFactor = await this.driverRating.calculateDriverFactor(input.driver);
      const locationFactor = await this.locationRating.calculateLocationFactor(input.location);
      const coverageFactor = await this.coverageRating.calculateCoverageFactor(input.coverages);

      this.logger.debug(
        `Rating factors - Vehicle: ${vehicleFactor}, Driver: ${driverFactor}, ` +
        `Location: ${locationFactor}, Coverage: ${coverageFactor}`
      );

      // Step 3: Calculate adjusted premium (base × all factors)
      const adjustedPremium = basePremium * vehicleFactor * driverFactor * locationFactor * coverageFactor;

      // Step 4: Calculate discounts
      const discounts = await this.discountCalculator.calculateDiscounts({
        vehicle: input.vehicle,
        driver: input.driver,
        location: input.location,
        effectiveDate: input.effectiveDate,
        annualMileage: input.annualMileage,
      });

      const totalDiscounts = discounts.reduce((sum, d) => sum + d.amount, 0);

      // Step 5: Calculate surcharges
      const surcharges = await this.surchargeCalculator.calculateSurcharges({
        vehicle: input.vehicle,
        driver: input.driver,
        location: input.location,
      });

      const totalSurcharges = surcharges.reduce((sum, s) => sum + s.amount, 0);

      // Step 6: Calculate subtotal after discounts and surcharges
      const subtotal = adjustedPremium - totalDiscounts + totalSurcharges;

      // Step 7: Calculate taxes and fees
      const {taxes, fees} = await this.taxFeeCalculator.calculateTaxesAndFees(
        subtotal,
        input.location.state,
      );

      const totalTaxesAndFees =
        taxes.reduce((sum, t) => sum + t.amount, 0) +
        fees.reduce((sum, f) => sum + f.amount, 0);

      // Step 8: Calculate final premium
      const totalPremium = subtotal + totalTaxesAndFees;

      this.logger.log(`Premium calculation complete: $${totalPremium}`);

      // Return comprehensive breakdown
      return {
        basePremium,
        vehicleFactor,
        driverFactor,
        locationFactor,
        coverageFactor,
        adjustedPremium,
        discounts,
        totalDiscounts,
        surcharges,
        totalSurcharges,
        subtotal,
        taxes,
        fees,
        totalTaxesAndFees,
        totalPremium,
        breakdown: {
          coverageSubtotals: await this.coverageRating.getCoverageBreakdown(input.coverages),
          factorDetails: {
            vehicle: await this.vehicleRating.getFactorDetails(input.vehicle),
            driver: await this.driverRating.getFactorDetails(input.driver),
            location: await this.locationRating.getFactorDetails(input.location),
          },
        },
      };
    } catch (error) {
      this.logger.error(`Premium calculation failed: ${error.message}`, error.stack);
      throw new Error(`Failed to calculate premium: ${error.message}`);
    }
  }

  /**
   * Validate that calculated premium is within acceptable range
   *
   * Per spec SC-035: Premium calculations should produce market-realistic rates
   * within industry ranges ($800-$3000/year for standard risk profiles)
   *
   * @param premium - Calculated premium amount
   * @returns true if premium is within valid range
   */
  validatePremiumRange(premium: number): boolean {
    const MIN_PREMIUM = 500;  // Minimum floor
    const MAX_PREMIUM = 10000; // Maximum cap

    return premium >= MIN_PREMIUM && premium <= MAX_PREMIUM;
  }
}
