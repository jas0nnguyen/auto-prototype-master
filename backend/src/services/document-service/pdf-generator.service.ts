import { Injectable, Logger, OnModuleDestroy, InternalServerErrorException } from '@nestjs/common';
import type { Browser, Page } from 'playwright-core';

/**
 * PDF Generation Options
 */
export interface PDFOptions {
  format?: 'Letter' | 'A4' | 'Legal';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  landscape?: boolean;
  preferCSSPageSize?: boolean;
}

/**
 * PDFGeneratorService - Generates PDF documents from HTML using Playwright
 *
 * Features:
 * - Serverless-optimized PDF generation with Playwright + @sparticuz/chromium
 * - Browser instance reuse (warm instance pattern) for performance
 * - Health checks to ensure browser is operational
 * - Automatic retry logic with exponential backoff (3 attempts)
 * - Graceful cleanup on service destruction
 *
 * Usage:
 * ```typescript
 * const pdfBuffer = await pdfGenerator.generatePDF(htmlContent, {
 *   format: 'Letter',
 *   printBackground: true,
 * });
 * ```
 *
 * Environment Compatibility:
 * - Local development: Uses system-installed Chromium
 * - Vercel serverless: Uses @sparticuz/chromium for optimized bundle size
 * - AWS Lambda: Compatible with @sparticuz/chromium
 *
 * Important:
 * - Browser instance is reused for performance (warm instance pattern)
 * - Health checks prevent using crashed browsers
 * - Automatic retry with exponential backoff handles transient failures
 * - onModuleDestroy ensures graceful cleanup
 */
@Injectable()
export class PDFGeneratorService implements OnModuleDestroy {
  private readonly logger = new Logger(PDFGeneratorService.name);
  private browser: Browser | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

  /**
   * Generate a PDF from HTML content
   *
   * @param html - HTML content as string
   * @param options - PDF generation options (format, margins, etc.)
   * @returns PDF as Buffer
   * @throws InternalServerErrorException if generation fails after all retries
   *
   * @example
   * const html = `
   *   <!DOCTYPE html>
   *   <html>
   *     <body>
   *       <h1>Policy Declarations</h1>
   *       <p>Policy Number: DZPV12345678</p>
   *     </body>
   *   </html>
   * `;
   * const pdfBuffer = await pdfGenerator.generatePDF(html, { format: 'Letter' });
   */
  async generatePDF(html: string, options: PDFOptions = {}): Promise<Buffer> {
    this.logger.log('Starting PDF generation with retry logic');

    let lastError: Error | null = null;

    // Retry logic: attempt PDF generation up to MAX_RETRIES times with exponential backoff
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        this.logger.debug(`PDF generation attempt ${attempt}/${this.MAX_RETRIES}`);

        // Generate PDF (will create/reuse browser instance)
        const pdfBuffer = await this.generatePDFInternal(html, options);

        this.logger.log(`PDF generated successfully on attempt ${attempt}`);
        return pdfBuffer;
      } catch (error) {
        lastError = error as Error;
        this.logger.error(
          `PDF generation attempt ${attempt}/${this.MAX_RETRIES} failed: ${error.message}`,
          error.stack,
        );

        // If browser launch failed or page crashed, close the browser to force recreation
        if (
          error.message?.includes('browser') ||
          error.message?.includes('launch') ||
          error.message?.includes('crash') ||
          error.message?.includes('timeout')
        ) {
          this.logger.warn('Browser error detected, closing browser instance for fresh start');
          await this.closeBrowser();
        }

        // Exponential backoff: wait before retry (except on last attempt)
        if (attempt < this.MAX_RETRIES) {
          const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
          this.logger.debug(`Waiting ${delay}ms before retry ${attempt + 1}`);
          await this.delay(delay);
        }
      }
    }

    // All retries failed
    this.logger.error(`PDF generation failed after ${this.MAX_RETRIES} attempts`, lastError?.stack);
    throw new InternalServerErrorException(
      `Failed to generate PDF after ${this.MAX_RETRIES} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Internal PDF generation method (without retry logic)
   * Handles browser lifecycle and PDF rendering
   *
   * @private
   */
  private async generatePDFInternal(html: string, options: PDFOptions): Promise<Buffer> {
    let page: Page | null = null;

    try {
      // Get or create browser instance
      const browser = await this.getBrowser();

      // Create new page
      page = await browser.newPage();

      // Set HTML content
      await page.setContent(html, {
        waitUntil: 'networkidle', // Wait for network to be idle
        timeout: 30000, // 30 second timeout
      });

      // Generate PDF with options
      const pdfBuffer = await page.pdf({
        format: options.format || 'Letter',
        margin: options.margin || {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in',
        },
        printBackground: options.printBackground !== false, // Default true
        landscape: options.landscape || false,
        preferCSSPageSize: options.preferCSSPageSize || false,
      });

      this.logger.debug(`PDF generated: ${pdfBuffer.length} bytes`);

      // Close page to free resources
      await page.close();

      return Buffer.from(pdfBuffer);
    } catch (error) {
      // Ensure page is closed on error
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          this.logger.error('Failed to close page after error', closeError);
        }
      }

      throw error;
    }
  }

  /**
   * Get or create browser instance (warm instance pattern)
   * Reuses existing browser if healthy, otherwise creates new one
   *
   * @private
   */
  private async getBrowser(): Promise<Browser> {
    // If browser exists, check if it's healthy
    if (this.browser) {
      const isHealthy = await this.checkBrowserHealth(this.browser);

      if (isHealthy) {
        this.logger.debug('Reusing existing browser instance');
        return this.browser;
      } else {
        this.logger.warn('Browser health check failed, creating new instance');
        await this.closeBrowser();
      }
    }

    // Create new browser instance
    this.logger.log('Launching new browser instance');
    this.browser = await this.launchBrowser();
    return this.browser;
  }

  /**
   * Launch Playwright browser with serverless configuration
   * Supports both local development and serverless environments (Vercel, AWS Lambda)
   *
   * @private
   */
  private async launchBrowser(): Promise<Browser> {
    try {
      // Detect serverless environment
      const isServerless = process.env.VERCEL || process.env.AWS_EXECUTION_ENV;

      if (isServerless) {
        this.logger.log('Detected serverless environment, using @sparticuz/chromium');

        // Dynamic import to avoid bundling issues in local development
        const chromium = await import('@sparticuz/chromium');
        const playwright = await import('playwright-core');

        return await playwright.chromium.launch({
          executablePath: await chromium.default.executablePath(),
          args: chromium.default.args,
          headless: true,
        });
      } else {
        this.logger.log('Local development environment, using system Chromium');

        // Use regular playwright for local development
        const playwright = await import('playwright-core');

        return await playwright.chromium.launch({
          headless: true,
        });
      }
    } catch (error) {
      this.logger.error('Failed to launch browser', error);
      throw new InternalServerErrorException(`Failed to launch browser: ${error.message}`);
    }
  }

  /**
   * Check if browser is healthy by attempting to create and close a page
   * This ensures the browser hasn't crashed or become unresponsive
   *
   * @private
   */
  private async checkBrowserHealth(browser: Browser): Promise<boolean> {
    try {
      this.logger.debug('Performing browser health check');

      // Try to create a page and navigate to a simple data URL
      const page = await browser.newPage();
      await page.goto('data:text/html,<h1>Health Check</h1>', {
        timeout: 5000, // 5 second timeout for health check
      });
      await page.close();

      this.logger.debug('Browser health check passed');
      return true;
    } catch (error) {
      this.logger.warn('Browser health check failed', error.message);
      return false;
    }
  }

  /**
   * Close browser instance and clean up resources
   *
   * @private
   */
  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      try {
        this.logger.debug('Closing browser instance');
        await this.browser.close();
      } catch (error) {
        this.logger.error('Error closing browser', error);
      } finally {
        this.browser = null;
      }
    }
  }

  /**
   * NestJS lifecycle hook: Clean up resources when service is destroyed
   * Ensures browser is closed when the application shuts down
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('PDFGeneratorService is being destroyed, cleaning up resources');
    await this.closeBrowser();
  }

  /**
   * Helper: Delay execution for a given number of milliseconds
   * Used for exponential backoff in retry logic
   *
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
