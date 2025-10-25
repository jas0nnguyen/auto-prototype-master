/**
 * Bind Policy DTO
 */

import { IsString, IsNotEmpty, IsDateString, IsOptional, Matches, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentMethodDto {
  @ApiProperty({ example: 'credit_card', description: 'Payment method type', enum: ['credit_card', 'bank_account'] })
  @IsString()
  @IsNotEmpty()
  type: 'credit_card' | 'bank_account';

  @ApiProperty({ example: '4111111111111111', description: 'Card number (16 digits) or bank account number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, { message: 'Invalid card/account number (must be 13-19 digits)' })
  number: string;

  @ApiPropertyOptional({ example: '12/25', description: 'Card expiration date (MM/YY) - required for credit cards' })
  @IsString()
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Invalid expiration date format (use MM/YY)' })
  expirationDate?: string;

  @ApiPropertyOptional({ example: '123', description: 'Card CVV (3-4 digits) - required for credit cards' })
  @IsString()
  @IsOptional()
  @Length(3, 4)
  @Matches(/^\d{3,4}$/, { message: 'CVV must be 3-4 digits' })
  cvv?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Cardholder name' })
  @IsString()
  @IsOptional()
  cardholderName?: string;

  @ApiPropertyOptional({ example: '123456789', description: 'Bank routing number (9 digits) - required for bank accounts' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{9}$/, { message: 'Routing number must be 9 digits' })
  routingNumber?: string;
}

export class BindPolicyDto {
  @ApiProperty({ example: 'DZXXXXXXXX', description: 'Quote number to bind' })
  @IsString()
  @IsNotEmpty()
  quoteNumber: string;

  @ApiProperty({ type: () => PaymentMethodDto, description: 'Payment information' })
  @IsNotEmpty()
  paymentMethod: PaymentMethodDto;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Desired policy effective date (ISO format)' })
  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @ApiPropertyOptional({ example: true, description: 'Acknowledge terms and conditions' })
  @IsOptional()
  termsAccepted?: boolean;
}
