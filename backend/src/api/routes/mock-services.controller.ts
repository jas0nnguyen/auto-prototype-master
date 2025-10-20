/**
 * Mock Services API Controller
 *
 * Provides REST endpoints for mock external services:
 * - VIN Decoder (vehicle identification)
 * - Vehicle Valuation (pricing/market value)
 * - Safety Ratings (NHTSA/IIHS)
 *
 * These services simulate external API integrations that would exist
 * in a production insurance system.
 *
 * Routes:
 * - POST /api/v1/mock/vin-decoder
 * - POST /api/v1/mock/vehicle-valuation
 * - POST /api/v1/mock/safety-ratings
 */

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VINDecoderService, VINDecodeResult } from '../../services/mock-services/vin-decoder.service';
import {
  VehicleValuationService,
  VehicleValuationRequest,
  VehicleValuationResult,
  VehicleCondition,
} from '../../services/mock-services/vehicle-valuation.service';
import {
  SafetyRatingsService,
  SafetyRatingResult,
} from '../../services/mock-services/safety-ratings.service';
import { DelaySimulator, DelayScenario } from '../../services/mock-services/delay-simulator';

/**
 * VIN Decode Request DTO
 */
export class VINDecodeRequestDto {
  vin: string;
}

/**
 * Batch VIN Decode Request DTO
 */
export class BatchVINDecodeRequestDto {
  vins: string[];
}

/**
 * Safety Ratings Request DTO
 */
export class SafetyRatingsRequestDto {
  year: number;
  make: string;
  model: string;
  trim?: string;
  vin?: string;
}

@ApiTags('Mock Services')
@Controller('api/v1/mock')
export class MockServicesController {
  constructor(
    private readonly vinDecoderService: VINDecoderService,
    private readonly vehicleValuationService: VehicleValuationService,
    private readonly safetyRatingsService: SafetyRatingsService
  ) {}

  /**
   * Decode VIN
   *
   * POST /api/v1/mock/vin-decoder
   *
   * Decodes a Vehicle Identification Number and returns vehicle details.
   *
   * @param body - VIN decode request
   * @returns VIN decode result with vehicle information
   */
  @Post('vin-decoder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Decode Vehicle Identification Number (VIN)',
    description: 'Validates and decodes a VIN to return vehicle make, model, year, and specifications.',
  })
  @ApiResponse({
    status: 200,
    description: 'VIN successfully decoded',
    type: Object, // Would be VINDecodeResult in real Swagger setup
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid VIN format or checksum',
  })
  async decodeVIN(@Body() body: VINDecodeRequestDto): Promise<VINDecodeResult> {
    // Simulate network delay
    const delayConfig = DelaySimulator.fromScenarioEnv(
      parseInt(process.env.MOCK_VIN_DECODER_DELAY_MS || '500', 10)
    );

    const delayResult = await DelaySimulator.simulate(delayConfig);
    DelaySimulator.logDelay('VIN Decoder', delayResult);

    if (delayResult.simulatedError) {
      throw new Error(delayResult.simulatedError.message);
    }

    // Decode VIN
    return await this.vinDecoderService.decode(body.vin);
  }

  /**
   * Batch Decode VINs
   *
   * POST /api/v1/mock/vin-decoder/batch
   *
   * Decodes multiple VINs in a single request.
   *
   * @param body - Batch VIN decode request
   * @returns Array of VIN decode results
   */
  @Post('vin-decoder/batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Batch decode multiple VINs',
    description: 'Decodes an array of VINs in a single request.',
  })
  @ApiResponse({
    status: 200,
    description: 'VINs successfully decoded',
  })
  async batchDecodeVINs(@Body() body: BatchVINDecodeRequestDto): Promise<VINDecodeResult[]> {
    // Simulate network delay (slightly longer for batch)
    const delayConfig = DelaySimulator.fromScenarioEnv(
      parseInt(process.env.MOCK_VIN_DECODER_DELAY_MS || '500', 10) * 1.5
    );

    const delayResult = await DelaySimulator.simulate(delayConfig);
    DelaySimulator.logDelay('VIN Decoder (Batch)', delayResult);

    if (delayResult.simulatedError) {
      throw new Error(delayResult.simulatedError.message);
    }

    // Batch decode VINs
    return await this.vinDecoderService.batchDecode(body.vins);
  }

  /**
   * Get Vehicle Valuation
   *
   * POST /api/v1/mock/vehicle-valuation
   *
   * Returns market valuation for a vehicle based on year, make, model,
   * mileage, and condition.
   *
   * @param body - Vehicle valuation request
   * @returns Vehicle valuation result
   */
  @Post('vehicle-valuation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get vehicle market valuation',
    description: 'Returns trade-in, private party, and dealer retail values based on vehicle details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Valuation successfully calculated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid vehicle details',
  })
  async getVehicleValuation(
    @Body() body: VehicleValuationRequest
  ): Promise<VehicleValuationResult> {
    // Simulate network delay
    const delayConfig = DelaySimulator.fromScenarioEnv(
      parseInt(process.env.MOCK_VEHICLE_VALUATION_DELAY_MS || '1000', 10)
    );

    const delayResult = await DelaySimulator.simulate(delayConfig);
    DelaySimulator.logDelay('Vehicle Valuation', delayResult);

    if (delayResult.simulatedError) {
      throw new Error(delayResult.simulatedError.message);
    }

    // Get valuation
    return await this.vehicleValuationService.getValuation(body);
  }

  /**
   * Get Safety Ratings
   *
   * POST /api/v1/mock/safety-ratings
   *
   * Returns NHTSA and IIHS safety ratings for a vehicle.
   *
   * @param body - Safety ratings request
   * @returns Safety rating result
   */
  @Post('safety-ratings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get vehicle safety ratings',
    description: 'Returns NHTSA 5-star ratings and IIHS crash test results for a vehicle.',
  })
  @ApiResponse({
    status: 200,
    description: 'Safety ratings successfully retrieved',
  })
  @ApiResponse({
    status: 404,
    description: 'Safety ratings not found for this vehicle',
  })
  async getSafetyRatings(
    @Body() body: SafetyRatingsRequestDto
  ): Promise<SafetyRatingResult> {
    // Simulate network delay
    const delayConfig = DelaySimulator.fromScenarioEnv(
      parseInt(process.env.MOCK_SAFETY_RATINGS_DELAY_MS || '800', 10)
    );

    const delayResult = await DelaySimulator.simulate(delayConfig);
    DelaySimulator.logDelay('Safety Ratings', delayResult);

    if (delayResult.simulatedError) {
      throw new Error(delayResult.simulatedError.message);
    }

    // Get safety ratings
    return await this.safetyRatingsService.getSafetyRatings(
      body.year,
      body.make,
      body.model,
      body.trim,
      body.vin
    );
  }

  /**
   * Get Mock Service Status
   *
   * GET /api/v1/mock/status
   *
   * Returns the current configuration and status of mock services.
   * Useful for debugging and demo purposes.
   *
   * @returns Mock service status
   */
  @Post('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get mock services status',
    description: 'Returns current mock service configuration and scenario.',
  })
  async getMockStatus(): Promise<{
    scenario: string;
    delays: {
      vin_decoder_ms: number;
      vehicle_valuation_ms: number;
      safety_ratings_ms: number;
    };
    info: string;
  }> {
    return {
      scenario: process.env.MOCK_SCENARIO || 'realistic',
      delays: {
        vin_decoder_ms: parseInt(process.env.MOCK_VIN_DECODER_DELAY_MS || '500', 10),
        vehicle_valuation_ms: parseInt(process.env.MOCK_VEHICLE_VALUATION_DELAY_MS || '1000', 10),
        safety_ratings_ms: parseInt(process.env.MOCK_SAFETY_RATINGS_DELAY_MS || '800', 10),
      },
      info: 'Mock services are simulating external API integrations. Configure delays and scenarios via environment variables.',
    };
  }
}
