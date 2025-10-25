/**
 * File Claim DTO
 */

import { IsString, IsNotEmpty, IsDateString, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileClaimDto {
  @ApiProperty({ example: 'DZXXXXXXXX', description: 'Policy number' })
  @IsString()
  @IsNotEmpty()
  policyNumber: string;

  @ApiProperty({ example: '2025-01-15', description: 'Date of incident (ISO format)' })
  @IsDateString()
  incidentDate: string;

  @ApiProperty({ example: '123 Main St, City, ST 12345', description: 'Location of incident' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  incidentLocation: string;

  @ApiProperty({ example: 'Rear-end collision at intersection', description: 'Description of what happened' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  incidentDescription: string;

  @ApiPropertyOptional({ example: 'collision', description: 'Type of claim', enum: ['collision', 'comprehensive', 'liability', 'uninsured_motorist'] })
  @IsString()
  @IsOptional()
  claimType?: string;

  @ApiPropertyOptional({ example: ['photo1.jpg', 'photo2.jpg'], description: 'List of attachment file names' })
  @IsArray()
  @IsOptional()
  attachments?: string[];

  @ApiPropertyOptional({ example: 5000, description: 'Estimated damage amount in USD' })
  @IsOptional()
  estimatedAmount?: number;

  @ApiPropertyOptional({ example: 'John Doe involved', description: 'Other parties involved (if any)' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  otherPartiesInvolved?: string;

  @ApiPropertyOptional({ example: true, description: 'Was police report filed?' })
  @IsOptional()
  policeReportFiled?: boolean;

  @ApiPropertyOptional({ example: 'PR-2025-12345', description: 'Police report number (if applicable)' })
  @IsString()
  @IsOptional()
  policeReportNumber?: string;
}
