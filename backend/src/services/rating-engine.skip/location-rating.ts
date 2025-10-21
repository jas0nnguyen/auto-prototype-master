/**
 * Location Rating Service (T056)
 *
 * Calculates rating factors based on geographic location including:
 * - Zip code risk factor (urban: 1.2, suburban: 1.0, rural: 0.9)
 * - State factor (high-risk states: 1.3, low-risk: 0.9)
 * - Crime rate factor
 *
 * Geographic location impacts insurance rates through:
 * - Population density (more cars = more accidents)
 * - Crime rates (theft and vandalism)
 * - Weather and natural disasters
 * - Repair costs (urban areas typically higher)
 * - Legal environment (lawsuit-friendly states)
 *
 * @module LocationRatingService
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * Location information for rating
 */
export interface LocationInfo {
  zipCode: string;
  state: string;
  municipality?: string;
  territoryType?: 'URBAN' | 'SUBURBAN' | 'RURAL';
}

/**
 * Detailed breakdown of location rating factors
 */
export interface LocationFactorDetails {
  zipCodeFactor: number;
  stateFactor: number;
  territoryTypeFactor: number;
  crimeRateFactor: number;
  totalFactor: number;
}

/**
 * Location Rating Service
 *
 * Analyzes geographic characteristics to determine location-based risk.
 * Territory rating is essential for accurate pricing and risk management.
 */
@Injectable()
export class LocationRatingService {
  private readonly logger = new Logger(LocationRatingService.name);

  // State-specific rating multipliers (simplified)
  // In production, these would be loaded from rating tables
  private readonly stateMultipliers: Record<string, number> = {
    // High-cost states (dense population, high medical costs, lawsuit-friendly)
    'MI': 1.35, // Michigan (highest in nation due to no-fault laws)
    'LA': 1.30, // Louisiana
    'FL': 1.25, // Florida
    'NY': 1.25, // New York
    'CA': 1.20, // California
    'NJ': 1.20, // New Jersey

    // Moderate-cost states
    'TX': 1.10,
    'IL': 1.10,
    'GA': 1.05,
    'PA': 1.05,
    'OH': 1.00,
    'NC': 1.00,

    // Low-cost states (rural, lower medical costs, tort reforms)
    'IA': 0.90, // Iowa
    'WI': 0.90, // Wisconsin
    'ID': 0.85, // Idaho
    'ND': 0.85, // North Dakota
    'ME': 0.85, // Maine
    'VT': 0.85, // Vermont
  };

  /**
   * Calculate overall location rating factor
   *
   * Combines:
   * - State-level factors (legal environment, minimum coverage requirements)
   * - ZIP code/territory factors (population density, accident frequency)
   * - Crime rate factors (theft and vandalism risk)
   *
   * @param location - Location information
   * @returns Combined location rating factor (typically 0.7 - 1.5)
   */
  async calculateLocationFactor(location: LocationInfo): Promise<number> {
    const details = await this.getFactorDetails(location);
    return details.totalFactor;
  }

  /**
   * Get detailed breakdown of location rating factors
   *
   * @param location - Location information
   * @returns Detailed factor breakdown
   */
  async getFactorDetails(location: LocationInfo): Promise<LocationFactorDetails> {
    const stateFactor = this.calculateStateFactor(location.state);
    const zipCodeFactor = await this.calculateZipCodeFactor(location.zipCode);
    const territoryTypeFactor = this.calculateTerritoryTypeFactor(location.territoryType);
    const crimeRateFactor = await this.calculateCrimeRateFactor(location.zipCode);

    // Combined factor is multiplicative
    const totalFactor = stateFactor * zipCodeFactor * territoryTypeFactor * crimeRateFactor;

    return {
      zipCodeFactor,
      stateFactor,
      territoryTypeFactor,
      crimeRateFactor,
      totalFactor,
    };
  }

  /**
   * Calculate state-based rating factor
   *
   * States vary significantly in insurance costs due to:
   * - Minimum coverage requirements
   * - No-fault vs tort systems
   * - Lawsuit environment
   * - Medical costs
   * - Uninsured motorist rates
   *
   * @param state - Two-letter state code
   * @returns State factor (0.85 - 1.35)
   */
  private calculateStateFactor(state: string): number {
    const stateUpper = state.toUpperCase();
    return this.stateMultipliers[stateUpper] || 1.0; // Default to 1.0 if state not in map
  }

  /**
   * Calculate ZIP code-based rating factor
   *
   * ZIP code captures:
   * - Accident frequency in area
   * - Repair cost levels
   * - Local weather patterns
   * - Road conditions
   *
   * In production, this would lookup actual territory tables.
   * For demo, we simulate based on ZIP code patterns.
   *
   * @param zipCode - Five-digit ZIP code
   * @returns ZIP code factor (0.8 - 1.4)
   */
  private async calculateZipCodeFactor(zipCode: string): Promise<number> {
    // Simulate ZIP code territory rating
    // In production, this would query rating tables by territory

    // Extract first digit of ZIP code for rough geographic region
    const firstDigit = parseInt(zipCode.charAt(0));

    // Rough approximation:
    // 0-1: Northeast (higher density, higher costs)
    // 2-3: Mid-Atlantic/Southeast
    // 4-5: Midwest/South
    // 6-7: Great Plains/South Central (lower density)
    // 8-9: Mountain/West

    const regionalFactors: Record<number, number> = {
      0: 1.2, // Northeast (NY, NJ, CT)
      1: 1.15, // Northeast (PA, DE)
      2: 1.1, // Mid-Atlantic (DC, MD, VA, WV)
      3: 1.0, // Southeast (GA, FL, AL)
      4: 0.95, // Midwest (KY, MI, OH, IN)
      5: 0.95, // Midwest (IA, MN, WI, IL)
      6: 0.9, // South Central (AR, LA, OK, TX)
      7: 0.85, // Great Plains (NE, KS, SD, ND)
      8: 0.95, // Mountain (CO, UT, WY)
      9: 1.1, // West (CA, NV, OR, WA)
    };

    return regionalFactors[firstDigit] || 1.0;
  }

  /**
   * Calculate territory type factor
   *
   * Territory type affects rates through:
   * - Urban: High density = more accidents, higher theft rates
   * - Suburban: Moderate density = baseline risk
   * - Rural: Low density = fewer accidents, but may have higher severity
   *
   * @param territoryType - Urban, suburban, or rural classification
   * @returns Territory type factor (0.85 - 1.25)
   */
  private calculateTerritoryTypeFactor(territoryType?: 'URBAN' | 'SUBURBAN' | 'RURAL'): number {
    if (!territoryType) {
      return 1.0; // Default to suburban if unknown
    }

    switch (territoryType) {
      case 'URBAN':
        return 1.25; // Higher rates in cities (congestion, theft, vandalism)
      case 'SUBURBAN':
        return 1.0; // Baseline
      case 'RURAL':
        return 0.85; // Lower rates in rural areas (fewer cars, less theft)
      default:
        return 1.0;
    }
  }

  /**
   * Calculate crime rate factor
   *
   * Higher crime areas experience:
   * - More vehicle thefts
   * - More vandalism claims
   * - Higher comprehensive claim frequency
   *
   * This is particularly important for comprehensive coverage pricing.
   *
   * @param zipCode - ZIP code to lookup crime statistics
   * @returns Crime rate factor (0.95 - 1.15)
   */
  private async calculateCrimeRateFactor(zipCode: string): Promise<number> {
    // Simulate crime rate lookup
    // In production, this would integrate with FBI crime statistics
    // or third-party crime data providers

    // For demo, we'll use a simple hash of ZIP code to simulate variation
    const zipNumber = parseInt(zipCode);
    const crimeScore = (zipNumber % 20) / 20; // Normalized 0-1

    // Convert crime score to multiplier (0.95 - 1.15)
    return 0.95 + (crimeScore * 0.20);
  }

  /**
   * Determine territory type from ZIP code
   *
   * Helper method to classify ZIP codes as urban/suburban/rural.
   * In production, this would use official HUD or Census classifications.
   *
   * @param zipCode - Five-digit ZIP code
   * @returns Territory type classification
   */
  async determineTerritory Type(zipCode: string): Promise<'URBAN' | 'SUBURBAN' | 'RURAL'> {
    // Simulate territory classification
    // In production, would lookup in reference database

    const zipNumber = parseInt(zipCode);
    const lastTwoDigits = zipNumber % 100;

    // Simplified logic for demo
    if (lastTwoDigits < 30) {
      return 'URBAN'; // ~30% urban
    } else if (lastTwoDigits < 70) {
      return 'SUBURBAN'; // ~40% suburban
    } else {
      return 'RURAL'; // ~30% rural
    }
  }
}
