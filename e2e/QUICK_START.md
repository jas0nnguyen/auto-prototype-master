# Playwright Quick Start

## Installation Complete ✅

Playwright has been installed with:
- Chromium browser
- Firefox browser
- WebKit (Safari) browser
- @playwright/test testing framework
- @playwright/mcp MCP server integration

## Run Your First Test

```bash
# Start your dev server in one terminal
npm run dev

# In another terminal, run tests
npm run test:e2e
```

## Test Commands Cheat Sheet

```bash
# Basic test runs
npm run test:e2e              # Run all tests (headless)
npm run test:e2e:ui           # Open UI mode (best for development)
npm run test:e2e:headed       # Run with visible browser
npm run test:e2e:debug        # Debug mode with inspector

# Browser-specific
npm run test:e2e:chromium     # Chrome/Edge only
npm run test:e2e:firefox      # Firefox only
npm run test:e2e:webkit       # Safari only

# View results
npm run test:e2e:report       # Open HTML report
```

## What Was Created

### Configuration
- `playwright.config.ts` - Main configuration file
  - Runs tests in `e2e/` directory
  - Tests Chromium, Firefox, WebKit, and mobile viewports
  - Auto-starts dev server on `http://localhost:5173`
  - Takes screenshots/videos on failure

### Test Files
- `e2e/quote-flow.spec.ts` - Full quote journey tests
  - Happy path scenarios (minimum, standard, premium coverage)
  - Navigation and back button flows
  - Form validation
  - Mobile responsive tests

- `e2e/api-integration.spec.ts` - Backend API tests
  - Quote creation (POST /api/v1/quotes)
  - Quote retrieval (GET /api/v1/quotes/:id)
  - Quote by reference number
  - Error handling
  - Performance testing (< 5s quote, < 500ms retrieval)
  - CORS validation

- `e2e/home-page.spec.ts` - Landing page tests
  - Page loading
  - "Get a Quote" CTA
  - Navigation
  - Accessibility basics

### Page Objects (Reusable Components)
- `e2e/pages/VehicleInfoPage.ts`
- `e2e/pages/DriverInfoPage.ts`
- `e2e/pages/CoverageSelectionPage.ts`
- `e2e/pages/QuoteResultsPage.ts`

### Test Data
- `e2e/fixtures/test-data.ts` - Reusable test vehicles, drivers, addresses, coverages

### Documentation
- `e2e/README.md` - Comprehensive testing guide
- `e2e/QUICK_START.md` - This file!

## Example: Running Specific Tests

```bash
# Run only quote flow tests
npx playwright test quote-flow

# Run only API tests
npx playwright test api-integration

# Run tests matching a pattern
npx playwright test --grep "happy path"

# Run a specific test
npx playwright test --grep "should complete full quote flow"
```

## Development Workflow

### 1. Writing Tests - Use UI Mode

```bash
npm run test:e2e:ui
```

This opens an interactive interface where you can:
- See tests run in real-time
- Step through each action
- Inspect page state
- See why tests fail

### 2. Debugging Tests

```bash
# Option 1: Debug mode
npm run test:e2e:debug

# Option 2: Add pause() to your test
test('my test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Execution stops here
});
```

### 3. Running Tests Before Commit

```bash
# Full test run
npm run test:e2e

# Quick smoke test (Chromium only)
npm run test:e2e:chromium
```

## Common Tasks

### Test a Single Browser

```bash
# Fast testing during development
npm run test:e2e:chromium

# Test Safari-specific issues
npm run test:e2e:webkit

# Test Firefox-specific issues
npm run test:e2e:firefox
```

### Update Selectors in Tests

If your component structure changes, update the page objects:

```typescript
// e2e/pages/VehicleInfoPage.ts
this.yearInput = page.locator('input[name="year"]');
//                            ↑ Update this selector
```

### Add New Test Data

```typescript
// e2e/fixtures/test-data.ts
export const testVehicles = {
  myNewVehicle: {
    year: '2022',
    make: 'Tesla',
    model: 'Model 3',
    vin: '5YJ3E1EA0LF123456',
  },
};
```

## Troubleshooting

### "No tests found"
- Make sure files end with `.spec.ts`
- Check they're in the `e2e/` directory
- Run `npx playwright test --list` to see what Playwright sees

### "Cannot find module"
```bash
npm install  # Reinstall dependencies
```

### "Browser not found"
```bash
npx playwright install  # Reinstall browsers
```

### Tests are flaky
- Add `await expect(element).toBeVisible()` before interacting
- Use `data-testid` attributes instead of CSS classes
- Check for race conditions (API calls completing)

### Different results locally vs CI
- Set environment variables consistently
- Check `playwright.config.ts` for CI-specific settings
- Look at screenshots/videos in test results

## Next Steps

1. **Run your first test**: `npm run test:e2e:ui`
2. **Explore test files**: Look at `e2e/quote-flow.spec.ts`
3. **Read the full guide**: `e2e/README.md`
4. **Add data-testid to components**: Makes tests more stable
5. **Write your first test**: Follow patterns in existing tests

## Key Testing Principles

✅ **DO:**
- Use Page Objects for reusable interactions
- Test user journeys, not implementation details
- Use `data-testid` attributes for stable selectors
- Keep tests independent
- Write descriptive test names

❌ **DON'T:**
- Test implementation details (like sessionStorage)
- Rely on CSS classes that might change
- Make tests depend on each other
- Use hardcoded waits (`page.waitForTimeout(5000)`)
- Copy-paste test code (use Page Objects instead)

## Resources

- Full guide: `e2e/README.md`
- Playwright docs: https://playwright.dev/
- VS Code extension: https://playwright.dev/docs/getting-started-vscode

## Questions?

- Check `e2e/README.md` for detailed guides
- See example tests in `e2e/*.spec.ts`
- Visit https://playwright.dev/docs/
