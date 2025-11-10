import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * TemplateService - Handles HTML template compilation and rendering using Handlebars
 *
 * Features:
 * - Compile Handlebars templates from file system
 * - Register custom helpers for formatting
 * - Render templates with policy data
 * - Template caching for performance
 *
 * Custom Helpers:
 * - formatCurrency: Format numbers as currency ($1,234.56)
 * - formatDate: Format dates (01/15/2025)
 * - formatAddress: Format address object as multi-line string
 * - toUpperCase: Convert string to uppercase
 * - formatPhoneNumber: Format phone as (555) 123-4567
 *
 * Feature: 003-portal-document-download
 */
@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private templateCache = new Map<string, HandlebarsTemplateDelegate>();
  private readonly templatesDir: string;

  constructor() {
    // Templates directory - handle both local dev and Vercel serverless
    // Local dev: process.cwd() = /path/to/project/backend
    // Vercel: process.cwd() = /var/task, templates at /var/task/backend/templates
    const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION;
    this.templatesDir = isVercel
      ? path.join(process.cwd(), 'backend', 'templates')
      : path.join(process.cwd(), 'templates');
    this.logger.log(`TemplateService initialized. Templates directory: ${this.templatesDir}`);
    this.registerCustomHelpers();
    this.logger.log('TemplateService initialized with custom Handlebars helpers');
  }

  /**
   * Register custom Handlebars helpers for template rendering
   */
  private registerCustomHelpers(): void {
    // Helper: Format currency ($1,234.56)
    Handlebars.registerHelper('formatCurrency', (amount: number): string => {
      if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0.00';
      }
      return `$${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    });

    // Helper: Format date (MM/DD/YYYY by default)
    Handlebars.registerHelper('formatDate', (date: Date | string, format?: string): string => {
      if (!date) return '';

      const dateObj = typeof date === 'string' ? new Date(date) : date;

      if (isNaN(dateObj.getTime())) {
        return '';
      }

      // Default format: MM/DD/YYYY
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const year = dateObj.getFullYear();

      if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
      }

      return `${month}/${day}/${year}`;
    });

    // Helper: Format address as multi-line string
    Handlebars.registerHelper('formatAddress', (address: any): string => {
      if (!address) return '';

      const lines: string[] = [];

      if (address.address_line_1) {
        lines.push(address.address_line_1);
      }

      if (address.address_line_2) {
        lines.push(address.address_line_2);
      }

      if (address.city && address.state_province && address.postal_code) {
        lines.push(`${address.city}, ${address.state_province} ${address.postal_code}`);
      }

      return lines.join('\n');
    });

    // Helper: Convert to uppercase
    Handlebars.registerHelper('toUpperCase', (str: string): string => {
      return str ? str.toUpperCase() : '';
    });

    // Helper: Format phone number as (555) 123-4567
    Handlebars.registerHelper('formatPhoneNumber', (phone: string): string => {
      if (!phone) return '';

      // Remove all non-numeric characters
      const cleaned = phone.replace(/\D/g, '');

      // Format as (XXX) XXX-XXXX
      if (cleaned.length === 10) {
        return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
      }

      // Return as-is if not 10 digits
      return phone;
    });

    this.logger.log('Registered 5 custom Handlebars helpers');
  }

  /**
   * Compile a template from file path
   * @param templatePath - Relative path to template file (e.g., 'declarations-page.hbs')
   * @returns Compiled Handlebars template function
   */
  async compileTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
    try {
      // Check cache first
      if (this.templateCache.has(templatePath)) {
        this.logger.debug(`Using cached template: ${templatePath}`);
        return this.templateCache.get(templatePath)!;
      }

      // Construct full path
      const fullPath = path.join(this.templatesDir, templatePath);

      // Read template file
      this.logger.log(`Compiling template: ${fullPath}`);
      const templateSource = await fs.readFile(fullPath, 'utf-8');

      // Compile with Handlebars
      const compiledTemplate = Handlebars.compile(templateSource, {
        strict: false, // Allow missing variables without throwing errors
        noEscape: false, // Escape HTML by default for security
      });

      // Cache compiled template
      this.templateCache.set(templatePath, compiledTemplate);

      this.logger.log(`Template compiled and cached: ${templatePath}`);
      return compiledTemplate;
    } catch (error) {
      this.logger.error(`Failed to compile template: ${templatePath}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to compile template: ${error.message}`,
      );
    }
  }

  /**
   * Render a template with data
   * @param templateName - Name of template file (e.g., 'declarations-page.hbs')
   * @param data - Data object to merge into template
   * @returns Rendered HTML string
   */
  async renderTemplate(templateName: string, data: object): Promise<string> {
    try {
      this.logger.log(`Rendering template: ${templateName}`);

      // Compile template (uses cache if available)
      const template = await this.compileTemplate(templateName);

      // Render with data
      const renderedHtml = template(data);

      this.logger.log(`Template rendered successfully: ${templateName} (${renderedHtml.length} bytes)`);
      return renderedHtml;
    } catch (error) {
      this.logger.error(`Failed to render template: ${templateName}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to render template: ${error.message}`,
      );
    }
  }

  /**
   * Clear template cache (useful for development/testing)
   */
  clearCache(): void {
    this.templateCache.clear();
    this.logger.log('Template cache cleared');
  }
}
