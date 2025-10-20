/**
 * Quote Module
 *
 * This module bundles together all quote-related services and controllers.
 * It's like a package that contains everything needed for quote functionality.
 */

import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuotesController } from '../../api/routes/quotes.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule], // Import database connection
  controllers: [QuotesController], // Register REST API endpoints
  providers: [QuoteService], // Register business logic service
  exports: [QuoteService], // Make QuoteService available to other modules
})
export class QuoteModule {}
