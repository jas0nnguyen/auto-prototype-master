import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Driver Information Page
 */
export class DriverInfoPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly birthDateInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressLine1Input: Locator;
  readonly cityInput: Locator;
  readonly stateSelect: Locator;
  readonly zipCodeInput: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Driver fields
    this.firstNameInput = page.locator('input[name="firstName"], input[id="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"], input[id="lastName"]');
    this.birthDateInput = page.locator('input[name="birthDate"], input[id="birthDate"]');
    this.emailInput = page.locator('input[name="email"], input[id="email"]');
    this.phoneInput = page.locator('input[name="phone"], input[id="phone"]');

    // Address fields
    this.addressLine1Input = page.locator('input[name="addressLine1"], input[id="addressLine1"]');
    this.cityInput = page.locator('input[name="city"], input[id="city"]');
    this.stateSelect = page.locator('select[name="state"], select[id="state"]');
    this.zipCodeInput = page.locator('input[name="zipCode"], input[id="zipCode"]');

    // Navigation
    this.continueButton = page.locator('button:has-text("Continue"), button[type="submit"]');
    this.backButton = page.locator('button:has-text("Back")');
    this.errorMessage = page.locator('[role="alert"], .error-message');
  }

  async goto() {
    await this.page.goto('/quote/driver-info');
  }

  async fillDriverInfo(driverData: {
    firstName: string;
    lastName: string;
    birthDate: string;
    email: string;
    phone: string;
  }) {
    await this.firstNameInput.fill(driverData.firstName);
    await this.lastNameInput.fill(driverData.lastName);
    await this.birthDateInput.fill(driverData.birthDate);
    await this.emailInput.fill(driverData.email);
    await this.phoneInput.fill(driverData.phone);
  }

  async fillAddress(addressData: {
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
  }) {
    await this.addressLine1Input.fill(addressData.addressLine1);
    await this.cityInput.fill(addressData.city);
    await this.stateSelect.selectOption(addressData.state);
    await this.zipCodeInput.fill(addressData.zipCode);
  }

  async submit() {
    await this.continueButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }

  async fillAndSubmit(
    driverData: {
      firstName: string;
      lastName: string;
      birthDate: string;
      email: string;
      phone: string;
    },
    addressData: {
      addressLine1: string;
      city: string;
      state: string;
      zipCode: string;
    }
  ) {
    await this.fillDriverInfo(driverData);
    await this.fillAddress(addressData);
    await this.submit();
  }
}
