import { test, expect } from '@playwright/test';
import { VehicleInfoPage } from './pages/VehicleInfoPage';
import { DriverInfoPage } from './pages/DriverInfoPage';
import { CoverageSelectionPage } from './pages/CoverageSelectionPage';
import { QuoteResultsPage } from './pages/QuoteResultsPage';
import { testVehicles, testDrivers, testAddresses } from './fixtures/test-data';

/**
 * E2E Tests for Auto Insurance Quote Flow (US1)
 *
 * These tests cover the complete quote generation flow from
 * vehicle info through quote results.
 */

test.describe('Quote Flow - Happy Path', () => {
  test('should complete full quote flow with standard coverage', async ({ page }) => {
    const vehiclePage = new VehicleInfoPage(page);
    const driverPage = new DriverInfoPage(page);
    const coveragePage = new CoverageSelectionPage(page);
    const resultsPage = new QuoteResultsPage(page);

    // Step 1: Enter vehicle information
    await vehiclePage.goto();
    await vehiclePage.fillAndSubmit(testVehicles.honda2020);

    // Verify navigation to driver info page
    await expect(page).toHaveURL(/\/quote\/driver-info/);

    // Step 2: Enter driver and address information
    await driverPage.fillAndSubmit(testDrivers.john, testAddresses.losAngeles);

    // Verify navigation to coverage selection
    await expect(page).toHaveURL(/\/quote\/coverage-selection/);

    // Step 3: Select coverage and get quote
    await coveragePage.selectStandardCoverage();
    await coveragePage.submit();

    // Verify navigation to results page
    await expect(page).toHaveURL(/\/quote\/results/);

    // Step 4: Verify quote results are displayed
    const quoteNumber = await resultsPage.getQuoteNumber();
    expect(quoteNumber).toBeTruthy();

    const totalPremium = await resultsPage.getTotalPremium();
    expect(totalPremium).toBeTruthy();
    expect(totalPremium).toMatch(/\$/); // Should contain dollar sign

    // Verify all sections are visible
    await expect(resultsPage.premiumBreakdown).toBeVisible();
    await expect(resultsPage.vehicleInfo).toBeVisible();
    await expect(resultsPage.driverInfo).toBeVisible();
  });

  test('should complete quote flow with minimum coverage', async ({ page }) => {
    const vehiclePage = new VehicleInfoPage(page);
    const driverPage = new DriverInfoPage(page);
    const coveragePage = new CoverageSelectionPage(page);
    const resultsPage = new QuoteResultsPage(page);

    await vehiclePage.goto();
    await vehiclePage.fillAndSubmit(testVehicles.toyota2019);

    await driverPage.fillAndSubmit(testDrivers.jane, testAddresses.sanFrancisco);

    await coveragePage.selectMinimumCoverage();
    await coveragePage.submit();

    await expect(page).toHaveURL(/\/quote\/results/);

    const quoteNumber = await resultsPage.getQuoteNumber();
    expect(quoteNumber).toBeTruthy();

    const totalPremium = await resultsPage.getTotalPremium();
    expect(totalPremium).toBeTruthy();
  });

  test('should complete quote flow with premium coverage', async ({ page }) => {
    const vehiclePage = new VehicleInfoPage(page);
    const driverPage = new DriverInfoPage(page);
    const coveragePage = new CoverageSelectionPage(page);
    const resultsPage = new QuoteResultsPage(page);

    await vehiclePage.goto();
    await vehiclePage.fillAndSubmit(testVehicles.ford2021);

    await driverPage.fillAndSubmit(testDrivers.senior, testAddresses.newYork);

    await coveragePage.selectPremiumCoverage();
    await coveragePage.submit();

    await expect(page).toHaveURL(/\/quote\/results/);

    const quoteNumber = await resultsPage.getQuoteNumber();
    expect(quoteNumber).toBeTruthy();
  });
});

test.describe('Quote Flow - Navigation', () => {
  test('should allow user to go back and modify vehicle info', async ({ page }) => {
    const vehiclePage = new VehicleInfoPage(page);
    const driverPage = new DriverInfoPage(page);

    await vehiclePage.goto();
    await vehiclePage.fillAndSubmit(testVehicles.honda2020);

    await expect(page).toHaveURL(/\/quote\/driver-info/);

    // Go back to vehicle page
    await driverPage.goBack();
    await expect(page).toHaveURL(/\/quote\/vehicle-info/);

    // Verify previous data is preserved (sessionStorage)
    const yearValue = await vehiclePage.yearInput.inputValue();
    expect(yearValue).toBe(testVehicles.honda2020.year);
  });

  test('should allow user to go back from coverage selection', async ({ page }) => {
    const vehiclePage = new VehicleInfoPage(page);
    const driverPage = new DriverInfoPage(page);
    const coveragePage = new CoverageSelectionPage(page);

    await vehiclePage.goto();
    await vehiclePage.fillAndSubmit(testVehicles.honda2020);
    await driverPage.fillAndSubmit(testDrivers.john, testAddresses.losAngeles);

    await expect(page).toHaveURL(/\/quote\/coverage-selection/);

    // Go back to driver page
    await coveragePage.goBack();
    await expect(page).toHaveURL(/\/quote\/driver-info/);

    // Verify driver data is preserved
    const firstName = await driverPage.firstNameInput.inputValue();
    expect(firstName).toBe(testDrivers.john.firstName);
  });
});

test.describe('Quote Flow - Validation', () => {
  test('should validate required vehicle fields', async ({ page }) => {
    const vehiclePage = new VehicleInfoPage(page);

    await vehiclePage.goto();

    // Try to submit without filling fields
    await vehiclePage.submit();

    // Should still be on vehicle page (form validation prevents navigation)
    await expect(page).toHaveURL(/\/quote\/vehicle-info/);
  });

  test('should validate VIN format', async ({ page }) => {
    const vehiclePage = new VehicleInfoPage(page);

    await vehiclePage.goto();

    await vehiclePage.yearInput.fill('2020');
    await vehiclePage.makeInput.fill('Honda');
    await vehiclePage.modelInput.fill('Accord');
    await vehiclePage.vinInput.fill('INVALID'); // Invalid VIN

    await vehiclePage.submit();

    // Check for validation error (if implemented)
    // This test may need adjustment based on your validation UX
  });

  test('should validate email format on driver page', async ({ page }) => {
    const vehiclePage = new VehicleInfoPage(page);
    const driverPage = new DriverInfoPage(page);

    await vehiclePage.goto();
    await vehiclePage.fillAndSubmit(testVehicles.honda2020);

    await driverPage.firstNameInput.fill(testDrivers.john.firstName);
    await driverPage.lastNameInput.fill(testDrivers.john.lastName);
    await driverPage.birthDateInput.fill(testDrivers.john.birthDate);
    await driverPage.emailInput.fill('invalid-email'); // Invalid email
    await driverPage.phoneInput.fill(testDrivers.john.phone);

    await driverPage.submit();

    // Should still be on driver page due to validation
    await expect(page).toHaveURL(/\/quote\/driver-info/);
  });
});

test.describe('Quote Flow - Mobile Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should complete quote flow on mobile viewport', async ({ page }) => {
    const vehiclePage = new VehicleInfoPage(page);
    const driverPage = new DriverInfoPage(page);
    const coveragePage = new CoverageSelectionPage(page);
    const resultsPage = new QuoteResultsPage(page);

    await vehiclePage.goto();
    await vehiclePage.fillAndSubmit(testVehicles.honda2020);

    await driverPage.fillAndSubmit(testDrivers.john, testAddresses.losAngeles);

    await coveragePage.selectStandardCoverage();
    await coveragePage.submit();

    await expect(page).toHaveURL(/\/quote\/results/);

    const quoteNumber = await resultsPage.getQuoteNumber();
    expect(quoteNumber).toBeTruthy();
  });
});
