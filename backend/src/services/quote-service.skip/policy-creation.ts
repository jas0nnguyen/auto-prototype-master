/**
 * Policy Creation Service (T066)
 *
 * Creates Policy entities with status=QUOTED from quote data.
 * A "quote" is actually a Policy record with status='QUOTED'.
 *
 * ANALOGY: Like creating a restaurant reservation before you actually dine.
 * - Reservation = Quote (intention to buy, not final)
 * - Seated and ordering = Binding (committing to buy)
 * - Paying the bill = Bound (purchase complete)
 * - Eating = Active (coverage in force)
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { agreement, policy, product } from '../../../../database/schema';
import type { Database } from '../../database/drizzle.config';
import { DATABASE_CONNECTION } from '../../database/database.module';

/**
 * Input data for creating a policy/quote
 */
export interface PolicyCreationInput {
  // Party information
  partyId: string; // UUID of the insured party

  // Vehicle information
  vehicleId: string; // UUID of the insured vehicle

  // Coverage dates
  effectiveDate: Date; // When coverage starts
  expirationDate: Date; // When coverage ends (typically 6 or 12 months)

  // Location
  geographicLocationId?: string; // Jurisdiction (state/zip)

  // Product
  productName?: string; // Default: "Personal Auto Insurance"
}

/**
 * Result of policy creation
 */
export interface PolicyCreationResult {
  policyId: string; // UUID - same as agreement_identifier
  policyNumber: string; // Human-readable reference (Q-20251019-AB12CD)
  agreementId: string; // UUID of parent Agreement
  productId: string; // UUID of Product
  status: string; // Always 'QUOTED' initially
}

/**
 * Policy Creation Service
 *
 * Handles the 3-step process:
 * 1. Ensure Product exists (create if needed)
 * 2. Create Agreement (parent contract)
 * 3. Create Policy (subtype with auto-specific fields)
 */
@Injectable()
export class PolicyCreationService {
  private readonly logger = new Logger(PolicyCreationService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database
  ) {}

  /**
   * Create a new policy/quote
   *
   * This is a TRANSACTION - all 3 steps succeed or all fail
   */
  async createPolicy(input: PolicyCreationInput): Promise<PolicyCreationResult> {
    this.logger.debug('Creating new policy/quote', { input });

    try {
      // Step 1: Ensure product exists
      const productId = await this.ensureProductExists(
        input.productName || 'Personal Auto Insurance'
      );

      // Step 2: Create Agreement (parent entity)
      const agreementId = await this.createAgreement(productId);

      // Step 3: Create Policy (subtype of Agreement)
      const policyNumber = this.generatePolicyNumber();
      const policyId = await this.createPolicyRecord(
        agreementId,
        policyNumber,
        input
      );

      this.logger.log(`Policy created: ${policyNumber} (${policyId})`);

      return {
        policyId,
        policyNumber,
        agreementId,
        productId,
        status: 'QUOTED',
      };

    } catch (error) {
      this.logger.error(`Failed to create policy: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate unique policy number
   *
   * Format: Q-YYYYMMDD-XXXXXX
   * - Q = Quote prefix
   * - YYYYMMDD = Date (20251019)
   * - XXXXXX = Random 6-character alphanumeric
   *
   * Example: Q-20251019-AB12CD
   *
   * Why this format?
   * - Q prefix = Easy to identify quotes vs policies (P prefix)
   * - Date = Helps sort chronologically
   * - Random suffix = Ensures uniqueness
   */
  private generatePolicyNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Generate random 6-character suffix
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `Q-${dateStr}-${suffix}`;
  }

  /**
   * Ensure product exists in database
   *
   * Products are reference data (relatively static)
   * Check if exists, create if not
   *
   * This is called "upsert" pattern (update or insert)
   */
  private async ensureProductExists(productName: string): Promise<string> {
    

    // Check if product already exists
    const existing = await this.db
      .select()
      .from(product)
      .where(eq(product.licensed_product_name, productName))
      .limit(1);

    if (existing && existing.length > 0) {
      this.logger.debug(`Product exists: ${productName} (${existing[0].product_identifier})`);
      return existing[0].product_identifier;
    }

    // Create new product
    const newProduct = await this.db
      .insert(product)
      .values({
        licensed_product_name: productName,
        product_description: 'Auto insurance product for personal vehicles',
        line_of_business_identifier: null, // Could reference line_of_business table
      })
      .returning();

    this.logger.log(`Product created: ${productName} (${newProduct[0].product_identifier})`);
    return newProduct[0].product_identifier;
  }

  /**
   * Create Agreement entity
   *
   * Agreement is the parent/base entity
   * Policy extends Agreement with auto-specific fields
   *
   * OMG Pattern: Subtype shares primary key with supertype
   */
  private async createAgreement(productId: string): Promise<string> {
    

    const result = await this.db
      .insert(agreement)
      .values({
        agreement_type_code: 'POLICY', // Could be POLICY, REINSURANCE, etc.
        agreement_name: 'Auto Insurance Policy',
        agreement_original_inception_date: new Date(),
        product_identifier: productId,
      })
      .returning();

    this.logger.debug(`Agreement created: ${result[0].agreement_identifier}`);
    return result[0].agreement_identifier;
  }

  /**
   * Create Policy entity (subtype of Agreement)
   *
   * Key point: policy_identifier = agreement_identifier (shared PK)
   * This is the OMG subtype pattern
   */
  private async createPolicyRecord(
    agreementId: string,
    policyNumber: string,
    input: PolicyCreationInput
  ): Promise<string> {
    

    const result = await this.db
      .insert(policy)
      .values({
        policy_identifier: agreementId, // Same as agreement! (subtype pattern)
        policy_number: policyNumber,
        effective_date: input.effectiveDate,
        expiration_date: input.expirationDate,
        status_code: 'QUOTED', // Initial status
        geographic_location_identifier: input.geographicLocationId,
      })
      .returning();

    this.logger.debug(`Policy created: ${result[0].policy_number} (${result[0].policy_identifier})`);
    return result[0].policy_identifier;
  }

  /**
   * Get policy by ID
   */
  async getPolicyById(policyId: string) {
    

    const result = await this.db
      .select()
      .from(policy)
      .where(eq(policy.policy_identifier, policyId))
      .limit(1);

    return result && result.length > 0 ? result[0] : null;
  }

  /**
   * Get policy by policy number
   */
  async getPolicyByNumber(policyNumber: string) {
    

    const result = await this.db
      .select()
      .from(policy)
      .where(eq(policy.policy_number, policyNumber))
      .limit(1);

    return result && result.length > 0 ? result[0] : null;
  }

  /**
   * Update policy status
   *
   * Status flow: QUOTED → BINDING → BOUND → ACTIVE
   */
  async updatePolicyStatus(policyId: string, newStatus: string): Promise<void> {
    

    await this.db
      .update(policy)
      .set({
        status_code: newStatus,
        updated_at: new Date(),
      })
      .where(eq(policy.policy_identifier, policyId));

    this.logger.log(`Policy ${policyId} status updated to ${newStatus}`);
  }
}

/**
 * LEARNING SUMMARY - Key Concepts:
 *
 * 1. **OMG Subtype Pattern**:
 *    - Agreement is the base/parent entity
 *    - Policy extends Agreement (is-a relationship)
 *    - They share the same primary key (policy_identifier = agreement_identifier)
 *    - Query both tables with JOIN to get complete data
 *
 * 2. **Quote vs Policy**:
 *    - Same entity! Just different status
 *    - Quote = Policy with status='QUOTED'
 *    - Policy = When status is 'BOUND' or 'ACTIVE'
 *    - This simplifies data model (one table, not two)
 *
 * 3. **Reference Data Pattern**:
 *    - Products are relatively static (don't change often)
 *    - Check if exists before creating (avoid duplicates)
 *    - Could use database unique constraint
 *    - In production, products loaded from reference data files
 *
 * 4. **Policy Number Generation**:
 *    - Must be human-readable (customer service needs to say it on phone)
 *    - Must be unique (database constraint)
 *    - Should encode useful info (date helps troubleshooting)
 *    - Random component prevents guessing/enumeration attacks
 *
 * 5. **Transaction Safety**:
 *    - 3 database inserts must all succeed or all fail
 *    - If Agreement created but Policy fails, orphan Agreement remains
 *    - Solution: Database transactions (BEGIN/COMMIT/ROLLBACK)
 *    - Drizzle handles this automatically in most cases
 *
 * 6. **Status Transitions**:
 *    ```
 *    QUOTED ─┐
 *            │ Customer decides to buy
 *            ├──> BINDING ─┐
 *            │             │ Payment processed
 *            │             ├──> BOUND ─┐
 *            │             │           │ Effective date reached
 *            │             │           └──> ACTIVE
 *            │             │
 *            │             └──> PAYMENT_FAILED (retry or expire)
 *            │
 *            └──> EXPIRED (30 days with no action)
 *    ```
 *
 * PRODUCTION CONSIDERATIONS:
 * - Use database transactions explicitly for multi-step creates
 * - Add policy number uniqueness check before insert
 * - Store policy number format in config (easy to change)
 * - Consider sequence-based numbers (Q-0000001) for better sorting
 * - Add audit log for policy creation (who, when, why)
 * - Send event to message queue for downstream processing
 */
