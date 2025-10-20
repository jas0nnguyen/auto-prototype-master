/**
 * Mock Services Module
 *
 * NestJS module for all mock external service integrations.
 *
 * This module provides mock implementations of external services
 * like VIN decoder, vehicle valuation, safety ratings, etc.
 * These mocks simulate realistic API responses without requiring
 * actual API keys or network calls.
 */

import { Module } from '@nestjs/common';
import { MockServicesController } from '../../api/routes/mock-services.controller';
import { VINDecoderService } from './vin-decoder.service';
import { VehicleValuationService } from './vehicle-valuation.service';
import { SafetyRatingsService } from './safety-ratings.service';
import { DelaySimulator } from './delay-simulator';
import { VehicleDataCache } from './vehicle-data-cache';

@Module({
  controllers: [
    MockServicesController, // REST endpoints for mock services
  ],
  providers: [
    VINDecoderService,
    VehicleValuationService,
    SafetyRatingsService,
    DelaySimulator,
    VehicleDataCache,
  ],
  exports: [
    // Export services so other modules can use them
    VINDecoderService,
    VehicleValuationService,
    SafetyRatingsService,
    DelaySimulator,
    VehicleDataCache,
  ],
})
export class MockServicesModule {}
