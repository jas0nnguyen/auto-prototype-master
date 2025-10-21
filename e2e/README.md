# Playwright E2E Testing Guide

This directory contains end-to-end tests for the Auto Insurance Prototype using [Playwright](https://playwright.dev/).

## Overview

Our E2E test suite covers:
- **Quote Flow** (`quote-flow.spec.ts`) - Complete user journey from vehicle info through quote results
- **API Integration** (`api-integration.spec.ts`) - Backend API endpoint testing
- **Home Page** (`home-page.spec.ts`) - Landing page functionality and navigation
- **Page Objects** (`pages/`) - Reusable page interaction models
- **Test Fixtures** (`fixtures/`) - Reusable test data

## Quick Start

### Running Tests

```bash
# Run all tests (headless mode)
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode (step through tests)
npm run test:e2e:debug

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# View test report
npm run test:e2e:report
```

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test quote-flow.spec.ts

# Run tests matching a pattern
npx playwright test --grep "quote flow"

# Run a specific test by title
npx playwright test --grep "should complete full quote flow"
```

## Test Structure

### Page Object Model

We use the Page Object Model pattern to keep tests maintainable:

```typescript
// e2e/pages/VehicleInfoPage.ts
export class VehicleInfoPage {
  constructor(page: Page) {
    this.page = page;
    this.yearInput = page.locator('input[name="year"]');
    // ... other locators
  }

  async fillAndSubmit(data) {
    await this.yearInput.fill(data.year);
    // ... fill other fields
    await this.submit();
  }
}
```

**Benefits:**
- Reusable page interactions
- Easy to update when UI changes
- Cleaner test code

### Test Fixtures

Reusable test data is stored in `fixtures/test-data.ts`:

```typescript
import { testVehicles, testDrivers, testAddresses } from './fixtures/test-data';

test('my test', async ({ page }) => {
  await vehiclePage.fillAndSubmit(testVehicles.honda2020);
  await driverPage.fillAndSubmit(testDrivers.john, testAddresses.losAngeles);
});
```

## Writing New Tests

### 1. Create Page Object (if needed)

```typescript
// e2e/pages/NewPage.ts
import { Page, Locator } from '@playwright/test';

export class NewPage {
  readonly page: Page;
  readonly someButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.someButton = page.locator('button[data-testid="some-button"]');
  }

  async goto() {
    await this.page.goto('/new-page');
  }

  async clickButton() {
    await this.someButton.click();
  }
}
```

### 2. Write Test File

```typescript
// e2e/new-feature.spec.ts
import { test, expect } from '@playwright/test';
import { NewPage } from './pages/NewPage';

test.describe('New Feature', () => {
  test('should do something', async ({ page }) => {
    const newPage = new NewPage(page);

    await newPage.goto();
    await newPage.clickButton();

    await expect(page).toHaveURL(/expected-url/);
  });
});
```

## Best Practices

### 1. Use Data Attributes for Stable Selectors

**Good:**
```typescript
page.locator('[data-testid="quote-number"]')
```

**Avoid:**
```typescript
page.locator('.css-class-xyz123') // Fragile, changes with styling
```

### 2. Wait for Elements Properly

Playwright auto-waits, but be explicit when needed:

```typescript
// Wait for element to be visible
await expect(element).toBeVisible();

// Wait for navigation
await page.waitForURL(/expected-url/);

// Wait for API response
await page.waitForResponse(/api\/quotes/);
```

### 3. Isolate Tests

Each test should be independent:

```typescript
test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Set up fresh state for each test
    await page.goto('/');
  });

  test('test 1', async ({ page }) => {
    // This test doesn't depend on test 2
  });

  test('test 2', async ({ page }) => {
    // This test doesn't depend on test 1
  });
});
```

### 4. Use Descriptive Test Names

**Good:**
```typescript
test('should display error when VIN is invalid', async ({ page }) => {
  // ...
});
```

**Avoid:**
```typescript
test('VIN validation', async ({ page }) => {
  // What exactly are we testing?
});
```

### 5. Test User Journeys, Not Implementation

**Good:**
```typescript
test('user can get a quote with minimum coverage', async ({ page }) => {
  await vehiclePage.goto();
  await vehiclePage.fillAndSubmit(testVehicles.honda2020);
  await driverPage.fillAndSubmit(testDrivers.john, testAddresses.losAngeles);
  await coveragePage.selectMinimumCoverage();
  await coveragePage.submit();

  await expect(resultsPage.quoteNumber).toBeVisible();
});
```

**Avoid:**
```typescript
test('sessionStorage stores vehicle data', async ({ page }) => {
  // Testing implementation detail, not user behavior
});
```

## Debugging Tests

### 1. Use UI Mode

```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:
- See test results in real-time
- Step through tests
- Inspect page state
- View screenshots and traces

### 2. Use Debug Mode

```bash
npm run test:e2e:debug
```

This opens a browser with Playwright Inspector for step-by-step debugging.

### 3. Add Debug Logs

```typescript
test('my test', async ({ page }) => {
  console.log('Starting test');
  await page.goto('/');
  console.log('Page loaded:', await page.title());

  // Take a screenshot
  await page.screenshot({ path: 'debug.png' });

  // Pause execution
  await page.pause(); // Opens inspector
});
```

### 4. View Trace Files

When tests fail, Playwright captures traces automatically:

```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

Tests are configured to run in CI with optimized settings (see `playwright.config.ts`):

- Automatic retries on failure
- Single worker for stability
- GitHub Actions reporter
- Screenshots on failure
- Videos on failure

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Performance Testing

API performance tests verify requirements from `CLAUDE.md`:

- Quote calculation < 5 seconds
- API responses < 500ms (95th percentile)

```typescript
test('quote creation should complete within 5 seconds', async ({ request }) => {
  const startTime = Date.now();
  const response = await request.post('/api/v1/quotes', { data: quoteData });
  const duration = Date.now() - startTime;

  expect(duration).toBeLessThan(5000);
});
```

## Test Coverage

Current test coverage:

- ✅ Quote flow (happy path)
- ✅ Quote flow (navigation and back buttons)
- ✅ Form validation
- ✅ Mobile responsiveness
- ✅ API endpoint testing
- ✅ API performance testing
- ✅ Home page functionality
- ✅ Accessibility basics

**Future additions:**
- Policy binding flow (Phase 4)
- Self-service portal (Phase 5)
- Email functionality
- Error scenarios
- Browser compatibility matrix

## Troubleshooting

### Tests Timing Out

```typescript
// Increase timeout for slow operations
test('slow operation', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds

  await page.goto('/');
});
```

### Elements Not Found

```typescript
// Wait for element before interacting
await page.waitForSelector('[data-testid="element"]');
const element = page.locator('[data-testid="element"]');
await element.click();
```

### Flaky Tests

```typescript
// Use stricter waiting conditions
await expect(element).toBeVisible({ timeout: 10000 });

// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Retry assertions
await expect(async () => {
  const text = await element.textContent();
  expect(text).toContain('expected');
}).toPass();
```

### Different Behavior in CI

```typescript
// Use environment-specific configuration
const baseURL = process.env.CI
  ? 'http://localhost:3000'
  : 'http://localhost:5173';
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [VS Code Extension](https://playwright.dev/docs/getting-started-vscode)

## Contributing

When adding new tests:

1. Follow existing patterns (Page Objects + Test Fixtures)
2. Use descriptive test names
3. Keep tests isolated and independent
4. Add appropriate `data-testid` attributes to components
5. Update this README if introducing new patterns
6. Run full test suite before committing: `npm run test:e2e`

## Questions?

For questions about testing:
- Check Playwright docs: https://playwright.dev/
- Review existing test files in this directory
- Consult `CLAUDE.md` for project-specific requirements
