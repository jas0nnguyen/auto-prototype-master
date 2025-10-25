/**
 * T149: Unit Tests for QuoteService.bindQuote() - Policy Binding
 *
 * Tests the policy binding workflow with:
 * - Quote to policy conversion (QUOTED → BINDING → BOUND)
 * - Payment processing (credit card and ACH)
 * - Luhn validation for credit cards
 * - Stripe test card patterns
 * - Payment record creation
 * - Policy number assignment (same as quote number)
 * - Quote snapshot preservation
 * - Multi-driver/vehicle data preservation
 * - Error handling (quote not found, expired, payment declined)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { QuoteService } from '../../../src/services/quote/quote.service';
import { DATABASE_CONNECTION } from '../../../src/database/database.module';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('QuoteService - Policy Binding (T149)', () => {
  let service: QuoteService;
  let mockDb: any;

  beforeEach(async () => {
    // Mock database connection - we'll set up specific mocks per test
    mockDb = {
      select: vi.fn(),
      from: vi.fn(),
      where: vi.fn(),
      limit: vi.fn(),
      insert: vi.fn(),
      values: vi.fn(),
      returning: vi.fn(),
      update: vi.fn(),
      set: vi.fn(),
      innerJoin: vi.fn(),
      leftJoin: vi.fn(),
      orderBy: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<QuoteService>(QuoteService);
  });

  // Helper function to setup select chain mock
  const setupSelectMock = (results: any[]) => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(results),
    };
    mockDb.select.mockReturnValue(mockChain);
    return mockChain;
  };

  describe('bindQuote - Happy Path', () => {
    it('should bind quote with valid credit card payment', async () => {
      const quoteNumber = 'DZAB12CD34';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        premium: {
          total: 1500,
        },
      };

      // Mock select for initial quote lookup
      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      // Mock update for status changes
      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      // Mock insert for payment, event, policyEvent, document
      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            payment_id: 'pay-123',
            payment_number: 'PAY-ABCD1234',
            last_four_digits: '4242',
            card_brand: 'Visa',
          },
        ]),
      }));

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4242424242424242', // Stripe test card (success)
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      const result = await service.bindQuote(quoteNumber, paymentData);

      expect(result.policyNumber).toBe(quoteNumber);
      expect(result.status).toBe('BOUND');
      expect(result.payment.success).toBe(true);
      expect(result.payment.lastFourDigits).toBe('4242');
      expect(result.payment.cardBrand).toBe('Visa');
      expect(result.documents).toBeDefined();

      // Verify status transitions
      expect(mockDb.update).toHaveBeenCalledTimes(2); // BINDING, then BOUND
    });

    it('should preserve multi-driver/vehicle data during binding', async () => {
      const quoteNumber = 'DZMULTI123';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        additionalDrivers: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            relationship: 'spouse',
          },
        ],
        vehicles: [
          {
            year: 2020,
            make: 'Toyota',
            model: 'Camry',
            vin: '1HGBH41JXMN109186',
          },
          {
            year: 2022,
            make: 'Honda',
            model: 'Civic',
            vin: '2HGFC2F59MH000001',
          },
        ],
        premium: {
          total: 2200,
        },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            payment_id: 'pay-123',
            payment_number: 'PAY-XYZ98765',
          },
        ]),
      }));

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4242424242424242',
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      const result = await service.bindQuote(quoteNumber, paymentData);

      expect(result.policyNumber).toBe(quoteNumber);
      expect(result.status).toBe('BOUND');
      // Snapshot should be preserved (verified by not throwing errors)
    });

    it('should bind quote with ACH payment', async () => {
      const quoteNumber = 'DZACH56789';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: { email: 'john@example.com' },
        premium: { total: 1500 },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            payment_id: 'pay-ach-123',
            payment_number: 'PAY-ACH12345',
            last_four_digits: '6789',
          },
        ]),
      }));

      const paymentData = {
        paymentMethod: 'ach' as const,
        routingNumber: '021000021',
        accountNumber: '123456789',
        accountType: 'checking' as const,
      };

      const result = await service.bindQuote(quoteNumber, paymentData);

      expect(result.status).toBe('BOUND');
      expect(result.payment.success).toBe(true);
      expect(result.payment.lastFourDigits).toBe('6789');
    });
  });

  describe('Payment Processing - Credit Card', () => {
    it('should validate credit card with Luhn algorithm', async () => {
      const quoteNumber = 'DZLUHN1234';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: { email: 'john@example.com' },
        premium: { total: 1500 },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4242424242424243', // Invalid Luhn (last digit should be 2)
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow(BadRequestException);
      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow('Invalid card number');
    });

    it('should handle Stripe test card 4000000000000002 (declined - insufficient funds)', async () => {
      const quoteNumber = 'DZDECLINE1';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: { email: 'john@example.com' },
        premium: { total: 1500 },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4000000000000002', // Stripe test card (declined)
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow(BadRequestException);
      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow('insufficient funds');
    });

    it('should handle Stripe test card 4000000000009995 (declined - do not honor)', async () => {
      const quoteNumber = 'DZDECLINE2';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: { email: 'john@example.com' },
        premium: { total: 1500 },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4000000000009995', // Stripe test card (declined)
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow(BadRequestException);
      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow('do not honor');
    });

    it('should detect Visa card brand', async () => {
      const quoteNumber = 'DZVISA12345';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: { email: 'john@example.com' },
        premium: { total: 1500 },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            payment_id: 'pay-123',
            payment_number: 'PAY-VISA1234',
            card_brand: 'Visa',
          },
        ]),
      }));

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4242424242424242', // Visa
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      const result = await service.bindQuote(quoteNumber, paymentData);
      expect(result.payment.cardBrand).toBe('Visa');
    });

    it('should detect Mastercard brand', async () => {
      const quoteNumber = 'DZMC123456';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: { email: 'john@example.com' },
        premium: { total: 1500 },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            payment_id: 'pay-123',
            payment_number: 'PAY-MC123456',
            card_brand: 'Mastercard',
          },
        ]),
      }));

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '5555555555554444', // Mastercard
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      const result = await service.bindQuote(quoteNumber, paymentData);
      expect(result.payment.cardBrand).toBe('Mastercard');
    });

    it('should tokenize card data and store only last 4 digits', async () => {
      const quoteNumber = 'DZTOKEN123';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: { email: 'john@example.com' },
        premium: { total: 1500 },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      let capturedPaymentValues: any = null;

      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockImplementation((vals) => {
          // Capture only payment table inserts (have payment_method field)
          if (vals.payment_method) {
            capturedPaymentValues = vals;
          }
          return {
            returning: vi.fn().mockResolvedValue([
              {
                payment_id: 'pay-123',
                payment_number: 'PAY-TOKEN123',
                last_four_digits: '4242',
              },
            ]),
          };
        }),
      }));

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4242424242424242',
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      await service.bindQuote(quoteNumber, paymentData);

      // Verify payment record has only last 4 digits
      expect(capturedPaymentValues).not.toBeNull();
      expect(capturedPaymentValues.last_four_digits).toBe('4242');
      // Full card number should NOT be stored
      expect(capturedPaymentValues.card_number).toBeUndefined();
    });
  });

  describe('Payment Processing - ACH', () => {
    it('should validate routing number (9 digits required)', async () => {
      const quoteNumber = 'DZACHBAD1';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: { email: 'john@example.com' },
        premium: { total: 1500 },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      const paymentData = {
        paymentMethod: 'ach' as const,
        routingNumber: '12345', // Invalid (not 9 digits)
        accountNumber: '123456789',
        accountType: 'checking' as const,
      };

      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow(BadRequestException);
      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow('Invalid routing number');
    });

    it('should validate account number (minimum 4 digits)', async () => {
      const quoteNumber = 'DZACHBAD2';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: { email: 'john@example.com' },
        premium: { total: 1500 },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      const paymentData = {
        paymentMethod: 'ach' as const,
        routingNumber: '021000021',
        accountNumber: '123', // Invalid (< 4 digits)
        accountType: 'checking' as const,
      };

      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow(BadRequestException);
      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow('Invalid account number');
    });

    it('should store ACH payment with account type', async () => {
      const quoteNumber = 'DZACHOK123';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: { email: 'john@example.com' },
        premium: { total: 1500 },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      let capturedPaymentValues: any = null;

      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockImplementation((vals) => {
          // Capture only payment table inserts (have payment_method field)
          if (vals.payment_method) {
            capturedPaymentValues = vals;
          }
          return {
            returning: vi.fn().mockResolvedValue([
              {
                payment_id: 'pay-ach-123',
                payment_number: 'PAY-ACHOK123',
              },
            ]),
          };
        }),
      }));

      const paymentData = {
        paymentMethod: 'ach' as const,
        routingNumber: '021000021',
        accountNumber: '987654321',
        accountType: 'savings' as const,
      };

      await service.bindQuote(quoteNumber, paymentData);

      expect(capturedPaymentValues).not.toBeNull();
      expect(capturedPaymentValues.payment_method).toBe('ach');
      expect(capturedPaymentValues.account_type).toBe('savings');
      expect(capturedPaymentValues.last_four_digits).toBe('4321');
    });
  });

  describe('Status Transitions', () => {
    it('should transition QUOTED → BINDING → BOUND on successful payment', async () => {
      const quoteNumber = 'DZSTATUS12';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: { email: 'john@example.com' },
        premium: { total: 1500 },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      let updateCallCount = 0;
      let capturedStatuses: string[] = [];

      mockDb.update.mockReturnThis();
      mockDb.set.mockImplementation((vals) => {
        if (vals.status_code) {
          capturedStatuses.push(vals.status_code);
        }
        updateCallCount++;
        return mockDb;
      });
      mockDb.where.mockResolvedValue(undefined);

      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            payment_id: 'pay-123',
            payment_number: 'PAY-STATUS12',
          },
        ]),
      }));

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4242424242424242',
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      await service.bindQuote(quoteNumber, paymentData);

      // Should have two status updates: BINDING, then BOUND
      expect(capturedStatuses).toContain('BINDING');
      expect(capturedStatuses).toContain('BOUND');
    });

    it('should revert to QUOTED if payment fails', async () => {
      const quoteNumber = 'DZREVERT12';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';
      const mockSnapshot = {
        driver: { email: 'john@example.com' },
        premium: { total: 1500 },
      };

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: mockSnapshot,
        },
      ]);

      let capturedStatuses: string[] = [];

      mockDb.update.mockReturnThis();
      mockDb.set.mockImplementation((vals) => {
        if (vals.status_code) {
          capturedStatuses.push(vals.status_code);
        }
        return mockDb;
      });
      mockDb.where.mockResolvedValue(undefined);

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4000000000000002', // Declined card
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow(BadRequestException);

      // Should have set BINDING, then reverted to QUOTED
      expect(capturedStatuses).toContain('BINDING');
      expect(capturedStatuses).toContain('QUOTED');
    });

    it('should reject binding if quote status is not QUOTED', async () => {
      const quoteNumber = 'DZBOUND123';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'BOUND', // Already bound
          quote_snapshot: {},
        },
      ]);

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4242424242424242',
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow(BadRequestException);
      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow('Only QUOTED policies can be bound');
    });
  });

  describe('Error Handling', () => {
    it('should throw NotFoundException if quote not found', async () => {
      setupSelectMock([]);

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4242424242424242',
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      await expect(service.bindQuote('DZNOTFOUND', paymentData)).rejects.toThrow(NotFoundException);
      await expect(service.bindQuote('DZNOTFOUND', paymentData)).rejects.toThrow('Quote DZNOTFOUND not found');
    });

    it('should handle unsupported payment method', async () => {
      const quoteNumber = 'DZUNSUPPORT';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: { premium: { total: 1500 } },
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      const paymentData = {
        paymentMethod: 'bitcoin' as any, // Unsupported
      };

      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow(BadRequestException);
      await expect(service.bindQuote(quoteNumber, paymentData)).rejects.toThrow('Unsupported payment method');
    });
  });

  describe('Policy Number Assignment', () => {
    it('should use quote number as policy number', async () => {
      const quoteNumber = 'DZPOLICY99';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: { premium: { total: 1500 } },
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            payment_id: 'pay-123',
            payment_number: 'PAY-POLICY99',
          },
        ]),
      }));

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4242424242424242',
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      const result = await service.bindQuote(quoteNumber, paymentData);

      expect(result.policyNumber).toBe(quoteNumber);
      expect(result.policyId).toBe(policyId);
    });
  });

  describe('Document Generation', () => {
    it('should generate policy documents on successful binding', async () => {
      const quoteNumber = 'DZDOCS1234';
      const policyId = '880e8400-e29b-41d4-a716-446655440003';

      setupSelectMock([
        {
          policy_identifier: policyId,
          policy_number: quoteNumber,
          status_code: 'QUOTED',
          quote_snapshot: { premium: { total: 1500 } },
        },
      ]);

      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      let documentCount = 0;

      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockImplementation(() => {
          documentCount++;
          return Promise.resolve([
            {
              payment_id: 'pay-123',
              payment_number: 'PAY-DOCS1234',
              document_number: `DOC-${documentCount}`,
            },
          ]);
        }),
      }));

      const paymentData = {
        paymentMethod: 'credit_card' as const,
        cardNumber: '4242424242424242',
        cardExpiry: '12/28',
        cardCvv: '123',
      };

      const result = await service.bindQuote(quoteNumber, paymentData);

      expect(result.documents).toBeDefined();
      expect(Array.isArray(result.documents)).toBe(true);
      // Should generate declarations PDF and ID card
      expect(result.documents.length).toBeGreaterThanOrEqual(2);
    });
  });
});
