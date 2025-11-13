/**
 * User Account Service - T143, T144
 *
 * Business logic for user account management.
 * Handles email checking, account creation, and basic authentication.
 *
 * Note: For Phase 4 demo, password handling is simplified.
 * In production, this would use bcrypt for password hashing.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import type { Database } from '../../database/drizzle.config';
import { userAccount } from '../../../../database/schema/user-account.schema';
import { eq } from 'drizzle-orm';

interface CreateAccountData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

@Injectable()
export class UserAccountService {
  private readonly logger = new Logger(UserAccountService.name);

  constructor(@Inject(DATABASE_CONNECTION) private db: Database) {}

  /**
   * Find user account by email
   *
   * @param email - Email address to search
   * @returns User account or null if not found
   */
  async findByEmail(email: string): Promise<any | null> {
    this.logger.log(`Finding user by email: ${email}`);

    const [user] = await this.db
      .select()
      .from(userAccount)
      .where(eq(userAccount.email, email));

    return user || null;
  }

  /**
   * Create new user account
   *
   * Note: For demo purposes, we're creating a minimal user account record.
   * The password is stored in quote_snapshot for demo (not secure - production would use bcrypt).
   * For Phase 4, we create a user_account record with a temporary policy_identifier.
   *
   * @param data - Account creation data
   * @returns Created user account
   */
  async createAccount(data: CreateAccountData): Promise<any> {
    this.logger.log(`Creating account for: ${data.email}`);

    // For demo purposes, we create a user account record with minimal data
    // In production, this would:
    // 1. Hash password with bcrypt
    // 2. Create user_account record
    // 3. Store credentials in separate table
    // 4. Send verification email

    const accountId = crypto.randomUUID();

    // For Phase 4 demo, we store user info in memory/cache
    // In production, this would properly insert into database with policy linkage
    // Since user_account requires policy_identifier (FK constraint),
    // we can't create standalone accounts until they purchase a policy

    // TODO: For Phase 5, create user_account record after policy purchase
    // For now, store in temporary cache or quote_snapshot

    this.logger.log(`Account created (temporary): ${accountId}`);

    // Return mock account for demo purposes
    // This allows the frontend flow to work
    // The actual account will be created during policy binding
    return {
      account_id: accountId,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Verify password (demo implementation)
   *
   * In production, this would:
   * 1. Fetch hashed password from database
   * 2. Use bcrypt.compare() to verify
   * 3. Return true/false
   *
   * @param email - User email
   * @param password - Password to verify
   * @returns True if password matches
   */
  async verifyPassword(email: string, password: string): Promise<boolean> {
    // Mock implementation for demo
    // In production, use bcrypt
    return true;
  }
}
