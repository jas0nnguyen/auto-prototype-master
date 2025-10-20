/**
 * Safety Ratings Mock Service
 *
 * Simulates vehicle safety rating services from:
 * - NHTSA (National Highway Traffic Safety Administration) - 5-star ratings
 * - IIHS (Insurance Institute for Highway Safety) - Good/Acceptable/Marginal/Poor
 *
 * In production, this would integrate with:
 * - NHTSA vPIC API: https://vpic.nhtsa.dot.gov/api/
 * - IIHS ratings database
 *
 * Safety ratings influence insurance premiums:
 * - Higher safety ratings → Lower premiums
 * - Advanced safety features → Additional discounts
 */

import { Injectable } from '@nestjs/common';

/**
 * IIHS rating scale
 */
export enum IIHSRating {
  GOOD = 'GOOD',
  ACCEPTABLE = 'ACCEPTABLE',
  MARGINAL = 'MARGINAL',
  POOR = 'POOR',
  NOT_TESTED = 'NOT_TESTED',
}

/**
 * IIHS crash test categories
 */
export interface IIHSCrashTestRatings {
  small_overlap_front_driver: IIHSRating;
  small_overlap_front_passenger: IIHSRating;
  moderate_overlap_front: IIHSRating;
  side: IIHSRating;
  roof_strength: IIHSRating;
  head_restraints_seats: IIHSRating;
}

/**
 * IIHS crash avoidance ratings
 */
export interface IIHSCrashAvoidance {
  front_crash_prevention_vehicle_to_vehicle: IIHSRating;
  front_crash_prevention_vehicle_to_pedestrian: IIHSRating;
  rating: 'SUPERIOR' | 'ADVANCED' | 'BASIC' | 'NOT_AVAILABLE';
}

/**
 * IIHS headlight ratings
 */
export interface IIHSHeadlightRatings {
  rating: IIHSRating;
  curve_left: IIHSRating;
  curve_right: IIHSRating;
  straight: IIHSRating;
}

/**
 * NHTSA 5-star ratings
 */
export interface NHTSA5StarRatings {
  overall_rating: number; // 1-5 stars
  frontal_crash_driver: number;
  frontal_crash_passenger: number;
  side_crash_driver: number;
  side_crash_passenger: number;
  side_crash_barrier: number;
  rollover_rating: number;
  rollover_risk_percentage: number;
}

/**
 * Advanced safety features
 */
export interface SafetyFeatures {
  // Active safety
  forward_collision_warning: boolean;
  automatic_emergency_braking: boolean;
  pedestrian_detection: boolean;
  lane_departure_warning: boolean;
  lane_keeping_assist: boolean;
  blind_spot_monitoring: boolean;
  rear_cross_traffic_alert: boolean;
  adaptive_cruise_control: boolean;

  // Passive safety
  airbags_count: number;
  side_curtain_airbags: boolean;
  knee_airbags: boolean;
  rear_seatbelt_pretensioners: boolean;

  // Structural
  high_strength_steel_percentage: number;
  crumple_zones: boolean;
}

/**
 * Complete safety rating result
 */
export interface SafetyRatingResult {
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;

  // NHTSA ratings
  nhtsa_ratings: NHTSA5StarRatings;

  // IIHS ratings
  iihs_crash_tests: IIHSCrashTestRatings;
  iihs_crash_avoidance: IIHSCrashAvoidance;
  iihs_headlights: IIHSHeadlightRatings;
  iihs_top_safety_pick: boolean;
  iihs_top_safety_pick_plus: boolean;

  // Safety features
  safety_features: SafetyFeatures;

  // Insurance premium impact
  safety_discount_percentage: number; // 0-25% discount based on ratings

  // Data metadata
  data_source: string;
  test_year: number;
  confidence_score: number;
}

@Injectable()
export class SafetyRatingsService {
  /**
   * Get safety ratings for a vehicle
   *
   * @param year - Model year
   * @param make - Vehicle make
   * @param model - Vehicle model
   * @param trim - Optional trim level
   * @param vin - Optional VIN for exact lookup
   * @returns Promise<SafetyRatingResult>
   */
  async getSafetyRatings(
    year: number,
    make: string,
    model: string,
    trim?: string,
    vin?: string
  ): Promise<SafetyRatingResult> {
    // In production, this would call NHTSA API and IIHS database
    // For demo, we return realistic mock data

    // Generate realistic ratings based on make/model/year
    const nhtsaRatings = this.generateNHTSARatings(year, make, model);
    const iihsCrashTests = this.generateIIHSCrashTests(year, make, model);
    const iihsCrashAvoidance = this.generateIIHSCrashAvoidance(year, make, model);
    const iihsHeadlights = this.generateIIHSHeadlights(year, make);
    const safetyFeatures = this.generateSafetyFeatures(year, make, model);

    // Determine IIHS Top Safety Pick awards
    const topSafetyPick = this.determineTopSafetyPick(
      iihsCrashTests,
      iihsCrashAvoidance,
      iihsHeadlights
    );
    const topSafetyPickPlus = this.determineTopSafetyPickPlus(
      iihsCrashTests,
      iihsCrashAvoidance,
      iihsHeadlights
    );

    // Calculate insurance discount based on overall safety
    const safetyDiscount = this.calculateSafetyDiscount(
      nhtsaRatings,
      iihsCrashTests,
      safetyFeatures,
      topSafetyPick,
      topSafetyPickPlus
    );

    return {
      vin,
      year,
      make,
      model,
      trim,
      nhtsa_ratings: nhtsaRatings,
      iihs_crash_tests: iihsCrashTests,
      iihs_crash_avoidance: iihsCrashAvoidance,
      iihs_headlights: iihsHeadlights,
      iihs_top_safety_pick: topSafetyPick,
      iihs_top_safety_pick_plus: topSafetyPickPlus,
      safety_features: safetyFeatures,
      safety_discount_percentage: safetyDiscount,
      data_source: 'Mock NHTSA/IIHS Database',
      test_year: year,
      confidence_score: vin ? 0.95 : 0.80,
    };
  }

  /**
   * Generate realistic NHTSA 5-star ratings
   */
  private generateNHTSARatings(year: number, make: string, model: string): NHTSA5StarRatings {
    // Newer vehicles tend to have better ratings
    const baseRating = year >= 2020 ? 5 : year >= 2017 ? 4 : year >= 2014 ? 4 : 3;

    // Premium/reliable brands tend to score higher
    const premiumBrands = ['toyota', 'honda', 'subaru', 'mazda', 'bmw', 'mercedes-benz', 'tesla', 'volvo', 'audi'];
    const brandBonus = premiumBrands.includes(make.toLowerCase()) ? 1 : 0;

    const overallRating = Math.min(5, baseRating + brandBonus);

    return {
      overall_rating: overallRating,
      frontal_crash_driver: Math.min(5, overallRating),
      frontal_crash_passenger: Math.min(5, overallRating),
      side_crash_driver: Math.min(5, overallRating),
      side_crash_passenger: Math.min(5, overallRating - 1),
      side_crash_barrier: Math.min(5, overallRating),
      rollover_rating: Math.min(5, overallRating - (model.toLowerCase().includes('suv') || model.toLowerCase().includes('truck') ? 1 : 0)),
      rollover_risk_percentage: overallRating >= 4 ? 10 : 15,
    };
  }

  /**
   * Generate realistic IIHS crash test ratings
   */
  private generateIIHSCrashTests(year: number, make: string, model: string): IIHSCrashTestRatings {
    // Newer vehicles perform better
    const isNewVehicle = year >= 2020;
    const isPremiumBrand = ['bmw', 'mercedes-benz', 'audi', 'volvo', 'tesla', 'lexus'].includes(make.toLowerCase());
    const isReliableBrand = ['toyota', 'honda', 'subaru', 'mazda'].includes(make.toLowerCase());

    const goodRating: IIHSRating = IIHSRating.GOOD;
    const acceptableRating: IIHSRating = IIHSRating.ACCEPTABLE;
    const marginalRating: IIHSRating = IIHSRating.MARGINAL;

    if (isNewVehicle && (isPremiumBrand || isReliableBrand)) {
      // Excellent ratings for new premium/reliable vehicles
      return {
        small_overlap_front_driver: goodRating,
        small_overlap_front_passenger: goodRating,
        moderate_overlap_front: goodRating,
        side: goodRating,
        roof_strength: goodRating,
        head_restraints_seats: goodRating,
      };
    } else if (isNewVehicle) {
      // Good ratings for new vehicles
      return {
        small_overlap_front_driver: goodRating,
        small_overlap_front_passenger: acceptableRating,
        moderate_overlap_front: goodRating,
        side: goodRating,
        roof_strength: goodRating,
        head_restraints_seats: acceptableRating,
      };
    } else {
      // Mixed ratings for older vehicles
      return {
        small_overlap_front_driver: acceptableRating,
        small_overlap_front_passenger: marginalRating,
        moderate_overlap_front: goodRating,
        side: acceptableRating,
        roof_strength: acceptableRating,
        head_restraints_seats: acceptableRating,
      };
    }
  }

  /**
   * Generate IIHS crash avoidance ratings
   */
  private generateIIHSCrashAvoidance(year: number, make: string, model: string): IIHSCrashAvoidance {
    if (year >= 2020) {
      return {
        front_crash_prevention_vehicle_to_vehicle: IIHSRating.GOOD,
        front_crash_prevention_vehicle_to_pedestrian: IIHSRating.GOOD,
        rating: 'SUPERIOR',
      };
    } else if (year >= 2017) {
      return {
        front_crash_prevention_vehicle_to_vehicle: IIHSRating.ACCEPTABLE,
        front_crash_prevention_vehicle_to_pedestrian: IIHSRating.ACCEPTABLE,
        rating: 'ADVANCED',
      };
    } else {
      return {
        front_crash_prevention_vehicle_to_vehicle: IIHSRating.NOT_TESTED,
        front_crash_prevention_vehicle_to_pedestrian: IIHSRating.NOT_TESTED,
        rating: 'BASIC',
      };
    }
  }

  /**
   * Generate IIHS headlight ratings
   */
  private generateIIHSHeadlights(year: number, make: string): IIHSHeadlightRatings {
    const premiumBrands = ['bmw', 'mercedes-benz', 'audi', 'volvo', 'lexus', 'tesla'];
    const isPremium = premiumBrands.includes(make.toLowerCase());

    const rating = year >= 2020 && isPremium ? IIHSRating.GOOD :
                   year >= 2018 ? IIHSRating.ACCEPTABLE :
                   IIHSRating.MARGINAL;

    return {
      rating,
      curve_left: rating,
      curve_right: rating,
      straight: rating,
    };
  }

  /**
   * Generate safety features based on year and make
   */
  private generateSafetyFeatures(year: number, make: string, model: string): SafetyFeatures {
    const premiumBrands = ['bmw', 'mercedes-benz', 'audi', 'volvo', 'lexus', 'tesla'];
    const isPremium = premiumBrands.includes(make.toLowerCase());

    // Newer vehicles have more standard safety features
    const hasModernSafety = year >= 2020;
    const hasSomeSafety = year >= 2017;

    return {
      // Active safety (more common in newer vehicles)
      forward_collision_warning: hasModernSafety || (hasSomeSafety && isPremium),
      automatic_emergency_braking: hasModernSafety || (hasSomeSafety && isPremium),
      pedestrian_detection: hasModernSafety && (isPremium || make.toLowerCase() === 'subaru'),
      lane_departure_warning: hasModernSafety || (hasSomeSafety && isPremium),
      lane_keeping_assist: hasModernSafety,
      blind_spot_monitoring: hasSomeSafety || isPremium,
      rear_cross_traffic_alert: hasModernSafety || isPremium,
      adaptive_cruise_control: hasModernSafety || isPremium,

      // Passive safety (standard in most modern vehicles)
      airbags_count: hasModernSafety ? 10 : hasSomeSafety ? 8 : 6,
      side_curtain_airbags: year >= 2010,
      knee_airbags: hasModernSafety || isPremium,
      rear_seatbelt_pretensioners: hasModernSafety,

      // Structural
      high_strength_steel_percentage: hasModernSafety ? 65 : hasSomeSafety ? 50 : 40,
      crumple_zones: year >= 2000,
    };
  }

  /**
   * Determine if vehicle qualifies for IIHS Top Safety Pick
   *
   * Requirements:
   * - Good ratings in all 6 crash tests
   * - Advanced or Superior front crash prevention
   */
  private determineTopSafetyPick(
    crashTests: IIHSCrashTestRatings,
    crashAvoidance: IIHSCrashAvoidance,
    headlights: IIHSHeadlightRatings
  ): boolean {
    const allGoodCrashTests = Object.values(crashTests).every(
      rating => rating === IIHSRating.GOOD || rating === IIHSRating.ACCEPTABLE
    );

    const goodCrashAvoidance = ['SUPERIOR', 'ADVANCED'].includes(crashAvoidance.rating);

    return allGoodCrashTests && goodCrashAvoidance;
  }

  /**
   * Determine if vehicle qualifies for IIHS Top Safety Pick+
   *
   * Requirements (stricter than Top Safety Pick):
   * - Good ratings in all 6 crash tests (no Acceptable)
   * - Superior or Advanced front crash prevention
   * - Good or Acceptable headlight ratings
   */
  private determineTopSafetyPickPlus(
    crashTests: IIHSCrashTestRatings,
    crashAvoidance: IIHSCrashAvoidance,
    headlights: IIHSHeadlightRatings
  ): boolean {
    const allGoodCrashTests = Object.values(crashTests).every(
      rating => rating === IIHSRating.GOOD
    );

    const superiorCrashAvoidance = crashAvoidance.rating === 'SUPERIOR';

    const goodHeadlights = [IIHSRating.GOOD, IIHSRating.ACCEPTABLE].includes(headlights.rating);

    return allGoodCrashTests && superiorCrashAvoidance && goodHeadlights;
  }

  /**
   * Calculate insurance safety discount percentage
   *
   * Factors:
   * - NHTSA overall rating (0-10%)
   * - IIHS crash tests (0-5%)
   * - IIHS Top Safety Pick awards (0-5%)
   * - Advanced safety features (0-5%)
   */
  private calculateSafetyDiscount(
    nhtsa: NHTSA5StarRatings,
    iihs: IIHSCrashTestRatings,
    features: SafetyFeatures,
    topSafetyPick: boolean,
    topSafetyPickPlus: boolean
  ): number {
    let discount = 0;

    // NHTSA rating discount (0-10%)
    discount += (nhtsa.overall_rating / 5) * 10;

    // IIHS crash test discount (0-5%)
    const goodRatingsCount = Object.values(iihs).filter(r => r === IIHSRating.GOOD).length;
    discount += (goodRatingsCount / 6) * 5;

    // Top Safety Pick awards (0-5%)
    if (topSafetyPickPlus) {
      discount += 5;
    } else if (topSafetyPick) {
      discount += 3;
    }

    // Advanced safety features (0-5%)
    const featureCount = [
      features.automatic_emergency_braking,
      features.lane_keeping_assist,
      features.blind_spot_monitoring,
      features.adaptive_cruise_control,
    ].filter(Boolean).length;
    discount += (featureCount / 4) * 5;

    return Math.min(Math.round(discount), 25); // Cap at 25%
  }
}
