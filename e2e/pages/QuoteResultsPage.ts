import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Quote Results Page
 */
export class QuoteResultsPage {
  readonly page: Page;
  readonly quoteNumber: Locator;
  readonly totalPremium: Locator;
  readonly monthlyPremium: Locator;
  readonly premiumBreakdown: Locator;
  readonly vehicleInfo: Locator;
  readonly driverInfo: Locator;
  readonly coverageDetails: Locator;
  readonly bindPolicyButton: Locator;
  readonly emailQuoteButton: Locator;
  readonly modifyQuoteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.quoteNumber = page.locator('[data-testid="quote-number"], .quote-number');
    this.totalPremium = page.locator('[data-testid="total-premium"], .total-premium');
    this.monthlyPremium = page.locator('[data-testid="monthly-premium"], .monthly-premium');
    this.premiumBreakdown = page.locator('[data-testid="premium-breakdown"]');
    this.vehicleInfo = page.locator('[data-testid="vehicle-info"]');
    this.driverInfo = page.locator('[data-testid="driver-info"]');
    this.coverageDetails = page.locator('[data-testid="coverage-details"]');
    this.bindPolicyButton = page.locator('button:has-text("Bind Policy")');
    this.emailQuoteButton = page.locator('button:has-text("Email Quote")');
    this.modifyQuoteButton = page.locator('button:has-text("Modify Quote")');
  }

  async goto() {
    await this.page.goto('/quote/results');
  }

  async getQuoteNumber(): Promise<string | null> {
    if (await this.quoteNumber.isVisible()) {
      return await this.quoteNumber.textContent();
    }
    return null;
  }

  async getTotalPremium(): Promise<string | null> {
    if (await this.totalPremium.isVisible()) {
      return await this.totalPremium.textContent();
    }
    return null;
  }

  async getMonthlyPremium(): Promise<string | null> {
    if (await this.monthlyPremium.isVisible()) {
      return await this.monthlyPremium.textContent();
    }
    return null;
  }

  async bindPolicy() {
    await this.bindPolicyButton.click();
  }

  async emailQuote() {
    await this.emailQuoteButton.click();
  }

  async modifyQuote() {
    await this.modifyQuoteButton.click();
  }

  async isPremiumBreakdownVisible(): Promise<boolean> {
    return await this.premiumBreakdown.isVisible();
  }

  async isVehicleInfoVisible(): Promise<boolean> {
    return await this.vehicleInfo.isVisible();
  }

  async isDriverInfoVisible(): Promise<boolean> {
    return await this.driverInfo.isVisible();
  }
}
