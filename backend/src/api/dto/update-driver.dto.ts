/**
 * Update Driver DTOs
 */

import { IsEmail, IsString, IsInt, Min, IsArray, ValidateNested, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePrimaryDriverDto {
  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '1990-01-15', description: 'Date of birth' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '555-123-4567', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class DriverUpdateDto {
  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1990-01-15', description: 'Date of birth' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male', description: 'Gender' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: 'D1234567', description: 'Driver license number' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiPropertyOptional({ example: '555-123-4567', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 0, description: 'Accidents in last 3 years' })
  @IsInt()
  @IsOptional()
  @Min(0)
  accidentsLast3Years?: number;

  @ApiPropertyOptional({ example: 0, description: 'Violations in last 3 years' })
  @IsInt()
  @IsOptional()
  @Min(0)
  violationsLast3Years?: number;
}

export class UpdateDriversDto {
  @ApiProperty({ type: () => [DriverUpdateDto], description: 'List of additional drivers' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DriverUpdateDto)
  additionalDrivers: DriverUpdateDto[];
}

export class UpdateVehiclesDto {
  @ApiProperty({ type: () => [Object], description: 'List of vehicles' })
  @IsArray()
  vehicles: any[]; // Using any for simplicity, should match VehicleDto from create-quote
}
