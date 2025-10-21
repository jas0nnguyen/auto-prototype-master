import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Coverage Selection Page
 */
export class CoverageSelectionPage {
  readonly page: Page;
  readonly liabilitySelect: Locator;
  readonly propertyDamageSelect: Locator;
  readonly collisionCheckbox: Locator;
  readonly comprehensiveCheckbox: Locator;
  readonly collisionDeductibleSelect: Locator;
  readonly comprehensiveDeductibleSelect: Locator;
  readonly getQuoteButton: Locator;
  readonly backButton: Locator;
  readonly premiumPreview: Locator;

  constructor(page: Page) {
    this.page = page;

    this.liabilitySelect = page.locator('select[name="bodilyInjuryLiability"]');
    this.propertyDamageSelect = page.locator('select[name="propertyDamageLiability"]');
    this.collisionCheckbox = page.locator('input[name="collision"]');
    this.comprehensiveCheckbox = page.locator('input[name="comprehensive"]');
    this.collisionDeductibleSelect = page.locator('select[name="collisionDeductible"]');
    this.comprehensiveDeductibleSelect = page.locator('select[name="comprehensiveDeductible"]');
    this.getQuoteButton = page.locator('button:has-text("Get Quote"), button[type="submit"]');
    this.backButton = page.locator('button:has-text("Back")');
    this.premiumPreview = page.locator('[data-testid="premium-preview"], .premium-amount');
  }

  async goto() {
    await this.page.goto('/quote/coverage-selection');
  }

  async selectLiabilityCoverage(value: string) {
    await this.liabilitySelect.selectOption(value);
  }

  async selectPropertyDamage(value: string) {
    await this.propertyDamageSelect.selectOption(value);
  }

  async toggleCollision(enable: boolean) {
    const isChecked = await this.collisionCheckbox.isChecked();
    if (enable !== isChecked) {
      await this.collisionCheckbox.click();
    }
  }

  async toggleComprehensive(enable: boolean) {
    const isChecked = await this.comprehensiveCheckbox.isChecked();
    if (enable !== isChecked) {
      await this.comprehensiveCheckbox.click();
    }
  }

  async selectCollisionDeductible(value: string) {
    await this.collisionDeductibleSelect.selectOption(value);
  }

  async selectComprehensiveDeductible(value: string) {
    await this.comprehensiveDeductibleSelect.selectOption(value);
  }

  async selectMinimumCoverage() {
    await this.selectLiabilityCoverage('25/50');
    await this.selectPropertyDamage('25');
    await this.toggleCollision(false);
    await this.toggleComprehensive(false);
  }

  async selectStandardCoverage() {
    await this.selectLiabilityCoverage('100/300');
    await this.selectPropertyDamage('100');
    await this.toggleCollision(true);
    await this.toggleComprehensive(true);
    await this.selectCollisionDeductible('500');
    await this.selectComprehensiveDeductible('500');
  }

  async selectPremiumCoverage() {
    await this.selectLiabilityCoverage('250/500');
    await this.selectPropertyDamage('100');
    await this.toggleCollision(true);
    await this.toggleComprehensive(true);
    await this.selectCollisionDeductible('250');
    await this.selectComprehensiveDeductible('250');
  }

  async submit() {
    await this.getQuoteButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }

  async getPremiumPreview(): Promise<string | null> {
    if (await this.premiumPreview.isVisible()) {
      return await this.premiumPreview.textContent();
    }
    return null;
  }
}
