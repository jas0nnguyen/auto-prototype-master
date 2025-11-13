import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { QuoteModule } from './services/quote/quote.module';
import { DocumentServiceModule } from './services/document-service/document-service.module';
import { SignatureModule } from './services/signature-service/signature.module';
import { UserAccountModule } from './services/user-account-service/user-account.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Database module - Phase 2 ✅
    DatabaseModule,
    // Quote module - Phase 3 ✅
    QuoteModule,
    // Document service module - Feature 003 ✅
    DocumentServiceModule,
    // Signature module - Feature 004 ✅
    SignatureModule,
    // User Account module - Feature 004 Phase 4 ✅
    UserAccountModule,
    // Policy module will be added in Phase 4
    // Portal module will be added in Phase 5
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
