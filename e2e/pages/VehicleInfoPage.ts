import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Vehicle Information Page
 *
 * This class encapsulates all interactions with the vehicle info page,
 * following the Page Object pattern for maintainable E2E tests.
 */
export class VehicleInfoPage {
  readonly page: Page;
  readonly yearInput: Locator;
  readonly makeInput: Locator;
  readonly modelInput: Locator;
  readonly vinInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators - adjust selectors based on your actual implementation
    this.yearInput = page.locator('input[name="year"], input[id="year"]');
    this.makeInput = page.locator('input[name="make"], input[id="make"]');
    this.modelInput = page.locator('input[name="model"], input[id="model"]');
    this.vinInput = page.locator('input[name="vin"], input[id="vin"]');
    this.continueButton = page.locator('button:has-text("Continue"), button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"], .error-message');
  }

  async goto() {
    await this.page.goto('/quote/vehicle-info');
  }

  async fillVehicleInfo(vehicleData: {
    year: string;
    make: string;
    model: string;
    vin: string;
  }) {
    await this.yearInput.fill(vehicleData.year);
    await this.makeInput.fill(vehicleData.make);
    await this.modelInput.fill(vehicleData.model);
    await this.vinInput.fill(vehicleData.vin);
  }

  async submit() {
    await this.continueButton.click();
  }

  async fillAndSubmit(vehicleData: {
    year: string;
    make: string;
    model: string;
    vin: string;
  }) {
    await this.fillVehicleInfo(vehicleData);
    await this.submit();
  }

  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }
}
