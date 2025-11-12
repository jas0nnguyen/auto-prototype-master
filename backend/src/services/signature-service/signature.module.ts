/**
 * Signature Module
 *
 * NestJS module that bundles signature-related services and controllers.
 * Provides digital signature capture and storage functionality for policy binding.
 */

import { Module } from '@nestjs/common';
import { SignatureService } from './signature.service';
import { SignaturesController } from '../../api/routes/signatures.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule], // Import database connection
  controllers: [SignaturesController], // Register HTTP request handlers
  providers: [SignatureService], // Register business logic service
  exports: [SignatureService], // Make SignatureService available to other modules
})
export class SignatureModule {}
