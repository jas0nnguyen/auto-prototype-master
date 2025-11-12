/**
 * Quotes Controller - Simplified Version
 *
 * REST API endpoints for quote management:
 * - POST /api/v1/quotes - Create new quote
 * - GET /api/v1/quotes/:id - Get quote by policy ID
 * - GET /api/v1/quotes/reference/:quoteNumber - Get quote by quote number
 *
 * This is a clean, simple implementation that works with the new QuoteService.
 */

import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  HttpStatus,
  HttpException,
  ValidationPipe,
  UsePipes,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuoteService } from '../../services/quote/quote.service';
import type { CreateQuoteInput, QuoteResult } from '../../services/quote/quote.service';

/**
 * Driver DTO
 */
class DriverDTO {
  @ApiProperty({ example: 'John', description: 'Driver first name' })
  first_name!: string;

  @ApiProperty({ example: 'Doe', description: 'Driver last name' })
  last_name!: string;

  @ApiProperty({ example: '1990-01-15', description: 'Date of birth (YYYY-MM-DD)' })
  birth_date!: string | Date;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  email!: string;

  @ApiProperty({ example: '555-123-4567', required: false, description: 'Phone number (optional)' })
  phone?: string;

  @ApiProperty({ example: 'Male', required: false, description: 'Gender' })
  gender?: string;

  @ApiProperty({ example: 'Single', required: false, description: 'Marital status' })
  marital_status?: string;

  @ApiProperty({ example: 10, required: false, description: 'Years licensed' })
  years_licensed?: number;

  @ApiProperty({ example: 'spouse', required: false, description: 'Relationship to primary (for additional drivers)' })
  relationship?: string;

  @ApiProperty({ example: 'DL123456', required: false, description: 'Driver license number' })
  license_number?: string;

  @ApiProperty({ example: 'CA', required: false, description: 'Driver license state' })
  license_state?: string;

  @ApiProperty({ example: true, required: false, description: 'Is this the primary named insured?' })
  is_primary?: boolean;
}

/**
 * Vehicle DTO
 */
class VehicleDTO {
  @ApiProperty({ example: 2020, description: 'Vehicle year' })
  year!: number;

  @ApiProperty({ example: 'Honda', description: 'Vehicle make' })
  make!: string;

  @ApiProperty({ example: 'Accord', description: 'Vehicle model' })
  model!: string;

  @ApiProperty({ example: '1HGCM82633A123456', required: false, description: 'Vehicle Identification Number (VIN)' })
  vin?: string;

  @ApiProperty({ example: 12000, required: false, description: 'Annual mileage' })
  annual_mileage?: number;

  @ApiProperty({ example: 'Sedan', required: false, description: 'Body type' })
  body_type?: string;

  @ApiProperty({ example: 'commute', required: false, description: 'Vehicle usage (commute, pleasure, business)' })
  usage?: string;

  @ApiProperty({ example: 'driver-uuid-123', required: false, description: 'ID of primary driver for this vehicle' })
  primary_driver_id?: string;
}

/**
 * DTO for updating primary driver on an existing quote
 */
class UpdatePrimaryDriverDTO {
  @IsString()
  driver_first_name!: string;

  @IsString()
  driver_last_name!: string;

  @IsString()
  driver_birth_date!: string;

  @IsEmail()
  driver_email!: string;

  @IsString()
  driver_phone!: string;

  @IsOptional()
  @IsString()
  driver_gender?: string;

  @IsOptional()
  @IsString()
  driver_marital_status?: string;

  @IsOptional()
  @IsString()
  driver_license_number?: string;

  @IsOptional()
  @IsString()
  driver_license_state?: string;

  @IsString()
  address_line_1!: string;

  @IsOptional()
  @IsString()
  address_line_2?: string;

  @IsString()
  address_city!: string;

  @IsString()
  address_state!: string;

  @IsString()
  address_zip!: string;
}

/**
 * DTO for updating additional drivers on an existing quote
 */
class UpdateDriversDTO {
  @IsArray()
  additionalDrivers!: DriverDTO[];
}

/**
 * DTO for updating vehicles on an existing quote
 */
class UpdateVehiclesDTO {
  @IsArray()
  vehicles!: VehicleDTO[];
}

/**
 * DTO for updating coverage selections on an existing quote
 */
class UpdateCoverageDTO {
  @IsOptional()
  @IsString()
  coverage_start_date?: string;

  @IsOptional()
  @IsString()
  coverage_bodily_injury_limit?: string;

  @IsOptional()
  @IsString()
  coverage_property_damage_limit?: string;

  @IsOptional()
  @IsNumber()
  coverage_medical_payments_limit?: number;

  @IsOptional()
  @IsBoolean()
  coverage_collision?: boolean;

  @IsOptional()
  @IsNumber()
  coverage_collision_deductible?: number;

  @IsOptional()
  @IsBoolean()
  coverage_comprehensive?: boolean;

  @IsOptional()
  @IsNumber()
  coverage_comprehensive_deductible?: number;

  @IsOptional()
  @IsBoolean()
  coverage_uninsured_motorist?: boolean;

  @IsOptional()
  @IsBoolean()
  coverage_roadside_assistance?: boolean;

  @IsOptional()
  @IsBoolean()
  coverage_rental_reimbursement?: boolean;

  @IsOptional()
  @IsNumber()
  coverage_rental_limit?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleCoverageDTO)
  vehicle_coverages?: VehicleCoverageDTO[];
}

/**
 * DTO for per-vehicle coverage (nested in UpdateCoverageDTO)
 */
class VehicleCoverageDTO {
  @IsNumber()
  vehicle_index: number;

  @IsNumber()
  collision_deductible: number;

  @IsNumber()
  comprehensive_deductible: number;
}

/**
 * DTO for creating a quote (supports both single and multi-driver/vehicle)
 * This defines what data the frontend must send
 */
class CreateQuoteDTO {
  // NEW: Multi-driver/vehicle support
  @ApiProperty({
    type: [DriverDTO],
    required: false,
    description: 'List of drivers (multi-driver support)',
    example: [{
      first_name: 'John',
      last_name: 'Doe',
      birth_date: '1990-01-15',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      gender: 'Male',
      marital_status: 'Married',
      is_primary: true
    }]
  })
  drivers?: DriverDTO[];

  @ApiProperty({
    type: [VehicleDTO],
    required: false,
    description: 'List of vehicles (multi-vehicle support)',
    example: [{
      year: 2020,
      make: 'Honda',
      model: 'Accord',
      vin: '1HGCM82633A123456',
      annual_mileage: 12000,
      body_type: 'Sedan',
      usage: 'commute'
    }]
  })
  vehicles?: VehicleDTO[];

  // LEGACY: Single driver info (backward compatibility)
  @ApiProperty({ example: 'John', required: false, description: 'Driver first name (legacy)' })
  driver_first_name?: string;

  @ApiProperty({ example: 'Doe', required: false, description: 'Driver last name (legacy)' })
  driver_last_name?: string;

  @ApiProperty({ example: '1990-01-15', required: false, description: 'Driver date of birth (legacy)' })
  driver_birth_date?: string | Date;

  @ApiProperty({ example: 'john.doe@example.com', required: false, description: 'Driver email (legacy)' })
  driver_email?: string;

  @ApiProperty({ example: '555-123-4567', required: false, description: 'Driver phone (legacy)' })
  driver_phone?: string;

  @ApiProperty({ example: 'Male', required: false, description: 'Driver gender (legacy)' })
  driver_gender?: string;

  @ApiProperty({ example: 'Single', required: false, description: 'Marital status (legacy)' })
  driver_marital_status?: string;

  @ApiProperty({ example: 10, required: false, description: 'Years licensed (legacy)' })
  driver_years_licensed?: number;

  // Address (applies to primary driver)
  @ApiProperty({ example: '123 Main St', description: 'Street address' })
  address_line_1!: string;

  @ApiProperty({ example: 'Apt 4B', required: false, description: 'Address line 2 (optional)' })
  address_line_2?: string;

  @ApiProperty({ example: 'Los Angeles', description: 'City' })
  address_city!: string;

  @ApiProperty({ example: 'CA', description: 'State (2-letter code)' })
  address_state!: string;

  @ApiProperty({ example: '90001', description: 'ZIP code' })
  address_zip!: string;

  // LEGACY: Single vehicle info (backward compatibility)
  @ApiProperty({ example: 2020, required: false, description: 'Vehicle year (legacy)' })
  vehicle_year?: number;

  @ApiProperty({ example: 'Honda', required: false, description: 'Vehicle make (legacy)' })
  vehicle_make?: string;

  @ApiProperty({ example: 'Accord', required: false, description: 'Vehicle model (legacy)' })
  vehicle_model?: string;

  @ApiProperty({ example: '1HGCM82633A123456', required: false, description: 'VIN (legacy)' })
  vehicle_vin?: string;

  @ApiProperty({ example: 12000, required: false, description: 'Annual mileage (legacy)' })
  annual_mileage?: number;

  @ApiProperty({ example: 12000, required: false, description: 'Vehicle annual mileage (legacy)' })
  vehicle_annual_mileage?: number;

  @ApiProperty({ example: 'Sedan', required: false, description: 'Body type (legacy)' })
  vehicle_body_type?: string;

  @ApiProperty({ example: 'commute', required: false, description: 'Usage (legacy)' })
  vehicle_usage?: string;

  // Coverage selections (EXPANDED)
  coverage_start_date?: string;  // NEW
  coverage_bodily_injury_limit?: string;  // NEW (renamed from coverage_bodily_injury)
  coverage_property_damage_limit?: string;  // NEW (renamed from coverage_property_damage)
  coverage_has_collision?: boolean;  // NEW
  coverage_collision_deductible?: number;
  coverage_has_comprehensive?: boolean;  // NEW
  coverage_comprehensive_deductible?: number;
  coverage_has_uninsured?: boolean;  // NEW
  coverage_has_roadside?: boolean;  // NEW
  coverage_has_rental?: boolean;  // NEW
  coverage_rental_limit?: number;  // NEW

  // Keep legacy fields for backward compatibility
  coverage_bodily_injury?: string;
  coverage_property_damage?: string;
  include_uninsured_motorist?: boolean;
  include_medical_payments?: boolean;
  include_rental_reimbursement?: boolean;
  include_roadside_assistance?: boolean;
}

@ApiTags('Quotes')
@Controller('api/v1/quotes')
export class QuotesController {
  private readonly logger = new Logger(QuotesController.name);

  constructor(private readonly quoteService: QuoteService) {}

  /**
   * Create a new quote
   *
   * POST /api/v1/quotes
   *
   * @example Request Body:
   * {
   *   "driver": {
   *     "firstName": "Jane",
   *     "lastName": "Smith",
   *     "birthDate": "1990-05-15",
   *     "email": "jane@example.com",
   *     "phone": "555-0100"
   *   },
   *   "address": {
   *     "addressLine1": "123 Main St",
   *     "city": "Los Angeles",
   *     "state": "CA",
   *     "zipCode": "90001"
   *   },
   *   "vehicle": {
   *     "year": 2020,
   *     "make": "Honda",
   *     "model": "Accord",
   *     "vin": "1HGBH41JXMN109186"
   *   }
   * }
   *
   * @example Response:
   * {
   *   "quoteNumber": "Q-20251019-AB12CD",
   *   "policyId": "123e4567-e89b-12d3-a456-426614174000",
   *   "premium": 1300,
   *   "createdAt": "2025-10-19T12:00:00.000Z",
   *   "expiresAt": "2025-11-18T12:00:00.000Z"
   * }
   */
  @Post()
  @ApiOperation({
    summary: 'Create new quote',
    description: 'Create a new auto insurance quote with multi-driver/vehicle support. Returns quote number in DZXXXXXXXX format.'
  })
  @ApiBody({ type: CreateQuoteDTO, description: 'Quote creation data with driver, vehicle, and address information' })
  @ApiResponse({ status: 201, description: 'Quote created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error - invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createQuote(@Body() dto: CreateQuoteDTO): Promise<QuoteResult> {
    try {
      // Determine if using new multi-driver/vehicle format or legacy single format
      const useMultiFormat = dto.drivers && dto.drivers.length > 0;

      let primaryDriver: DriverDTO;
      let additionalDrivers: DriverDTO[] = [];
      let vehicles: VehicleDTO[] = [];

      if (useMultiFormat && dto.drivers) {
        // NEW FORMAT: Arrays of drivers and vehicles
        this.logger.log('Creating new quote (multi-driver/vehicle)', {
          driverCount: dto.drivers.length,
          vehicleCount: dto.vehicles?.length || 0
        });

        // Find primary driver (marked with is_primary: true)
        const foundPrimary = dto.drivers.find(d => d.is_primary) || dto.drivers[0];
        if (!foundPrimary) {
          throw new Error('At least one driver is required');
        }
        primaryDriver = foundPrimary;
        additionalDrivers = dto.drivers.filter(d => !d.is_primary && d !== primaryDriver);
        vehicles = dto.vehicles || [];

      } else {
        // LEGACY FORMAT: Single driver and vehicle (backward compatibility)
        // Validate required legacy fields (phone is optional)
        if (!dto.driver_first_name || !dto.driver_last_name || !dto.driver_birth_date ||
            !dto.driver_email) {
          throw new HttpException('Missing required driver fields', HttpStatus.BAD_REQUEST);
        }

        if (!dto.vehicle_year || !dto.vehicle_make || !dto.vehicle_model) {
          throw new HttpException('Missing required vehicle fields', HttpStatus.BAD_REQUEST);
        }

        this.logger.log('Creating new quote (legacy single driver/vehicle)', {
          driverEmail: dto.driver_email,
          vehicleVin: dto.vehicle_vin
        });

        primaryDriver = {
          first_name: dto.driver_first_name,
          last_name: dto.driver_last_name,
          birth_date: dto.driver_birth_date,
          email: dto.driver_email,
          phone: dto.driver_phone || undefined,
          gender: dto.driver_gender,
          marital_status: dto.driver_marital_status,
          years_licensed: dto.driver_years_licensed,
          is_primary: true,
        };

        vehicles = [{
          year: dto.vehicle_year,
          make: dto.vehicle_make,
          model: dto.vehicle_model,
          vin: dto.vehicle_vin,
          annual_mileage: dto.vehicle_annual_mileage || dto.annual_mileage,
          body_type: dto.vehicle_body_type,
        }];
      }

      // Validate required fields (phone is optional)
      if (!primaryDriver.first_name || !primaryDriver.last_name || !primaryDriver.birth_date ||
          !primaryDriver.email) {
        throw new HttpException('Missing required driver fields', HttpStatus.BAD_REQUEST);
      }

      if (!dto.address_line_1 || !dto.address_city || !dto.address_state || !dto.address_zip) {
        throw new HttpException('Missing required address fields', HttpStatus.BAD_REQUEST);
      }

      // Transform to QuoteService input format
      const input: CreateQuoteInput = {
        driver: {
          firstName: primaryDriver.first_name,
          lastName: primaryDriver.last_name,
          birthDate: typeof primaryDriver.birth_date === 'string'
            ? new Date(primaryDriver.birth_date)
            : primaryDriver.birth_date,
          email: primaryDriver.email,
          phone: primaryDriver.phone,
          gender: primaryDriver.gender,
          maritalStatus: primaryDriver.marital_status,
          yearsLicensed: primaryDriver.years_licensed,
        },
        additionalDrivers: additionalDrivers
          .filter(d => d.first_name && d.last_name && d.birth_date && d.email)
          .map(d => ({
            firstName: d.first_name!,
            lastName: d.last_name!,
            birthDate: typeof d.birth_date === 'string' ? new Date(d.birth_date) : d.birth_date!,
            email: d.email!,
            phone: d.phone,
            gender: d.gender,
            maritalStatus: d.marital_status,
            yearsLicensed: d.years_licensed,
            relationship: d.relationship,
          })),
        address: {
          addressLine1: dto.address_line_1,
          addressLine2: dto.address_line_2,
          city: dto.address_city,
          state: dto.address_state,
          zipCode: dto.address_zip,
        },
        vehicle: vehicles[0] && vehicles[0].year && vehicles[0].make && vehicles[0].model ? {
          year: vehicles[0].year,
          make: vehicles[0].make,
          model: vehicles[0].model,
          vin: vehicles[0].vin || '',
          annualMileage: vehicles[0].annual_mileage,
          bodyType: vehicles[0].body_type,
        } : undefined,
        vehicles: vehicles
          .filter(v => v.year && v.make && v.model)
          .map(v => ({
            year: v.year!,
            make: v.make!,
            model: v.model!,
            vin: v.vin || '',
            annualMileage: v.annual_mileage,
            bodyType: v.body_type,
            primaryDriverId: v.primary_driver_id,
          })),
        coverages: {
          startDate: dto.coverage_start_date,
          bodilyInjuryLimit: dto.coverage_bodily_injury_limit || dto.coverage_bodily_injury,
          propertyDamageLimit: dto.coverage_property_damage_limit || dto.coverage_property_damage,
          collision: dto.coverage_has_collision ?? !!dto.coverage_collision_deductible,
          collisionDeductible: dto.coverage_collision_deductible,
          comprehensive: dto.coverage_has_comprehensive ?? !!dto.coverage_comprehensive_deductible,
          comprehensiveDeductible: dto.coverage_comprehensive_deductible,
          uninsuredMotorist: dto.coverage_has_uninsured ?? dto.include_uninsured_motorist,
          roadsideAssistance: dto.coverage_has_roadside ?? dto.include_roadside_assistance,
          rentalReimbursement: dto.coverage_has_rental ?? dto.include_rental_reimbursement,
          rentalLimit: dto.coverage_rental_limit,
        },
      };

      const result = await this.quoteService.createQuote(input);

      this.logger.log('Quote created successfully', {
        quoteId: result.quoteId,
        quoteNumber: result.quoteNumber
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to create quote', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to create quote',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get quote by quote number (human-readable ID)
   *
   * GET /api/v1/quotes/:id
   *
   * @example Response:
   * {
   *   "policy_identifier": "123e4567-e89b-12d3-a456-426614174000",
   *   "policy_number": "QA1B2C",
   *   "status_code": "QUOTED",
   *   "effective_date": "2025-10-19",
   *   "expiration_date": "2026-10-19"
   * }
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get quote by ID',
    description: 'Retrieve a quote by its UUID or quote number (DZXXXXXXXX format)'
  })
  @ApiParam({ name: 'id', description: 'Quote UUID or quote number (DZXXXXXXXX)', example: 'DZQV87Z4FH' })
  @ApiResponse({ status: 200, description: 'Quote retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getQuote(@Param('id') id: string) {
    try {
      this.logger.debug('Fetching quote by number', { quoteNumber: id });
      return await this.quoteService.getQuote(id);
    } catch (error) {
      this.logger.error('Failed to retrieve quote', error);

      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Quote ${id} not found`,
          },
          HttpStatus.NOT_FOUND
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to retrieve quote',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get quote by quote number
   *
   * GET /api/v1/quotes/reference/:quoteNumber
   *
   * @example Response:
   * {
   *   "policy_identifier": "123e4567-e89b-12d3-a456-426614174000",
   *   "policy_number": "QA1B2C",
   *   "status_code": "QUOTED",
   *   "effective_date": "2025-10-19",
   *   "expiration_date": "2026-10-19"
   * }
   */
  @Get('reference/:quoteNumber')
  @ApiOperation({
    summary: 'Get quote by reference number',
    description: 'Retrieve a quote using its human-readable quote number (DZXXXXXXXX format)'
  })
  @ApiParam({ name: 'quoteNumber', description: 'Quote number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiResponse({ status: 200, description: 'Quote retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getQuoteByNumber(@Param('quoteNumber') quoteNumber: string) {
    try {
      this.logger.debug('Fetching quote by number', { quoteNumber });
      return await this.quoteService.getQuoteByNumber(quoteNumber);
    } catch (error) {
      this.logger.error('Failed to retrieve quote', error);

      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Quote ${quoteNumber} not found`,
          },
          HttpStatus.NOT_FOUND
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to retrieve quote',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * PUT /api/v1/quotes/:quoteNumber/primary-driver
   * Update primary driver information for an existing quote
   */
  @Put(':quoteNumber/primary-driver')
  @ApiOperation({
    summary: 'Update primary driver',
    description: 'Update the primary driver information for an existing quote'
  })
  @ApiParam({ name: 'quoteNumber', description: 'Quote number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiBody({ type: UpdatePrimaryDriverDTO, description: 'Updated driver information' })
  @ApiResponse({ status: 200, description: 'Primary driver updated successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updatePrimaryDriver(
    @Param('quoteNumber') quoteNumber: string,
    @Body() dto: UpdatePrimaryDriverDTO
  ): Promise<QuoteResult> {
    this.logger.log('Updating primary driver for quote', { quoteNumber });

    try {
      const result = await this.quoteService.updatePrimaryDriver(
        quoteNumber,
        {
          firstName: dto.driver_first_name,
          lastName: dto.driver_last_name,
          birthDate: new Date(dto.driver_birth_date),
          email: dto.driver_email,
          phone: dto.driver_phone,
          gender: dto.driver_gender,
          maritalStatus: dto.driver_marital_status,
          licenseNumber: dto.driver_license_number,
          licenseState: dto.driver_license_state,
        },
        {
          addressLine1: dto.address_line_1,
          addressLine2: dto.address_line_2,
          city: dto.address_city,
          state: dto.address_state,
          zipCode: dto.address_zip,
        }
      );

      this.logger.log('Primary driver updated successfully', { quoteNumber });
      return result;
    } catch (error) {
      this.logger.error('Failed to update primary driver', error);

      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Quote ${quoteNumber} not found`,
          },
          HttpStatus.NOT_FOUND
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to update primary driver',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * PUT /api/v1/quotes/:quoteNumber/drivers
   * Update additional drivers for an existing quote
   */
  @Put(':quoteNumber/drivers')
  @ApiOperation({
    summary: 'Update additional drivers',
    description: 'Update the list of additional drivers for an existing quote (multi-driver support)'
  })
  @ApiParam({ name: 'quoteNumber', description: 'Quote number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiBody({ type: UpdateDriversDTO, description: 'Additional drivers information' })
  @ApiResponse({ status: 200, description: 'Drivers updated successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateDrivers(
    @Param('quoteNumber') quoteNumber: string,
    @Body() dto: UpdateDriversDTO
  ): Promise<QuoteResult> {
    this.logger.log('Updating drivers for quote', { quoteNumber, driverCount: dto.additionalDrivers.length });

    try {
      // Transform DTO to service input format
      const additionalDrivers = dto.additionalDrivers.map(d => ({
        firstName: d.first_name,
        lastName: d.last_name,
        birthDate: new Date(d.birth_date),
        email: d.email,
        phone: d.phone,
        gender: d.gender,
        maritalStatus: d.marital_status,
        yearsLicensed: d.years_licensed,
        relationship: d.relationship,
        licenseNumber: d.license_number,
        licenseState: d.license_state,
      }));

      const result = await this.quoteService.updateQuoteDrivers(
        quoteNumber,
        additionalDrivers
      );

      this.logger.log('Drivers updated successfully', { quoteNumber });
      return result;
    } catch (error) {
      this.logger.error('Failed to update drivers', error);

      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Quote ${quoteNumber} not found`,
          },
          HttpStatus.NOT_FOUND
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to update drivers',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * PUT /api/v1/quotes/:quoteNumber/vehicles
   * Update vehicles for an existing quote
   */
  @Put(':quoteNumber/vehicles')
  @ApiOperation({
    summary: 'Update vehicles',
    description: 'Update the list of vehicles for an existing quote (multi-vehicle support)'
  })
  @ApiParam({ name: 'quoteNumber', description: 'Quote number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiBody({ type: UpdateVehiclesDTO, description: 'Vehicles information' })
  @ApiResponse({ status: 200, description: 'Vehicles updated successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateVehicles(
    @Param('quoteNumber') quoteNumber: string,
    @Body() dto: UpdateVehiclesDTO
  ): Promise<QuoteResult> {
    this.logger.log('Updating vehicles for quote', { quoteNumber, vehicleCount: dto.vehicles.length });

    try {
      // Transform DTO to service input format
      const vehicles = dto.vehicles.map(v => ({
        year: v.year,
        make: v.make,
        model: v.model,
        vin: v.vin || '',  // Provide default empty string
        bodyType: v.body_type,
        annualMileage: v.annual_mileage,
        primaryDriverId: v.primary_driver_id,
      }));

      const result = await this.quoteService.updateQuoteVehicles(
        quoteNumber,
        vehicles
      );

      this.logger.log('Vehicles updated successfully', { quoteNumber });
      return result;
    } catch (error) {
      this.logger.error('Failed to update vehicles', error);

      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Quote ${quoteNumber} not found`,
          },
          HttpStatus.NOT_FOUND
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to update vehicles',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * PUT /api/v1/quotes/:quoteNumber/coverage
   * Update coverage selections and finalize quote (status: INCOMPLETE → QUOTED)
   */
  @Put(':quoteNumber/coverage')
  @ApiOperation({
    summary: 'Update coverage selections',
    description: 'Update coverage options for a quote and finalize it (transitions status from INCOMPLETE → QUOTED)'
  })
  @ApiParam({ name: 'quoteNumber', description: 'Quote number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiBody({ type: UpdateCoverageDTO, description: 'Coverage selections including liability limits, deductibles, and optional coverages' })
  @ApiResponse({ status: 200, description: 'Coverage updated and quote finalized successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateCoverage(
    @Param('quoteNumber') quoteNumber: string,
    @Body() dto: UpdateCoverageDTO
  ): Promise<QuoteResult> {
    this.logger.log('Updating coverage for quote', { quoteNumber });
    this.logger.debug('Received DTO', {
      dto,
      vehicle_coverages: dto.vehicle_coverages,
      medical_payments_limit: dto.coverage_medical_payments_limit,
      has_medical_field: 'coverage_medical_payments_limit' in dto
    });

    try {
      // Transform DTO to service input format
      const coverages = {
        startDate: dto.coverage_start_date,
        bodilyInjuryLimit: dto.coverage_bodily_injury_limit,
        propertyDamageLimit: dto.coverage_property_damage_limit,
        medicalPaymentsLimit: dto.coverage_medical_payments_limit,
        collision: dto.coverage_collision,
        collisionDeductible: dto.coverage_collision_deductible,
        comprehensive: dto.coverage_comprehensive,
        comprehensiveDeductible: dto.coverage_comprehensive_deductible,
        uninsuredMotorist: dto.coverage_uninsured_motorist,
        roadsideAssistance: dto.coverage_roadside_assistance,
        rentalReimbursement: dto.coverage_rental_reimbursement,
        rentalLimit: dto.coverage_rental_limit,
        vehicleCoverages: dto.vehicle_coverages,
      };

      const result = await this.quoteService.updateQuoteCoverage(
        quoteNumber,
        coverages
      );

      this.logger.log('Coverage updated and quote finalized', { quoteNumber, status: 'QUOTED' });
      return result;
    } catch (error) {
      this.logger.error('Failed to update coverage', error);

      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Quote ${quoteNumber} not found`,
          },
          HttpStatus.NOT_FOUND
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to update coverage',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
