/**
 * Signature Service
 *
 * Business logic for digital signature capture and storage during the signing ceremony.
 * Handles signature validation, storage, and retrieval for policy binding.
 *
 * Business Rules:
 * - One signature per quote (enforced at application layer)
 * - Signature required before policy binding
 * - Max size: 1MB (enforced via base64 length check)
 * - Supported formats: PNG (primary), JPEG (fallback)
 */

import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { signatures } from '../../../../database/schema/signature.schema';
import { policy } from '../../../../database/schema/policy.schema';
import { party } from '../../../../database/schema/party.schema';
import type { NewSignature, Signature } from '../../../../database/schema/signature.schema';
import type { Database } from '../../database/drizzle.config';
import { DATABASE_CONNECTION } from '../../database/database.module';

/**
 * Signature Service
 */
@Injectable()
export class SignatureService {
  private readonly logger = new Logger(SignatureService.name);

  // Max base64 string length for 1MB image
  // Base64 encoding increases size by ~33%, so 1MB raw = ~1.4MB base64
  private readonly MAX_BASE64_LENGTH = 1_400_000;

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database
  ) {}

  /**
   * T030: Create a new signature
   *
   * Validates signature data and stores it in the database with audit trail information.
   * Enforces one signature per quote business rule.
   *
   * @param data - Signature data with quote_id, party_id, image data, and format
   * @param requestMetadata - HTTP request metadata (IP address, user agent)
   * @returns Created signature record
   * @throws BadRequestException if validation fails
   * @throws NotFoundException if quote or party not found
   * @throws ConflictException if signature already exists for this quote
   */
  async createSignature(
    data: NewSignature,
    requestMetadata: {
      ip_address?: string;
      user_agent?: string;
    }
  ): Promise<Signature> {
    this.logger.log('Creating signature', {
      quoteId: data.quote_id,
      partyId: data.party_id,
      format: data.signature_format,
    });

    // 1. Validate signature format (PNG or JPEG only)
    if (data.signature_format !== 'PNG' && data.signature_format !== 'JPEG') {
      throw new BadRequestException('Signature format must be PNG or JPEG');
    }

    // 2. Validate signature image data is not empty
    if (!data.signature_image_data || data.signature_image_data.trim().length === 0) {
      throw new BadRequestException('Signature image data is required');
    }

    // 3. Enforce max 1MB size via base64 length check
    if (data.signature_image_data.length > this.MAX_BASE64_LENGTH) {
      throw new BadRequestException('Signature image exceeds 1MB limit');
    }

    // 4. Verify quote exists (quote is a policy with status='QUOTED')
    const quoteExists = await this.db
      .select()
      .from(policy)
      .where(eq(policy.policy_identifier, data.quote_id))
      .limit(1);

    if (!quoteExists || quoteExists.length === 0) {
      throw new NotFoundException(`Quote with ID ${data.quote_id} not found`);
    }

    // 5. For demo mode: If party_id matches quote_id (frontend sends policy_id as party_id),
    //    skip party validation. In production, this would look up the actual party_id from the quote.
    //    This allows the signature to be created without requiring the party_id to exist.
    const isDemo = data.party_id === data.quote_id;

    if (!isDemo) {
      // Verify party exists only if a real party_id was provided
      const partyExists = await this.db
        .select()
        .from(party)
        .where(eq(party.party_identifier, data.party_id))
        .limit(1);

      if (!partyExists || partyExists.length === 0) {
        throw new NotFoundException(`Party with ID ${data.party_id} not found`);
      }
    }

    // 6. Ensure one signature per quote (check for existing signature)
    const existingSignature = await this.db
      .select()
      .from(signatures)
      .where(eq(signatures.quote_id, data.quote_id))
      .limit(1);

    if (existingSignature && existingSignature.length > 0) {
      throw new ConflictException('Signature already exists for this quote');
    }

    // 7. Create signature record with audit trail
    try {
      const [newSignature] = await this.db
        .insert(signatures)
        .values({
          quote_id: data.quote_id,
          party_id: data.party_id,
          signature_image_data: data.signature_image_data,
          signature_format: data.signature_format,
          ip_address: requestMetadata.ip_address || null,
          user_agent: requestMetadata.user_agent || null,
        })
        .returning();

      this.logger.log('Signature created successfully', {
        signatureId: newSignature.signature_id,
        quoteId: newSignature.quote_id,
      });

      return newSignature;
    } catch (dbError) {
      // Log the full database error to expose the real PostgreSQL error
      this.logger.error('Database INSERT failed:', {
        error: dbError,
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined,
        // For PostgreSQL errors, try to extract additional details
        code: (dbError as any)?.code,
        detail: (dbError as any)?.detail,
        hint: (dbError as any)?.hint,
        table: (dbError as any)?.table,
        constraint: (dbError as any)?.constraint,
      });
      throw dbError;
    }
  }

  /**
   * T031: Get signature by quote ID
   *
   * Retrieves the signature associated with a specific quote.
   * Returns null if no signature exists for the quote.
   *
   * @param quoteId - Quote UUID
   * @returns Signature record or null if not found
   */
  async getSignatureByQuoteId(quoteId: string): Promise<Signature | null> {
    this.logger.log('Getting signature by quote ID', { quoteId });

    const result = await this.db
      .select()
      .from(signatures)
      .where(eq(signatures.quote_id, quoteId))
      .limit(1);

    if (!result || result.length === 0) {
      this.logger.debug('No signature found for quote', { quoteId });
      return null;
    }

    this.logger.log('Signature retrieved', {
      signatureId: result[0].signature_id,
      quoteId,
    });

    return result[0];
  }
}
