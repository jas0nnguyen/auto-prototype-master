/**
 * Vehicle Valuation Mock Service
 *
 * Simulates a vehicle valuation/pricing service (like Kelley Blue Book, NADA, Black Book).
 * Provides realistic market values based on vehicle age, mileage, condition, and market data.
 *
 * In production, this would integrate with:
 * - Kelley Blue Book API
 * - NADA Guides API
 * - Black Book API
 * - Edmunds API
 *
 * Valuation factors:
 * - Base MSRP
 * - Vehicle age (depreciation curve)
 * - Mileage (typical: 12,000 miles/year)
 * - Condition (Excellent, Good, Fair, Poor)
 * - Market demand
 * - Geographic location
 */

import { Injectable } from '@nestjs/common';

export enum VehicleCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export interface VehicleValuationRequest {
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  condition: VehicleCondition;
  zip_code?: string;
}

export interface VehicleValuationResult {
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  condition: VehicleCondition;

  // Valuation amounts (in USD cents for precision)
  trade_in_value: number;
  private_party_value: number;
  dealer_retail_value: number;
  replacement_cost: number;

  // Confidence and data quality
  confidence_score: number; // 0.0 - 1.0
  data_source: string;
  valuation_date: Date;

  // Additional context
  typical_mileage_for_year: number;
  mileage_adjustment: number; // Positive or negative adjustment
  condition_adjustment: number;
  market_adjustment: number;
}

@Injectable()
export class VehicleValuationService {
  /**
   * Get vehicle valuation
   *
   * @param request - Vehicle details and condition
   * @returns Promise<VehicleValuationResult>
   */
  async getValuation(request: VehicleValuationRequest): Promise<VehicleValuationResult> {
    // Calculate base value from MSRP (would come from database in production)
    const estimatedMSRP = this.estimateMSRP(request.year, request.make, request.model);

    // Calculate depreciation based on vehicle age
    const vehicleAge = new Date().getFullYear() - request.year;
    const depreciatedValue = this.calculateDepreciation(estimatedMSRP, vehicleAge);

    // Calculate mileage adjustment
    const typicalMileage = this.calculateTypicalMileage(request.year);
    const mileageAdjustment = this.calculateMileageAdjustment(
      request.mileage,
      typicalMileage,
      depreciatedValue
    );

    // Calculate condition adjustment
    const conditionAdjustment = this.calculateConditionAdjustment(
      request.condition,
      depreciatedValue
    );

    // Calculate market adjustment (demand factor)
    const marketAdjustment = this.calculateMarketAdjustment(
      request.make,
      request.model,
      depreciatedValue
    );

    // Calculate final values
    const adjustedValue = depreciatedValue + mileageAdjustment + conditionAdjustment + marketAdjustment;

    // Calculate different valuation types
    const tradeInValue = Math.floor(adjustedValue * 0.75); // Dealer pays 75% of private party
    const privatePartyValue = Math.floor(adjustedValue);
    const dealerRetailValue = Math.floor(adjustedValue * 1.20); // Dealer markup 20%
    const replacementCost = Math.floor(adjustedValue * 1.10); // Insurance replacement cost

    return {
      vin: request.vin,
      year: request.year,
      make: request.make,
      model: request.model,
      trim: request.trim,
      mileage: request.mileage,
      condition: request.condition,

      trade_in_value: tradeInValue * 100, // Convert to cents
      private_party_value: privatePartyValue * 100,
      dealer_retail_value: dealerRetailValue * 100,
      replacement_cost: replacementCost * 100,

      confidence_score: this.calculateConfidenceScore(request),
      data_source: 'Mock Valuation Service (KBB-style)',
      valuation_date: new Date(),

      typical_mileage_for_year: typicalMileage,
      mileage_adjustment: mileageAdjustment * 100,
      condition_adjustment: conditionAdjustment * 100,
      market_adjustment: marketAdjustment * 100,
    };
  }

  /**
   * Estimate MSRP based on make/model/year
   *
   * In production, this would query a database of historical MSRPs.
   * For demo, we use realistic estimates by vehicle class.
   */
  private estimateMSRP(year: number, make: string, model: string): number {
    // Base MSRP estimates by make/model (2020 baseline)
    const msrpDatabase: Record<string, number> = {
      // Economy cars
      'toyota_corolla': 20000,
      'honda_civic': 22000,
      'hyundai_elantra': 19000,
      'nissan_sentra': 19500,

      // Midsize cars
      'toyota_camry': 25000,
      'honda_accord': 25000,
      'nissan_altima': 24000,
      'mazda_mazda6': 24000,

      // Compact SUVs
      'honda_cr-v': 26000,
      'toyota_rav4': 26500,
      'mazda_cx-5': 26000,
      'subaru_forester': 25000,

      // Midsize SUVs
      'toyota_highlander': 35000,
      'honda_pilot': 33000,
      'kia_sorento': 30000,
      'subaru_outback': 28000,

      // Full-size pickups
      'ford_f-150': 45000,
      'chevrolet_silverado 1500': 42000,
      'ram_1500': 43000,
      'toyota_tundra': 44000,

      // Luxury cars
      'bmw_3 series': 42000,
      'bmw_330i': 42000,
      'mercedes-benz_c-class': 44000,
      'mercedes-benz_c300': 44000,
      'audi_a4': 40000,
      'lexus_es': 41000,

      // Luxury SUVs
      'bmw_x5': 60000,
      'mercedes-benz_gle': 55000,
      'lexus_rx': 46000,

      // Electric vehicles
      'tesla_model 3': 55000,
      'tesla_model y': 60000,
      'chevrolet_bolt': 37000,
      'nissan_leaf': 32000,

      // Off-road/Specialty
      'jeep_wrangler': 35000,
      'jeep_grand cherokee': 38000,
    };

    const key = `${make.toLowerCase()}_${model.toLowerCase()}`;
    let baseMSRP = msrpDatabase[key] || 30000; // Default if not found

    // Adjust for year (assume 2% price increase per year)
    const yearDifference = year - 2020;
    const inflationRate = 0.02;
    baseMSRP = baseMSRP * Math.pow(1 + inflationRate, yearDifference);

    return Math.floor(baseMSRP);
  }

  /**
   * Calculate depreciation based on vehicle age
   *
   * Typical depreciation curve:
   * - Year 1: 20-30% loss
   * - Year 2: 15-20% additional
   * - Year 3: 10-15% additional
   * - Years 4+: 8-10% per year
   *
   * Reference: https://www.carfax.com/blog/car-depreciation
   */
  private calculateDepreciation(msrp: number, age: number): number {
    if (age === 0) return msrp;

    const depreciationSchedule = [
      0.75, // Year 1: 25% depreciation
      0.85, // Year 2: 15% additional
      0.90, // Year 3: 10% additional
      0.92, // Year 4: 8% per year
      0.92, // Year 5
      0.92, // Year 6
      0.93, // Year 7: slowing depreciation
      0.93, // Year 8
      0.94, // Year 9
      0.94, // Year 10+
    ];

    let value = msrp;
    for (let i = 0; i < age && i < depreciationSchedule.length; i++) {
      value *= depreciationSchedule[i];
    }

    // For vehicles older than schedule, apply 5% per year
    if (age > depreciationSchedule.length) {
      const additionalYears = age - depreciationSchedule.length;
      value *= Math.pow(0.95, additionalYears);
    }

    // Floor at 5% of MSRP (even old cars have some value)
    return Math.max(value, msrp * 0.05);
  }

  /**
   * Calculate typical mileage for vehicle year
   *
   * Industry standard: 12,000-15,000 miles per year
   * We use 12,000 for typical mileage baseline.
   */
  private calculateTypicalMileage(year: number): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    return age * 12000;
  }

  /**
   * Calculate mileage adjustment
   *
   * - Above typical mileage: Decrease value
   * - Below typical mileage: Increase value
   * - Rule of thumb: $0.10 - $0.15 per mile difference
   */
  private calculateMileageAdjustment(
    actualMileage: number,
    typicalMileage: number,
    baseValue: number
  ): number {
    const mileageDifference = typicalMileage - actualMileage;

    // Adjustment rate: 0.5 cents per mile per $10k of value
    const adjustmentRatePerMile = (baseValue / 10000) * 0.005;

    const adjustment = mileageDifference * adjustmentRatePerMile;

    // Cap adjustment at ±20% of base value
    const maxAdjustment = baseValue * 0.20;
    return Math.max(-maxAdjustment, Math.min(maxAdjustment, adjustment));
  }

  /**
   * Calculate condition adjustment
   *
   * Condition multipliers:
   * - EXCELLENT: +10% (well-maintained, no issues)
   * - GOOD: 0% (baseline, minor wear)
   * - FAIR: -15% (visible wear, some issues)
   * - POOR: -35% (significant issues, needs repairs)
   */
  private calculateConditionAdjustment(
    condition: VehicleCondition,
    baseValue: number
  ): number {
    const conditionMultipliers: Record<VehicleCondition, number> = {
      [VehicleCondition.EXCELLENT]: 0.10,
      [VehicleCondition.GOOD]: 0.00,
      [VehicleCondition.FAIR]: -0.15,
      [VehicleCondition.POOR]: -0.35,
    };

    return baseValue * conditionMultipliers[condition];
  }

  /**
   * Calculate market demand adjustment
   *
   * Some makes/models hold value better due to reliability, brand, demand.
   * This simulates market forces.
   */
  private calculateMarketAdjustment(
    make: string,
    model: string,
    baseValue: number
  ): number {
    // High-demand brands (Toyota, Honda, Lexus, Subaru, Tesla)
    const highDemandBrands = ['toyota', 'honda', 'lexus', 'subaru', 'tesla', 'porsche'];

    // Medium-demand brands
    const mediumDemandBrands = ['mazda', 'hyundai', 'kia', 'bmw', 'mercedes-benz', 'audi'];

    // High-demand models (trucks, Jeep Wrangler, etc.)
    const highDemandModels = ['f-150', 'silverado', 'ram 1500', 'wrangler', '4runner', 'tacoma'];

    const makeLower = make.toLowerCase();
    const modelLower = model.toLowerCase();

    let adjustment = 0;

    if (highDemandBrands.includes(makeLower)) {
      adjustment += baseValue * 0.05; // +5%
    } else if (mediumDemandBrands.includes(makeLower)) {
      adjustment += baseValue * 0.02; // +2%
    } else {
      adjustment -= baseValue * 0.03; // -3% for others
    }

    if (highDemandModels.some(m => modelLower.includes(m))) {
      adjustment += baseValue * 0.05; // +5% for high-demand models
    }

    return adjustment;
  }

  /**
   * Calculate confidence score based on data quality
   *
   * Higher confidence when we have more specific information.
   */
  private calculateConfidenceScore(request: VehicleValuationRequest): number {
    let score = 0.70; // Base score

    if (request.vin) score += 0.10; // VIN provides exact vehicle
    if (request.trim) score += 0.10; // Trim level helps accuracy
    if (request.mileage > 0) score += 0.05; // Mileage is provided
    if (request.zip_code) score += 0.05; // Location helps with regional pricing

    return Math.min(score, 1.0);
  }

  /**
   * Get valuation history (simulated)
   *
   * Shows how value has changed over time.
   * In production, this would query historical valuation data.
   */
  async getValuationHistory(
    vin: string,
    months: number = 12
  ): Promise<{ date: Date; value: number }[]> {
    // This is mocked data showing gradual depreciation
    const history: { date: Date; value: number }[] = [];

    // Would query actual historical data in production
    return history;
  }
}
