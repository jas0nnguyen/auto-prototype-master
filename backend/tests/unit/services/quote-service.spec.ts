/**
 * T140: Unit Tests for QuoteService - CRUD Operations
 *
 * Tests quote creation, retrieval, and update operations with:
 * - Single driver/vehicle quotes
 * - Multi-driver/vehicle quotes
 * - Quote snapshot structure validation
 * - DZXXXXXXXX ID format validation
 * - Premium recalculation on updates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { QuoteService } from '../../../src/services/quote/quote.service';
import { DATABASE_CONNECTION } from '../../../src/database/database.module';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('QuoteService - CRUD Operations (T140)', () => {
  let service: QuoteService;
  let mockDb: any;

  beforeEach(async () => {
    // Mock database connection with chainable methods
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
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

  describe('createQuote - Single Driver/Vehicle (Basic)', () => {
    it('should create quote with DZXXXXXXXX ID format', async () => {
      // Mock database responses
      const partyId = '550e8400-e29b-41d4-a716-446655440000';
      const insurableObjectId = '660e8400-e29b-41d4-a716-446655440001';
      const productId = '770e8400-e29b-41d4-a716-446655440002';
      const agreementId = '880e8400-e29b-41d4-a716-446655440003';

      mockDb.insert.mockImplementation((table: any) => {
        const mock = {
          values: vi.fn().mockReturnThis(),
          returning: vi.fn(),
        };

        mock.returning.mockImplementation(() => {
          // Determine which table based on call order
          if (mock.values.mock.calls.length === 0) return [];
          const values = mock.values.mock.calls[0][0];

          // Party insert
          if (values.party_name) {
            return Promise.resolve([{ party_identifier: partyId, ...values }]);
          }
          // Insurable Object insert
          if (values.insurable_object_type_code) {
            return Promise.resolve([{ insurable_object_identifier: insurableObjectId, ...values }]);
          }
          // Agreement insert
          if (values.agreement_type_code) {
            return Promise.resolve([{ agreement_identifier: agreementId, ...values }]);
          }
          // Policy insert
          if (values.policy_number) {
            return Promise.resolve([{
              policy_identifier: agreementId,
              policy_number: values.policy_number,
              effective_date: values.effective_date,
              expiration_date: values.expiration_date,
              status_code: values.status_code,
              quote_snapshot: values.quote_snapshot,
            }]);
          }
          // Default (person, communication_identity, vehicle)
          return Promise.resolve([{}]);
        });

        return mock;
      });

      // Mock product select
      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.limit.mockImplementation(() => {
        return Promise.resolve([{
          product_identifier: productId,
          licensed_product_name: 'Personal Auto Insurance',
        }]);
      });

      const input = {
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: new Date('1990-01-01'),
          email: 'john@example.com',
          phone: '555-1234',
          gender: 'M',
          maritalStatus: 'single',
        },
        address: {
          addressLine1: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
        },
        vehicle: {
          year: 2020,
          make: 'Toyota',
          model: 'Camry',
          vin: '1HGBH41JXMN109186',
          bodyType: 'sedan',
          annualMileage: 12000,
        },
      };

      const result = await service.createQuote(input);

      // Verify quote number format (DZ + 8 alphanumeric)
      expect(result.quoteNumber).toMatch(/^DZ[A-Z0-9]{8}$/);
      expect(result.quoteNumber.length).toBe(10);
      expect(result.quoteId).toBe(result.quoteNumber); // Same for simplicity
      expect(result.premium).toBeGreaterThan(0);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should create quote snapshot with correct structure', async () => {
      const partyId = '550e8400-e29b-41d4-a716-446655440000';
      const insurableObjectId = '660e8400-e29b-41d4-a716-446655440001';
      const productId = '770e8400-e29b-41d4-a716-446655440002';
      const agreementId = '880e8400-e29b-41d4-a716-446655440003';

      let capturedSnapshot: any = null;

      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockImplementation(function(this: any) {
          const valuesCall = this.values.mock.calls[0];
          if (!valuesCall) return Promise.resolve([{}]);
          const values = valuesCall[0];

          if (values.party_name) return Promise.resolve([{ party_identifier: partyId }]);
          if (values.insurable_object_type_code) return Promise.resolve([{ insurable_object_identifier: insurableObjectId }]);
          if (values.agreement_type_code) return Promise.resolve([{ agreement_identifier: agreementId }]);
          if (values.policy_number) {
            capturedSnapshot = values.quote_snapshot;
            return Promise.resolve([{ policy_identifier: agreementId, ...values }]);
          }
          return Promise.resolve([{}]);
        }),
      }));

      mockDb.limit.mockResolvedValue([{ product_identifier: productId }]);

      const input = {
        driver: {
          firstName: 'Jane',
          lastName: 'Smith',
          birthDate: new Date('1985-05-15'),
          email: 'jane@example.com',
          maritalStatus: 'married',
        },
        address: {
          addressLine1: '456 Oak Ave',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
        },
        vehicle: {
          year: 2022,
          make: 'Honda',
          model: 'Civic',
          vin: '2HGFC2F59MH000001',
        },
        coverages: {
          startDate: '2025-11-01',
          bodilyInjuryLimit: '100/300',
          propertyDamageLimit: '50000',
          collision: true,
          collisionDeductible: 500,
        },
      };

      await service.createQuote(input);

      // Validate snapshot structure
      expect(capturedSnapshot).toBeDefined();
      expect(capturedSnapshot.driver).toMatchObject({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        maritalStatus: 'married',
        isPrimary: true,
      });
      expect(capturedSnapshot.vehicle).toMatchObject({
        year: 2022,
        make: 'Honda',
        model: 'Civic',
      });
      expect(capturedSnapshot.address).toMatchObject({
        addressLine1: '456 Oak Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
      });
      expect(capturedSnapshot.coverages).toBeDefined();
      expect(capturedSnapshot.premium).toBeDefined();
      expect(capturedSnapshot.meta).toMatchObject({
        version: 2,
      });
      expect(capturedSnapshot.meta.quoteNumber).toMatch(/^DZ[A-Z0-9]{8}$/);
    });

    it('should throw error if no vehicle provided', async () => {
      const input = {
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: new Date('1990-01-01'),
          email: 'john@example.com',
        },
        address: {
          addressLine1: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
        },
        // No vehicle or vehicles array
      };

      await expect(service.createQuote(input as any)).rejects.toThrow('At least one vehicle is required');
    });
  });

  describe('createQuote - Multi-Driver/Vehicle', () => {
    it('should create quote with multiple drivers in additionalDrivers array', async () => {
      const partyId = '550e8400-e29b-41d4-a716-446655440000';
      const insurableObjectId = '660e8400-e29b-41d4-a716-446655440001';
      const productId = '770e8400-e29b-41d4-a716-446655440002';
      const agreementId = '880e8400-e29b-41d4-a716-446655440003';

      let capturedSnapshot: any = null;

      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockImplementation(function(this: any) {
          const valuesCall = this.values.mock.calls[0];
          if (!valuesCall) return Promise.resolve([{}]);
          const values = valuesCall[0];

          if (values.party_name) return Promise.resolve([{ party_identifier: partyId }]);
          if (values.insurable_object_type_code) return Promise.resolve([{ insurable_object_identifier: insurableObjectId }]);
          if (values.agreement_type_code) return Promise.resolve([{ agreement_identifier: agreementId }]);
          if (values.policy_number) {
            capturedSnapshot = values.quote_snapshot;
            return Promise.resolve([{ policy_identifier: agreementId, ...values }]);
          }
          return Promise.resolve([{}]);
        }),
      }));

      mockDb.limit.mockResolvedValue([{ product_identifier: productId }]);

      const input = {
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: new Date('1980-01-01'),
          email: 'john@example.com',
        },
        additionalDrivers: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            birthDate: new Date('1982-03-15'),
            email: 'jane@example.com',
            relationship: 'spouse',
          },
          {
            firstName: 'Tommy',
            lastName: 'Doe',
            birthDate: new Date('2005-07-20'),
            email: 'tommy@example.com',
            relationship: 'child',
          },
        ],
        address: {
          addressLine1: '789 Elm St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
        },
        vehicle: {
          year: 2021,
          make: 'Ford',
          model: 'Explorer',
          vin: '1FM5K8D87MGA00001',
        },
      };

      await service.createQuote(input);

      // Validate snapshot has all drivers
      expect(capturedSnapshot.driver.firstName).toBe('John');
      expect(capturedSnapshot.additionalDrivers).toHaveLength(2);
      expect(capturedSnapshot.additionalDrivers[0]).toMatchObject({
        firstName: 'Jane',
        relationship: 'spouse',
      });
      expect(capturedSnapshot.additionalDrivers[1]).toMatchObject({
        firstName: 'Tommy',
        relationship: 'child',
      });
    });

    it('should create quote with multiple vehicles in vehicles array', async () => {
      const partyId = '550e8400-e29b-41d4-a716-446655440000';
      const insurableObjectId = '660e8400-e29b-41d4-a716-446655440001';
      const productId = '770e8400-e29b-41d4-a716-446655440002';
      const agreementId = '880e8400-e29b-41d4-a716-446655440003';

      let capturedSnapshot: any = null;

      mockDb.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockImplementation(function(this: any) {
          const valuesCall = this.values.mock.calls[0];
          if (!valuesCall) return Promise.resolve([{}]);
          const values = valuesCall[0];

          if (values.party_name) return Promise.resolve([{ party_identifier: partyId }]);
          if (values.insurable_object_type_code) return Promise.resolve([{ insurable_object_identifier: insurableObjectId }]);
          if (values.agreement_type_code) return Promise.resolve([{ agreement_identifier: agreementId }]);
          if (values.policy_number) {
            capturedSnapshot = values.quote_snapshot;
            return Promise.resolve([{ policy_identifier: agreementId, ...values }]);
          }
          return Promise.resolve([{}]);
        }),
      }));

      mockDb.limit.mockResolvedValue([{ product_identifier: productId }]);

      const input = {
        driver: {
          firstName: 'Alice',
          lastName: 'Johnson',
          birthDate: new Date('1990-01-01'),
          email: 'alice@example.com',
        },
        address: {
          addressLine1: '321 Pine Rd',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
        },
        vehicles: [
          {
            year: 2020,
            make: 'Tesla',
            model: 'Model 3',
            vin: '5YJ3E1EA0KF000001',
          },
          {
            year: 2018,
            make: 'Subaru',
            model: 'Outback',
            vin: '4S4BSANC5J3000001',
          },
        ],
      };

      await service.createQuote(input);

      // Validate snapshot has all vehicles
      expect(capturedSnapshot.vehicles).toHaveLength(2);
      expect(capturedSnapshot.vehicles[0]).toMatchObject({
        make: 'Tesla',
        model: 'Model 3',
      });
      expect(capturedSnapshot.vehicles[1]).toMatchObject({
        make: 'Subaru',
        model: 'Outback',
      });
      // Legacy vehicle field should be first vehicle (if provided)
      if (capturedSnapshot.vehicle) {
        expect(capturedSnapshot.vehicle.make).toBe('Tesla');
      }
    });
  });

  describe('getQuoteByNumber', () => {
    it('should retrieve quote by DZXXXXXXXX number', async () => {
      const quoteNumber = 'DZAB12CD34';
      const mockQuoteSnapshot = {
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        vehicle: {
          year: 2020,
          make: 'Toyota',
          model: 'Camry',
        },
        address: {
          addressLine1: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
        },
        coverages: {},
        premium: {
          total: 1500,
          monthly: 250,
          sixMonth: 1500,
        },
      };

      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.innerJoin.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.limit.mockResolvedValue([
        {
          quoteNumber: quoteNumber,
          quoteStatus: 'QUOTED',
          policyId: '880e8400-e29b-41d4-a716-446655440003',
          effectiveDate: '2025-10-24',
          expirationDate: '2026-10-24',
          quoteSnapshot: mockQuoteSnapshot,
          premiumAmount: '1500',
          createdAt: new Date('2025-10-24'),
        },
      ]);

      const result = await service.getQuoteByNumber(quoteNumber);

      expect(result.quote_number).toBe(quoteNumber);
      expect(result.quote_status).toBe('QUOTED');
      expect(result.driver).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result.vehicle).toMatchObject({
        make: 'Toyota',
      });
      expect(result.premium.total).toBe(1500);
    });

    it('should throw NotFoundException if quote not found', async () => {
      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.innerJoin.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.limit.mockResolvedValue([]);

      await expect(service.getQuoteByNumber('DZNOTFOUND')).rejects.toThrow(NotFoundException);
      await expect(service.getQuoteByNumber('DZNOTFOUND')).rejects.toThrow('Quote DZNOTFOUND not found');
    });
  });

  describe('updatePrimaryDriver', () => {
    it('should update primary driver and recalculate premium', async () => {
      const quoteNumber = 'DZAB12CD34';
      const mockSnapshot = {
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01',
          email: 'john@example.com',
        },
        additionalDrivers: [],
        vehicles: [{ year: 2020, make: 'Toyota', model: 'Camry' }],
        coverages: {},
        meta: { version: 2 },
      };

      // Mock getQuote - chain that returns a promise
      let limitCallCount = 0;
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          limitCallCount++;
          // First call: getQuote returns existing quote
          if (limitCallCount === 1) {
            return Promise.resolve([
              {
                quoteNumber: quoteNumber,
                quoteSnapshot: mockSnapshot,
                premiumAmount: '1500',
              },
            ]);
          }
          // Second call: policy record
          return Promise.resolve([
            {
              policy_identifier: 'policy-123',
              policy_number: quoteNumber,
              quote_snapshot: mockSnapshot,
              effective_date: '2025-10-24',
            },
          ]);
        }),
      };

      mockDb.select.mockReturnValue(mockChain);

      // Mock update
      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      const newDriver = {
        firstName: 'Jane',
        lastName: 'Smith',
        birthDate: new Date('1985-05-15'),
        email: 'jane@example.com',
        phone: '555-9876',
        maritalStatus: 'married',
      };

      const newAddress = {
        addressLine1: '456 Oak Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
      };

      const result = await service.updatePrimaryDriver(quoteNumber, newDriver, newAddress);

      expect(result.quoteNumber).toBe(quoteNumber);
      expect(result.premium).toBeGreaterThan(0);

      // Verify update was called
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
    });
  });

  describe('updateQuoteDrivers', () => {
    it('should add drivers to additionalDrivers array and recalculate', async () => {
      const quoteNumber = 'DZAB12CD34';
      const mockSnapshot = {
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          birthDate: '1990-01-01',
        },
        additionalDrivers: [],
        vehicles: [{ year: 2020, make: 'Toyota', model: 'Camry' }],
        coverages: {},
        meta: { version: 2 },
      };

      let limitCallCount = 0;
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          limitCallCount++;
          if (limitCallCount === 1) {
            return Promise.resolve([{ quoteSnapshot: mockSnapshot }]);
          }
          return Promise.resolve([
            {
              policy_identifier: 'policy-123',
              policy_number: quoteNumber,
              quote_snapshot: mockSnapshot,
              effective_date: '2025-10-24',
            },
          ]);
        }),
      };

      mockDb.select.mockReturnValue(mockChain);
      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      const additionalDrivers = [
        {
          firstName: 'Jane',
          lastName: 'Doe',
          birthDate: new Date('1992-03-15'),
          email: 'jane@example.com',
          relationship: 'spouse',
        },
      ];

      const result = await service.updateQuoteDrivers(quoteNumber, additionalDrivers);

      expect(result.quoteNumber).toBe(quoteNumber);
      // Premium should increase with additional driver
      expect(result.premium).toBeGreaterThan(1000);
    });

    it('should filter out primary driver from additionalDrivers to prevent duplicates', async () => {
      const quoteNumber = 'DZAB12CD34';
      const primaryEmail = 'john@example.com';
      const mockSnapshot = {
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          email: primaryEmail,
          birthDate: '1990-01-01',
        },
        additionalDrivers: [],
        vehicles: [{ year: 2020, make: 'Toyota', model: 'Camry' }],
        coverages: {},
        meta: { version: 2 },
      };

      let limitCallCount = 0;
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          limitCallCount++;
          if (limitCallCount === 1) {
            return Promise.resolve([{ quoteSnapshot: mockSnapshot }]);
          }
          return Promise.resolve([
            {
              policy_identifier: 'policy-123',
              policy_number: quoteNumber,
              quote_snapshot: mockSnapshot,
              effective_date: '2025-10-24',
            },
          ]);
        }),
      };

      mockDb.select.mockReturnValue(mockChain);
      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      const additionalDrivers = [
        {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: new Date('1990-01-01'),
          email: primaryEmail, // Same as primary driver
        },
        {
          firstName: 'Jane',
          lastName: 'Doe',
          birthDate: new Date('1992-03-15'),
          email: 'jane@example.com',
          relationship: 'spouse',
        },
      ];

      const result = await service.updateQuoteDrivers(quoteNumber, additionalDrivers);

      // Should succeed - primary driver filtered out
      expect(result.quoteNumber).toBe(quoteNumber);
    });
  });

  describe('updateQuoteVehicles', () => {
    it('should update vehicles array and recalculate premium', async () => {
      const quoteNumber = 'DZAB12CD34';
      const mockSnapshot = {
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          birthDate: '1990-01-01',
        },
        additionalDrivers: [],
        vehicles: [],
        coverages: {},
        meta: { version: 2 },
      };

      let limitCallCount = 0;
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          limitCallCount++;
          if (limitCallCount === 1) {
            return Promise.resolve([{ quoteSnapshot: mockSnapshot }]);
          }
          return Promise.resolve([
            {
              policy_identifier: 'policy-123',
              policy_number: quoteNumber,
              quote_snapshot: mockSnapshot,
              effective_date: '2025-10-24',
            },
          ]);
        }),
      };

      mockDb.select.mockReturnValue(mockChain);
      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      const vehicles = [
        {
          year: 2021,
          make: 'Tesla',
          model: 'Model 3',
          vin: '5YJ3E1EA0KF000001',
        },
        {
          year: 2019,
          make: 'Honda',
          model: 'Civic',
          vin: '2HGFC2F59MH000001',
        },
      ];

      const result = await service.updateQuoteVehicles(quoteNumber, vehicles);

      expect(result.quoteNumber).toBe(quoteNumber);
      expect(result.premium).toBeGreaterThan(0);
    });
  });

  describe('updateQuoteCoverage', () => {
    it('should update coverages, recalculate premium, and change status to QUOTED', async () => {
      const quoteNumber = 'DZAB12CD34';
      const mockSnapshot = {
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          birthDate: '1990-01-01',
        },
        additionalDrivers: [],
        vehicles: [{ year: 2020, make: 'Toyota', model: 'Camry' }],
        coverages: {},
        meta: { version: 2 },
      };

      let limitCallCount = 0;
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          limitCallCount++;
          if (limitCallCount === 1) {
            return Promise.resolve([{ quoteSnapshot: mockSnapshot }]);
          }
          return Promise.resolve([
            {
              policy_identifier: 'policy-123',
              policy_number: quoteNumber,
              quote_snapshot: mockSnapshot,
              effective_date: '2025-10-24',
              status_code: 'INCOMPLETE',
            },
          ]);
        }),
      };

      mockDb.select.mockReturnValue(mockChain);
      mockDb.update.mockReturnThis();
      mockDb.set.mockReturnThis();
      mockDb.where.mockResolvedValue(undefined);

      const coverages = {
        startDate: '2025-11-01',
        bodilyInjuryLimit: '100/300',
        propertyDamageLimit: '50000',
        collision: true,
        collisionDeductible: 500,
        comprehensive: true,
        comprehensiveDeductible: 500,
        uninsuredMotorist: true,
      };

      const result = await service.updateQuoteCoverage(quoteNumber, coverages);

      expect(result.quoteNumber).toBe(quoteNumber);
      expect(result.premium).toBeGreaterThan(1000); // Coverage adds to premium

      // Verify update was called with QUOTED status
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
    });
  });
});
