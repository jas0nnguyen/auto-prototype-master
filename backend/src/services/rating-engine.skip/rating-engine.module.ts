/**
 * Rating Engine Module
 *
 * NestJS module for all premium calculation and rating services.
 *
 * This module provides all the rating calculators needed to calculate
 * insurance premiums based on vehicle, driver, location, and coverage factors.
 */

import { Module } from '@nestjs/common';
import { RatingEngineController } from '../../api/routes/rating.controller';
import { PremiumCalculator } from './premium-calculator';
import { VehicleRatingService } from './vehicle-rating';
import { DriverRatingService } from './driver-rating';
import { LocationRatingService } from './location-rating';
import { CoverageRatingService } from './coverage-rating';
import { DiscountCalculator } from './discount-calculator';
import { SurchargeCalculator } from './surcharge-calculator';
import { TaxFeeCalculator } from './tax-fee-calculator';
import { RatingEngineService } from './rating-engine.service';

@Module({
  controllers: [
    RatingEngineController, // REST endpoints for rating calculations
  ],
  providers: [
    // Main orchestrator
    PremiumCalculator,

    // Rating factor calculators
    VehicleRatingService,
    DriverRatingService,
    LocationRatingService,
    CoverageRatingService,

    // Discount and surcharge calculators
    DiscountCalculator,
    SurchargeCalculator,

    // Tax and fee calculator
    TaxFeeCalculator,

    // Rating engine service (facade)
    RatingEngineService,
  ],
  exports: [
    // Export PremiumCalculator so other modules can use it
    PremiumCalculator,
    RatingEngineService,

    // Export individual calculators in case they're needed
    VehicleRatingService,
    DriverRatingService,
    LocationRatingService,
    CoverageRatingService,
    DiscountCalculator,
    SurchargeCalculator,
    TaxFeeCalculator,
  ],
})
export class RatingEngineModule {}
