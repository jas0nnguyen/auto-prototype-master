import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { QuoteModule } from './services/quote/quote.module';

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
    // Policy module will be added in Phase 4
    // Portal module will be added in Phase 5
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
