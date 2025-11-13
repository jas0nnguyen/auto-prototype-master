/**
 * User Account Module
 *
 * Provides user account management services for the application.
 * Handles email checking, account creation, and authentication (demo mode).
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { UserAccountService } from './user-account.service';
import { UserAccountsController } from '../../api/routes/user-accounts.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [UserAccountsController],
  providers: [UserAccountService],
  exports: [UserAccountService],
})
export class UserAccountModule {}
