/**
 * Vehicle Rating Service (T054)
 *
 * Calculates rating factors based on vehicle characteristics including:
 * - Vehicle age (0-5 years: 1.0, 5-10: 1.2, 10+: 1.4)
 * - Make/model (luxury: 1.3, economy: 0.9, standard: 1.0)
 * - High-performance factor (+50-100%)
 * - Safety features discount integration
 *
 * Vehicle characteristics significantly impact insurance premiums due to:
 * - Repair costs (luxury/exotic vehicles cost more to repair)
 * - Theft risk (certain makes/models more frequently stolen)
 * - Safety ratings (better safety = fewer/less severe claims)
 * - Performance (high-performance vehicles = higher accident risk)
 *
 * @module VehicleRatingService
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * Vehicle information for rating
 */
export interface VehicleInfo {
  year: number;
  make: string;
  model: string;
  vin: string;
  bodyType?: string;
  marketValue?: number;
  safetyRating?: number; // NHTSA overall rating (1-5)
  antiTheftDevice?: boolean;
}

/**
 * Detailed breakdown of vehicle rating factors
 */
export interface VehicleFactorDetails {
  ageFactor: number;
  makeModelFactor: number;
  performanceFactor: number;
  safetyFactor: number;
  antiTheftFactor: number;
  marketValueFactor: number;
  totalFactor: number;
}

/**
 * Vehicle Rating Service
 *
 * Analyzes vehicle characteristics to determine risk-based premium multipliers.
 */
@Injectable()
export class VehicleRatingService {
  private readonly logger = new Logger(VehicleRatingService.name);

  /**
   * Calculate overall vehicle rating factor
   *
   * Combines all vehicle-specific factors into a single multiplier:
   * - Age factor (newer vehicles often cost more to repair)
   * - Make/model factor (based on repair costs and theft rates)
   * - Performance factor (sports/high-performance vehicles)
   * - Safety factor (better safety ratings reduce severity)
   * - Anti-theft factor (reduces theft risk)
   *
   * @param vehicle - Vehicle information
   * @returns Combined vehicle rating factor (typically 0.8 - 2.5)
   */
  async calculateVehicleFactor(vehicle: VehicleInfo): Promise<number> {
    const details = await this.getFactorDetails(vehicle);
    return details.totalFactor;
  }

  /**
   * Get detailed breakdown of vehicle rating factors
   *
   * @param vehicle - Vehicle information
   * @returns Detailed factor breakdown
   */
  async getFactorDetails(vehicle: VehicleInfo): Promise<VehicleFactorDetails> {
    const ageFactor = this.calculateAgeFactor(vehicle.year);
    const makeModelFactor = this.calculateMakeModelFactor(vehicle.make, vehicle.model);
    const performanceFactor = this.calculatePerformanceFactor(vehicle.make, vehicle.model, vehicle.bodyType);
    const safetyFactor = this.calculateSafetyFactor(vehicle.safetyRating);
    const antiTheftFactor = this.calculateAntiTheftFactor(vehicle.antiTheftDevice);
    const marketValueFactor = this.calculateMarketValueFactor(vehicle.marketValue);

    // Combined factor is multiplicative
    const totalFactor = ageFactor * makeModelFactor * performanceFactor * safetyFactor * antiTheftFactor * marketValueFactor;

    return {
      ageFactor,
      makeModelFactor,
      performanceFactor,
      safetyFactor,
      antiTheftFactor,
      marketValueFactor,
      totalFactor,
    };
  }

  /**
   * Calculate age-based rating factor
   *
   * Newer vehicles:
   * - Higher replacement cost
   * - More expensive parts
   * - Advanced technology = higher repair costs
   *
   * Older vehicles:
   * - Lower market value but can be expensive to repair (parts availability)
   * - Safety features may be outdated
   *
   * @param year - Vehicle model year
   * @returns Age factor (0.9 - 1.4)
   */
  private calculateAgeFactor(year: number): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    if (age <= 3) {
      return 1.0; // New vehicles - baseline
    } else if (age <= 5) {
      return 1.05; // Slightly higher (still relatively new)
    } else if (age <= 10) {
      return 1.2; // Moderate increase
    } else if (age <= 15) {
      return 1.3; // Older vehicles
    } else {
      return 1.4; // Very old vehicles (parts availability issues)
    }
  }

  /**
   * Calculate make/model rating factor
   *
   * Based on industry loss data:
   * - Luxury brands: Higher repair costs
   * - Economy brands: Lower repair costs
   * - High-theft models: Higher factor
   *
   * @param make - Vehicle manufacturer
   * @param model - Vehicle model
   * @returns Make/model factor (0.8 - 1.5)
   */
  private calculateMakeModelFactor(make: string, model: string): number {
    const makeLower = make.toLowerCase();
    const modelLower = model.toLowerCase();

    // Luxury brands
    const luxuryBrands = ['bmw', 'mercedes', 'audi', 'lexus', 'porsche', 'tesla'];
    if (luxuryBrands.includes(makeLower)) {
      return 1.3;
    }

    // Economy brands
    const economyBrands = ['toyota', 'honda', 'hyundai', 'kia', 'mazda'];
    if (economyBrands.includes(makeLower)) {
      return 0.9;
    }

    // High-theft models
    const highTheftModels = ['civic', 'accord', 'camry', 'corolla', 'altima'];
    if (highTheftModels.includes(modelLower)) {
      return 1.15;
    }

    // Standard factor for other makes/models
    return 1.0;
  }

  /**
   * Calculate performance-based rating factor
   *
   * High-performance vehicles correlate with:
   * - Higher speeds
   * - More severe accidents
   * - Expensive repairs
   *
   * @param make - Vehicle manufacturer
   * @param model - Vehicle model
   * @param bodyType - Body type (coupe, sedan, SUV, etc.)
   * @returns Performance factor (1.0 - 2.0)
   */
  private calculatePerformanceFactor(make: string, model: string, bodyType?: string): number {
    const makeLower = make.toLowerCase();
    const modelLower = model.toLowerCase();

    // Exotic/supercar brands
    const exoticBrands = ['ferrari', 'lamborghini', 'maserati', 'bugatti', 'mclaren'];
    if (exoticBrands.includes(makeLower)) {
      return 2.0;
    }

    // Performance brands/models
    const performanceBrands = ['porsche', 'corvette', 'mustang', 'camaro', 'challenger'];
    if (performanceBrands.some(brand => makeLower.includes(brand) || modelLower.includes(brand))) {
      return 1.5;
    }

    // Sports cars by body type
    if (bodyType && bodyType.toLowerCase() === 'coupe') {
      return 1.2;
    }

    // Standard vehicles
    return 1.0;
  }

  /**
   * Calculate safety rating factor
   *
   * Better safety ratings lead to:
   * - Fewer accidents
   * - Less severe injuries
   * - Lower claim costs
   *
   * @param safetyRating - NHTSA overall safety rating (1-5)
   * @returns Safety factor (0.85 - 1.0)
   */
  private calculateSafetyFactor(safetyRating?: number): number {
    if (!safetyRating) {
      return 1.0; // No data = no discount
    }

    // 5-star rating gets best discount
    if (safetyRating === 5) {
      return 0.85; // 15% reduction
    } else if (safetyRating === 4) {
      return 0.90; // 10% reduction
    } else if (safetyRating === 3) {
      return 0.95; // 5% reduction
    } else {
      return 1.0; // No discount for low ratings
    }
  }

  /**
   * Calculate anti-theft device factor
   *
   * Anti-theft devices reduce:
   * - Theft risk
   * - Comprehensive claims
   *
   * @param hasAntiTheft - Vehicle has anti-theft device
   * @returns Anti-theft factor (0.90 - 1.0)
   */
  private calculateAntiTheftFactor(hasAntiTheft?: boolean): number {
    return hasAntiTheft ? 0.95 : 1.0; // 5% discount for anti-theft
  }

  /**
   * Calculate market value factor
   *
   * Higher value vehicles:
   * - More expensive to replace
   * - Higher comprehensive/collision premiums
   *
   * @param marketValue - Estimated market value
   * @returns Market value factor (0.9 - 1.3)
   */
  private calculateMarketValueFactor(marketValue?: number): number {
    if (!marketValue) {
      return 1.0;
    }

    if (marketValue < 10000) {
      return 0.9;  // Older/lower value vehicles
    } else if (marketValue < 30000) {
      return 1.0;  // Average vehicles
    } else if (marketValue < 60000) {
      return 1.15; // Higher value vehicles
    } else {
      return 1.3;  // Luxury/exotic vehicles
    }
  }
}
