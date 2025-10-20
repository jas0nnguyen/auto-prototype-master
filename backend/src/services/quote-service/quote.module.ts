/**
 * Quote Module
 *
 * NestJS module that bundles all quote-related functionality together.
 *
 * What is a Module?
 * A module is like a department in a company - it groups related services,
 * controllers, and providers together. This keeps the application organized
 * and makes dependencies clear.
 *
 * This module provides:
 * - QuotesController: Handles HTTP requests
 * - QuoteService: Main quote business logic
 * - PartyCreationService: Creates Party/Person entities
 * - VehicleEnrichmentService: Enriches vehicle data
 * - PolicyCreationService: Creates Policy entities
 * - CoverageAssignmentService: Assigns coverages to policies
 * - QuoteExpirationService: Tracks quote expiration
 */

import { Module } from '@nestjs/common';
import { QuotesController } from '../../api/routes/quotes.controller';
import { QuoteService } from './quote.service';
import { PartyCreationService } from './party-creation';
import { VehicleEnrichmentService } from './vehicle-enrichment';
import { PolicyCreationService } from './policy-creation';
import { CoverageAssignmentService } from './coverage-assignment';
import { QuoteExpirationService } from './quote-expiration';

// Import rating engine module
import { RatingEngineModule } from '../rating-engine/rating-engine.module';

// Import mock services module
import { MockServicesModule } from '../mock-services/mock-services.module';

@Module({
  imports: [
    RatingEngineModule, // Provides PremiumCalculator and all rating services
    MockServicesModule, // Provides VIN decoder, vehicle valuation, etc.
  ],
  controllers: [
    QuotesController, // Register the quotes REST controller
  ],
  providers: [
    QuoteService, // Main quote service
    PartyCreationService, // Party/Person creation
    VehicleEnrichmentService, // Vehicle enrichment
    PolicyCreationService, // Policy creation
    CoverageAssignmentService, // Coverage assignment
    QuoteExpirationService, // Quote expiration tracking
  ],
  exports: [
    QuoteService, // Export so other modules can use QuoteService
  ],
})
export class QuoteModule {}

/**
 * LEARNING NOTE: NestJS Modules
 *
 * Modules have 4 main properties:
 *
 * 1. imports: Other modules this module depends on
 *    - Like importing libraries in your code
 *    - Makes their exported providers available here
 *
 * 2. controllers: HTTP request handlers
 *    - Registered automatically by NestJS
 *    - Handle incoming requests and return responses
 *
 * 3. providers: Services and utilities
 *    - These are the "workers" that do the actual business logic
 *    - Injected into controllers and other services
 *
 * 4. exports: What to share with other modules
 *    - Like a public API
 *    - Other modules can only use what you export
 *
 * Example Flow:
 * Request → QuotesController → QuoteService → PartyCreationService → Response
 *
 * The module system ensures all dependencies are available and
 * properly instantiated by NestJS.
 */
