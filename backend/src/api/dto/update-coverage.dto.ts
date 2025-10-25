/**
 * Update Coverage DTO
 */

import { IsString, IsInt, Min, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCoverageDto {
  @ApiProperty({ example: '100000/300000/100000', description: 'Liability limits' })
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

  @ApiPropertyOptional({ example: true, description: 'Include underinsured motorist coverage' })
  @IsOptional()
  underinsuredMotorist?: boolean;

  @ApiPropertyOptional({ example: 5000, description: 'Medical payments coverage limit' })
  @IsInt()
  @IsOptional()
  @Min(0)
  medicalPayments?: number;

  @ApiPropertyOptional({ example: true, description: 'Include roadside assistance' })
  @IsOptional()
  roadsideAssistance?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Include rental car reimbursement' })
  @IsOptional()
  rentalReimbursement?: boolean;
}
