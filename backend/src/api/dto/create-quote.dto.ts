/**
 * Create Quote DTO
 *
 * Validation schema for quote creation with multi-driver/vehicle support
 */

import { IsEmail, IsNotEmpty, IsOptional, IsString, IsInt, Min, Max, IsArray, ValidateNested, IsDateString, Length, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehicleDto {
  @ApiProperty({ example: '1HGCM82633A123456', description: 'Vehicle Identification Number (17 characters)' })
  @IsString()
  @Length(17, 17, { message: 'VIN must be exactly 17 characters' })
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/i, { message: 'VIN contains invalid characters (I, O, Q not allowed)' })
  vin: string;

  @ApiProperty({ example: 2020, description: 'Vehicle year' })
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({ example: 'Honda', description: 'Vehicle make' })
  @IsString()
  @IsNotEmpty()
  make: string;

  @ApiProperty({ example: 'Accord', description: 'Vehicle model' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiPropertyOptional({ example: 'Sedan', description: 'Body type' })
  @IsString()
  @IsOptional()
  bodyType?: string;

  @ApiPropertyOptional({ example: 25000, description: 'Estimated market value in USD' })
  @IsInt()
  @IsOptional()
  @Min(0)
  marketValue?: number;
}

export class DriverDto {
  @ApiProperty({ example: 'John', description: 'Driver first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Driver last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1990-01-15', description: 'Date of birth (ISO 8601 format)' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male', description: 'Gender', enum: ['Male', 'Female', 'Other'] })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: 'D1234567', description: 'Driver license number' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiPropertyOptional({ example: '555-123-4567', description: 'Phone number (optional)' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 0, description: 'Number of accidents in last 3 years' })
  @IsInt()
  @IsOptional()
  @Min(0)
  accidentsLast3Years?: number;

  @ApiPropertyOptional({ example: 0, description: 'Number of violations in last 3 years' })
  @IsInt()
  @IsOptional()
  @Min(0)
  violationsLast3Years?: number;
}

export class CoverageSelectionDto {
  @ApiProperty({ example: '100000/300000/100000', description: 'Liability limits (per person/per accident/property damage)' })
  @IsString()
  @IsNotEmpty()
  liabilityLimits: string;

  @ApiPropertyOptional({ example: 500, description: 'Collision deductible in USD' })
  @IsInt()
  @IsOptional()
  @Min(0)
  collisionDeductible?: number;

  @ApiPropertyOptional({ example: 500, description: 'Comprehensive deductible in USD' })
  @IsInt()
  @IsOptional()
  @Min(0)
  comprehensiveDeductible?: number;

  @ApiPropertyOptional({ example: true, description: 'Include uninsured motorist coverage' })
  @IsOptional()
  uninsuredMotorist?: boolean;
}

export class CreateQuoteDto {
  @ApiProperty({ type: () => DriverDto, description: 'Primary driver information' })
  @ValidateNested()
  @Type(() => DriverDto)
  primaryDriver: DriverDto;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Contact email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ type: () => [VehicleDto], description: 'List of vehicles to insure' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleDto)
  vehicles: VehicleDto[];

  @ApiPropertyOptional({ type: () => [DriverDto], description: 'Additional drivers (optional)' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DriverDto)
  additionalDrivers?: DriverDto[];

  @ApiPropertyOptional({ type: () => CoverageSelectionDto, description: 'Coverage selections (optional, defaults applied)' })
  @ValidateNested()
  @IsOptional()
  @Type(() => CoverageSelectionDto)
  coverage?: CoverageSelectionDto;

  @ApiProperty({ example: '12345', description: 'ZIP code for rating purposes' })
  @IsString()
  @Matches(/^\d{5}(-\d{4})?$/, { message: 'Invalid ZIP code format (must be 12345 or 12345-6789)' })
  zipCode: string;
}
