/**
 * User Accounts Controller - T143, T144
 *
 * REST API endpoints for user account management during checkout.
 *
 * Endpoints:
 * - POST /api/v1/user-accounts/check-email - Check if email exists
 * - POST /api/v1/user-accounts - Create new user account
 *
 * Note: For Phase 4, we're implementing basic email checking and account creation.
 * Password handling is simplified for demo purposes (stored in quote_snapshot).
 * In production, this would use proper authentication with bcrypt hashing.
 */

import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserAccountService } from '../../services/user-account-service/user-account.service';

/**
 * DTO for checking email existence
 */
class CheckEmailDTO {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to check',
  })
  @IsEmail()
  email!: string;
}

/**
 * DTO for creating user account
 */
class CreateUserAccountDTO {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address (must be unique)',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'SecurePass123',
    description: 'Password (minimum 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  @IsString()
  first_name!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
  })
  @IsString()
  last_name!: string;
}

/**
 * User Accounts Controller
 */
@ApiTags('User Accounts')
@Controller('api/v1/user-accounts')
export class UserAccountsController {
  private readonly logger = new Logger(UserAccountsController.name);

  constructor(private readonly userAccountService: UserAccountService) {}

  /**
   * T143: Check if email exists
   *
   * POST /api/v1/user-accounts/check-email
   *
   * Checks if a user account with the given email already exists.
   * Used by Checkout screen to determine if AccountCreationModal should open.
   *
   * @example Request Body:
   * {
   *   "email": "user@example.com"
   * }
   *
   * @example Success Response (200):
   * {
   *   "exists": true,
   *   "user_id": "550e8400-e29b-41d4-a716-446655440000"
   * }
   *
   * @example Success Response (200) - Email not found:
   * {
   *   "exists": false,
   *   "user_id": null
   * }
   */
  @Post('check-email')
  @ApiOperation({ summary: 'Check if email exists' })
  @ApiResponse({
    status: 200,
    description: 'Email check completed',
    schema: {
      example: {
        exists: true,
        user_id: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email format',
  })
  async checkEmail(@Body() dto: CheckEmailDTO) {
    this.logger.log(`Checking email: ${dto.email}`);

    try {
      const user = await this.userAccountService.findByEmail(dto.email);

      if (user) {
        return {
          exists: true,
          user_id: user.account_id,
        };
      }

      return {
        exists: false,
        user_id: null,
      };
    } catch (error) {
      this.logger.error(`Failed to check email: ${error.message}`);
      throw new HttpException(
        'Failed to check email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * T144: Create user account
   *
   * POST /api/v1/user-accounts
   *
   * Creates a new user account with email and password.
   * Used by AccountCreationModal during checkout for new users.
   *
   * Note: For demo purposes, password is stored in quote_snapshot.
   * In production, this would hash password with bcrypt and store in user_account table.
   *
   * @example Request Body:
   * {
   *   "email": "newuser@example.com",
   *   "password": "SecurePass123",
   *   "first_name": "John",
   *   "last_name": "Doe"
   * }
   *
   * @example Success Response (201):
   * {
   *   "status": "success",
   *   "data": {
   *     "user_account_id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "newuser@example.com"
   *   }
   * }
   *
   * @example Error Response (409) - Duplicate email:
   * {
   *   "statusCode": 409,
   *   "message": "Email already registered"
   * }
   */
  @Post()
  @ApiOperation({ summary: 'Create user account' })
  @ApiResponse({
    status: 201,
    description: 'User account created successfully',
    schema: {
      example: {
        status: 'success',
        data: {
          user_account_id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'newuser@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
  })
  async createAccount(@Body() dto: CreateUserAccountDTO) {
    this.logger.log(`Creating account for: ${dto.email}`);

    try {
      // Check if email already exists
      const existingUser = await this.userAccountService.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // Validate password strength (basic validation)
      if (dto.password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters');
      }

      // Create user account
      const userAccount = await this.userAccountService.createAccount({
        email: dto.email,
        password: dto.password,
        first_name: dto.first_name,
        last_name: dto.last_name,
      });

      return {
        status: 'success',
        data: {
          user_account_id: userAccount.account_id,
          email: userAccount.email,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Failed to create account: ${error.message}`);
      throw new HttpException(
        'Failed to create account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
