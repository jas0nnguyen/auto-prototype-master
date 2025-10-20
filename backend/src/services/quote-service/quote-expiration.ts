/**
 * Quote Expiration Utility (T068)
 *
 * Utility functions for checking if quotes have expired.
 * Quotes expire 30 days after creation (industry standard).
 *
 * ANALOGY: Like checking if milk has expired.
 * - Check the date on the carton (created_at)
 * - Calculate how many days old it is
 * - If > 30 days, it's expired (throw it away)
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * Result of expiration check
 */
export interface ExpirationCheckResult {
  isExpired: boolean; // Is the quote currently expired?
  daysOld: number; // How many days since creation?
  daysUntilExpiration: number; // How many days left? (negative if expired)
  expirationDate: Date; // The actual expiration date
  createdAt: Date; // When the quote was created
}

/**
 * Quote Expiration Utility
 *
 * Provides functions to check quote expiration status
 * Used by API endpoints to warn users about expiring quotes
 */
@Injectable()
export class QuoteExpirationUtility {
  private readonly logger = new Logger(QuoteExpirationUtility.name);

  /**
   * Quote expiration period in days
   * From requirements: "Quoted policies expire after 30 days if not bound"
   */
  private readonly EXPIRATION_DAYS = 30;

  /**
   * Check if a quote is expired based on creation date
   *
   * @param createdAt - When the quote was created
   * @returns Detailed expiration information
   */
  checkExpiration(createdAt: Date): ExpirationCheckResult {
    const now = new Date();
    const created = new Date(createdAt); // Ensure it's a Date object

    // Calculate how old the quote is (in days)
    const ageInMilliseconds = now.getTime() - created.getTime();
    const ageInDays = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24));

    // Calculate expiration date (created + 30 days)
    const expirationDate = new Date(created);
    expirationDate.setDate(expirationDate.getDate() + this.EXPIRATION_DAYS);

    // Check if expired
    const isExpired = ageInDays >= this.EXPIRATION_DAYS;

    // Calculate days until expiration (negative if already expired)
    const daysUntilExpiration = this.EXPIRATION_DAYS - ageInDays;

    return {
      isExpired,
      daysOld: ageInDays,
      daysUntilExpiration,
      expirationDate,
      createdAt: created,
    };
  }

  /**
   * Get human-readable expiration message
   *
   * Examples:
   * - "This quote expires in 15 days"
   * - "This quote expires today"
   * - "This quote expired 3 days ago"
   */
  getExpirationMessage(createdAt: Date): string {
    const result = this.checkExpiration(createdAt);

    if (result.isExpired) {
      const daysAgo = Math.abs(result.daysUntilExpiration);
      if (daysAgo === 0) {
        return 'This quote expired today';
      } else if (daysAgo === 1) {
        return 'This quote expired yesterday';
      } else {
        return `This quote expired ${daysAgo} days ago`;
      }
    } else {
      const daysLeft = result.daysUntilExpiration;
      if (daysLeft === 0) {
        return 'This quote expires today';
      } else if (daysLeft === 1) {
        return 'This quote expires tomorrow';
      } else {
        return `This quote expires in ${daysLeft} days`;
      }
    }
  }

  /**
   * Get urgency level for UI display
   *
   * Returns:
   * - 'expired' - Quote has expired
   * - 'urgent' - Less than 3 days left
   * - 'warning' - Less than 7 days left
   * - 'normal' - 7+ days left
   */
  getUrgencyLevel(createdAt: Date): 'expired' | 'urgent' | 'warning' | 'normal' {
    const result = this.checkExpiration(createdAt);

    if (result.isExpired) {
      return 'expired';
    } else if (result.daysUntilExpiration <= 3) {
      return 'urgent';
    } else if (result.daysUntilExpiration <= 7) {
      return 'warning';
    } else {
      return 'normal';
    }
  }

  /**
   * Get urgency color for UI display
   *
   * Maps urgency level to colors for badges/alerts
   */
  getUrgencyColor(createdAt: Date): string {
    const level = this.getUrgencyLevel(createdAt);

    switch (level) {
      case 'expired':
        return 'red';
      case 'urgent':
        return 'orange';
      case 'warning':
        return 'yellow';
      case 'normal':
        return 'green';
    }
  }

  /**
   * Check if quote should show expiration warning
   *
   * Warning shown if:
   * - Not expired yet
   * - Less than 7 days until expiration
   */
  shouldShowWarning(createdAt: Date): boolean {
    const result = this.checkExpiration(createdAt);
    return !result.isExpired && result.daysUntilExpiration <= 7;
  }

  /**
   * Calculate percentage of expiration period elapsed
   *
   * Used for progress bars showing how close to expiration
   * Returns 0-100
   *
   * Example:
   * - 0 days old = 0% (just created)
   * - 15 days old = 50% (halfway to expiration)
   * - 30 days old = 100% (expired)
   * - 45 days old = 150% (well past expiration)
   */
  getExpirationPercentage(createdAt: Date): number {
    const result = this.checkExpiration(createdAt);
    return Math.min(
      100,
      Math.floor((result.daysOld / this.EXPIRATION_DAYS) * 100)
    );
  }

  /**
   * Get formatted expiration date string
   *
   * Example: "October 19, 2025"
   */
  getFormattedExpirationDate(createdAt: Date): string {
    const result = this.checkExpiration(createdAt);
    return result.expirationDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Get relative time until expiration
   *
   * Examples:
   * - "in 15 days"
   * - "in 1 day"
   * - "today"
   * - "3 days ago"
   */
  getRelativeExpirationTime(createdAt: Date): string {
    const result = this.checkExpiration(createdAt);

    if (result.daysUntilExpiration > 0) {
      if (result.daysUntilExpiration === 1) {
        return 'in 1 day';
      } else {
        return `in ${result.daysUntilExpiration} days`;
      }
    } else if (result.daysUntilExpiration === 0) {
      return 'today';
    } else {
      const daysAgo = Math.abs(result.daysUntilExpiration);
      if (daysAgo === 1) {
        return '1 day ago';
      } else {
        return `${daysAgo} days ago`;
      }
    }
  }

  /**
   * Check if quote will expire within specified days
   *
   * Useful for:
   * - Sending reminder emails (7 days before expiration)
   * - Showing alerts in UI (3 days before expiration)
   * - Preventing quote binding if too close to expiration
   */
  willExpireWithinDays(createdAt: Date, days: number): boolean {
    const result = this.checkExpiration(createdAt);
    return !result.isExpired && result.daysUntilExpiration <= days;
  }

  /**
   * Get recommended action based on expiration status
   *
   * Returns suggested action for customer service or UI
   */
  getRecommendedAction(createdAt: Date): string {
    const result = this.checkExpiration(createdAt);

    if (result.isExpired) {
      return 'Create a new quote - this quote has expired';
    } else if (result.daysUntilExpiration <= 3) {
      return 'Bind this quote soon - it expires in less than 3 days';
    } else if (result.daysUntilExpiration <= 7) {
      return 'Consider binding this quote - it expires in less than a week';
    } else {
      return 'You have time to review this quote before it expires';
    }
  }
}

/**
 * LEARNING SUMMARY - Key Concepts:
 *
 * 1. **Date Math in JavaScript**:
 *    ```typescript
 *    const now = new Date(); // Current time
 *    const past = new Date('2025-09-19'); // Specific date
 *
 *    // Get time difference in milliseconds
 *    const diff = now.getTime() - past.getTime();
 *
 *    // Convert to days
 *    const days = diff / (1000 * 60 * 60 * 24);
 *    //             ms → sec → min → hr → day
 *    ```
 *
 * 2. **Why Math.floor()?**:
 *    - We want whole days, not decimals
 *    - `Math.floor(3.7)` = 3 (round down)
 *    - A quote that's 3.7 days old is still "3 days old"
 *
 * 3. **Utility Class Pattern**:
 *    - No database access (pure logic)
 *    - Just calculation and formatting functions
 *    - Easy to test (no dependencies)
 *    - Can be used anywhere in the app
 *
 * 4. **Progressive Warnings**:
 *    - 30-7 days: Normal (green)
 *    - 7-3 days: Warning (yellow)
 *    - 3-0 days: Urgent (orange)
 *    - Expired: Critical (red)
 *    - This helps users prioritize actions
 *
 * 5. **User Experience Considerations**:
 *    - Show countdown to create urgency
 *    - Use colors to communicate severity
 *    - Provide clear actions ("Bind now" vs "You have time")
 *    - Progressive disclosure (only show warning when relevant)
 *
 * 6. **Business Rules**:
 *    - Why 30 days?
 *      - Insurance rates change frequently
 *      - Risk assessments become outdated
 *      - State regulations may change
 *      - Prevents honoring stale pricing
 *    - Industry standard across most insurers
 *
 * 7. **Timezone Considerations**:
 *    - All dates should be in same timezone
 *    - Use UTC for storage, local for display
 *    - "End of day" depends on timezone
 *    - Production: Store timezone with quote
 *
 * PRODUCTION CONSIDERATIONS:
 * - Store timezone with quote creation
 * - Handle daylight saving time transitions
 * - Consider business days vs calendar days
 * - Send automated reminder emails at 7/3/1 days
 * - Allow manual extension for customer service
 * - Log all expiration checks for audit
 * - Consider state-specific expiration periods
 */
