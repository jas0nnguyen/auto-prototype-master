/**
 * Coverage Assignment Service (T067)
 *
 * Assigns coverage selections to a policy, creating the linkage between
 * Policy, Coverage, and Insurable Object (Vehicle).
 *
 * ANALOGY: Like building a pizza order at Domino's.
 * - Policy = The order
 * - Vehicle = Who's eating (links to the order)
 * - Coverage = Toppings selected
 * - Limits = Size (small/medium/large)
 * - Deductibles = How much you pay before insurance kicks in
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { coverage, policyCoverageDetail, policyLimit, policyDeductible } from '../../../../database/schema';
import type { Database } from '../../database/drizzle.config';
import { DATABASE_CONNECTION } from '../../database/database.module';

/**
 * Coverage selection from user
 */
export interface CoverageSelection {
  coverageCode: string; // 'BODILY_INJURY', 'COLLISION', etc.

  // Limits (optional, depending on coverage type)
  limits?: {
    perPerson?: number; // Bodily Injury: $100,000 per person
    perAccident?: number; // Bodily Injury: $300,000 per accident
    perOccurrence?: number; // Property Damage: $100,000 per occurrence
  };

  // Deductible (optional, for physical damage coverages)
  deductible?: number; // $500, $1000, etc.

  // Is this coverage selected? (optional coverages can be declined)
  isSelected: boolean;
}

/**
 * Input for coverage assignment
 */
export interface CoverageAssignmentInput {
  policyId: string; // Policy to assign coverages to
  vehicleId: string; // Vehicle being insured
  effectiveDate: Date; // Coverage start date
  expirationDate: Date; // Coverage end date
  coverages: CoverageSelection[]; // List of selected coverages
}

/**
 * Result of coverage assignment
 */
export interface CoverageAssignmentResult {
  policyCoverageDetailIds: string[]; // Created detail records
  policyLimitIds: string[]; // Created limit records
  policyDeductibleIds: string[]; // Created deductible records
  totalCoverages: number;
}

/**
 * Coverage Assignment Service
 *
 * Creates the complex web of relationships:
 * Policy ←→ Coverage ←→ Vehicle ←→ Limits ←→ Deductibles
 */
@Injectable()
export class CoverageAssignmentService {
  private readonly logger = new Logger(CoverageAssignmentService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database
  ) {}

  /**
   * Assign coverages to a policy
   *
   * This is a multi-step process:
   * 1. Validate coverages exist in system
   * 2. Create PolicyCoverageDetail records (links Policy + Coverage + Vehicle)
   * 3. Create PolicyLimit records (defines coverage limits)
   * 4. Create PolicyDeductible records (defines deductibles)
   */
  async assignCoverages(input: CoverageAssignmentInput): Promise<CoverageAssignmentResult> {
    this.logger.debug('Assigning coverages to policy', {
      policyId: input.policyId,
      vehicleId: input.vehicleId,
      coverageCount: input.coverages.length,
    });

    const result: CoverageAssignmentResult = {
      policyCoverageDetailIds: [],
      policyLimitIds: [],
      policyDeductibleIds: [],
      totalCoverages: 0,
    };

    try {
      // Process each coverage selection
      for (const selection of input.coverages) {
        if (!selection.isSelected) {
          this.logger.debug(`Skipping unselected coverage: ${selection.coverageCode}`);
          continue;
        }

        await this.assignSingleCoverage(input, selection, result);
      }

      this.logger.log(
        `Assigned ${result.totalCoverages} coverages to policy ${input.policyId}`
      );

      return result;

    } catch (error) {
      this.logger.error(`Coverage assignment failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Assign a single coverage to the policy
   */
  private async assignSingleCoverage(
    input: CoverageAssignmentInput,
    selection: CoverageSelection,
    result: CoverageAssignmentResult
  ): Promise<void> {
    // Step 1: Find coverage in database
    const coverageRecord = await this.findCoverageByCode(selection.coverageCode);
    if (!coverageRecord) {
      throw new Error(`Coverage not found: ${selection.coverageCode}`);
    }

    // Step 2: Create PolicyCoverageDetail (the main link)
    const detailId = await this.createPolicyCoverageDetail(
      input.policyId,
      coverageRecord.coverage_identifier,
      input.vehicleId,
      input.effectiveDate,
      input.expirationDate
    );
    result.policyCoverageDetailIds.push(detailId);

    // Step 3: Create limits (if applicable)
    if (selection.limits) {
      const limitIds = await this.createLimits(detailId, selection.limits);
      result.policyLimitIds.push(...limitIds);
    }

    // Step 4: Create deductible (if applicable)
    if (selection.deductible !== undefined) {
      const deductibleId = await this.createDeductible(detailId, selection.deductible);
      result.policyDeductibleIds.push(deductibleId);
    }

    result.totalCoverages++;
  }

  /**
   * Find coverage by code
   *
   * Coverages are reference data (seeded during setup)
   */
  private async findCoverageByCode(coverageCode: string) {
    

    const result = await this.db
      .select()
      .from(coverage)
      .where(eq(coverage.coverage_code, coverageCode))
      .limit(1);

    return result && result.length > 0 ? result[0] : null;
  }

  /**
   * Create PolicyCoverageDetail record
   *
   * This is the central linking table that says:
   * "This POLICY has this COVERAGE for this VEHICLE during these DATES"
   */
  private async createPolicyCoverageDetail(
    policyId: string,
    coverageId: string,
    vehicleId: string,
    effectiveDate: Date,
    expirationDate: Date
  ): Promise<string> {
    

    const result = await this.db
      .insert(policyCoverageDetail)
      .values({
        policy_identifier: policyId,
        coverage_identifier: coverageId,
        insurable_object_identifier: vehicleId,
        effective_date: effectiveDate,
        expiration_date: expirationDate,
        coverage_description: null, // Could add custom description
        is_included: 'true', // This coverage is included in the policy
      })
      .returning();

    this.logger.debug(
      `PolicyCoverageDetail created: ${result[0].policy_coverage_detail_identifier}`
    );

    return result[0].policy_coverage_detail_identifier;
  }

  /**
   * Create limit records
   *
   * Example limits for Bodily Injury:
   * - $100,000 per person
   * - $300,000 per accident
   *
   * Displayed as: 100/300 (standard notation)
   */
  private async createLimits(
    detailId: string,
    limits: NonNullable<CoverageSelection['limits']>
  ): Promise<string[]> {
    
    const limitIds: string[] = [];

    // Per Person limit
    if (limits.perPerson) {
      const result = await this.db
        .insert(policyLimit)
        .values({
          policy_coverage_detail_identifier: detailId,
          limit_type_code: 'PER_PERSON',
          limit_amount: limits.perPerson.toString(),
          limit_description: `$${limits.perPerson.toLocaleString()} per person`,
        })
        .returning();

      limitIds.push(result[0].policy_limit_identifier);
    }

    // Per Accident limit
    if (limits.perAccident) {
      const result = await this.db
        .insert(policyLimit)
        .values({
          policy_coverage_detail_identifier: detailId,
          limit_type_code: 'PER_ACCIDENT',
          limit_amount: limits.perAccident.toString(),
          limit_description: `$${limits.perAccident.toLocaleString()} per accident`,
        })
        .returning();

      limitIds.push(result[0].policy_limit_identifier);
    }

    // Per Occurrence limit (for property damage)
    if (limits.perOccurrence) {
      const result = await this.db
        .insert(policyLimit)
        .values({
          policy_coverage_detail_identifier: detailId,
          limit_type_code: 'PER_OCCURRENCE',
          limit_amount: limits.perOccurrence.toString(),
          limit_description: `$${limits.perOccurrence.toLocaleString()} per occurrence`,
        })
        .returning();

      limitIds.push(result[0].policy_limit_identifier);
    }

    this.logger.debug(`Created ${limitIds.length} limit records for detail ${detailId}`);
    return limitIds;
  }

  /**
   * Create deductible record
   *
   * Deductible = How much YOU pay before insurance pays
   * - $500 deductible = You pay first $500, insurance pays rest
   * - Higher deductible = Lower premium (you assume more risk)
   */
  private async createDeductible(
    detailId: string,
    deductibleAmount: number
  ): Promise<string> {
    

    const result = await this.db
      .insert(policyDeductible)
      .values({
        policy_coverage_detail_identifier: detailId,
        deductible_type_code: 'PER_CLAIM',
        deductible_amount: deductibleAmount.toString(),
        deductible_description: `$${deductibleAmount.toLocaleString()} per claim`,
      })
      .returning();

    this.logger.debug(
      `Created deductible record: ${result[0].policy_deductible_identifier} ($${deductibleAmount})`
    );

    return result[0].policy_deductible_identifier;
  }

  /**
   * Get all coverages for a policy
   */
  async getPolicyCoverages(policyId: string) {
    

    // This would join multiple tables to get complete coverage info
    // Simplified for now - just return PolicyCoverageDetail records
    const results = await this.db
      .select()
      .from(policyCoverageDetail)
      .where(eq(policyCoverageDetail.policy_identifier, policyId));

    return results;
  }

  /**
   * Remove all coverages from a policy
   *
   * Used when customer wants to restart coverage selection
   */
  async removeCoverages(policyId: string): Promise<void> {
    

    // Cascade delete will remove limits and deductibles automatically
    await this.db
      .delete(policyCoverageDetail)
      .where(eq(policyCoverageDetail.policy_identifier, policyId));

    this.logger.log(`Removed all coverages from policy ${policyId}`);
  }
}

/**
 * LEARNING SUMMARY - Key Concepts:
 *
 * 1. **Many-to-Many with Attributes**:
 *    - Policy ←→ Coverage is many-to-many
 *    - BUT we need to store attributes (limits, deductibles)
 *    - Solution: Junction table (PolicyCoverageDetail) with extra fields
 *    - This is why we don't just have a simple policy_coverage table
 *
 * 2. **Coverage Hierarchy**:
 *    ```
 *    Policy
 *      └─ PolicyCoverageDetail (links Policy + Coverage + Vehicle)
 *           ├─ PolicyLimit (multiple limits per coverage)
 *           └─ PolicyDeductible (deductible for this coverage)
 *    ```
 *
 * 3. **Standard Auto Coverage Types**:
 *    - **Liability** (required by law):
 *      - Bodily Injury (BI): Pays medical bills if you hurt someone
 *      - Property Damage (PD): Pays if you damage someone's property
 *    - **Physical Damage** (optional):
 *      - Collision: Pays to fix YOUR car after accident
 *      - Comprehensive: Pays for theft, weather, vandalism
 *    - **Uninsured/Underinsured Motorist** (UM/UIM):
 *      - Protects you if other driver has no insurance
 *    - **Medical Payments/PIP**:
 *      - Pays YOUR medical bills regardless of fault
 *
 * 4. **Limit Notation**:
 *    - 100/300/100 = Standard notation
 *      - $100k Bodily Injury per person
 *      - $300k Bodily Injury per accident
 *      - $100k Property Damage per occurrence
 *
 * 5. **Deductible Math**:
 *    - Accident causes $5,000 damage
 *    - Your deductible: $1,000
 *    - You pay: $1,000
 *    - Insurance pays: $4,000
 *
 * 6. **Foreign Key Cascade**:
 *    - When PolicyCoverageDetail is deleted
 *    - Associated limits and deductibles auto-delete (cascade)
 *    - Prevents orphan records
 *    - Defined in schema with `onDelete: 'cascade'`
 *
 * PRODUCTION CONSIDERATIONS:
 * - Validate coverage combinations (some coverages require others)
 * - Enforce state minimum limits (CA requires 15/30/5)
 * - Check vehicle type vs coverage (can't get collision on total loss)
 * - Store coverage effective dates separately from policy dates
 * - Add coverage change history audit trail
 * - Validate deductible ≤ coverage limit
 */
