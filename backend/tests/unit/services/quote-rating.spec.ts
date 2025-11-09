/**
 * T132: Unit Tests for QuoteService.calculatePremiumProgressive()
 *
 * Tests the comprehensive rating engine with vehicle age, driver age,
 * additional drivers, and coverage factors using a multiplicative model.
 *
 * Base formula: basePremium × vehicleFactor × driverFactor × additionalDriversFactor × coverageFactor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { QuoteService } from '../../../src/services/quote/quote.service';
import { DATABASE_CONNECTION } from '../../../src/database/database.module';

describe('QuoteService - calculatePremiumProgressive (T132)', () => {
  let service: QuoteService;
  let mockDb: any;

  beforeEach(async () => {
    // Mock database connection
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

  describe('Base Premium Calculation', () => {
    it('should start with base premium of $1,000', () => {
      const premium = (service as any).calculatePremiumProgressive({
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: new Date('1990-01-01'), // Age 35 - baseline factor 1.0
          email: 'john@example.com',
        },
        vehicles: [
          {
            year: 2019, // 6 years old - baseline factor 1.0
            make: 'Toyota',
            model: 'Camry',
            vin: '1HGBH41JXMN109186',
          },
        ],
        coverages: null, // No coverage = factor 1.0
        additionalDrivers: [],
      });

      // Base: 1000 × 1.0 (vehicle) × 1.0 (driver) × 1.0 (no add'l drivers) × 1.0 (no coverage)
      expect(premium).toBe(1000);
    });
  });

  describe('Vehicle Age Factor', () => {
    it('should apply 1.3× factor for vehicles ≤3 years old', () => {
      const currentYear = new Date().getFullYear();
      const premium = (service as any).calculatePremiumProgressive({
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: new Date('1990-01-01'), // Age 35 - factor 1.0
          email: 'john@example.com',
        },
        vehicles: [
          {
            year: currentYear - 2, // 2 years old
            make: 'Tesla',
            model: 'Model 3',
            vin: '5YJ3E1EA0KF000001',
          },
        ],
        coverages: null,
        additionalDrivers: [],
      });

      // Base: 1000 × 1.3 (new car) × 1.0 (driver) × 1.0 (no add'l drivers) × 1.0 (no coverage)
      expect(premium).toBe(1300);
    });

    it('should apply 1.0× factor for vehicles 4-7 years old', () => {
      const currentYear = new Date().getFullYear();
      const premium = (service as any).calculatePremiumProgressive({
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: new Date('1990-01-01'), // Age 35 - factor 1.0
          email: 'john@example.com',
        },
        vehicles: [
          {
            year: currentYear - 5, // 5 years old
            make: 'Honda',
            model: 'Accord',
            vin: '1HGBH41JXMN109186',
          },
        ],
        coverages: null,
        additionalDrivers: [],
      });

      // Base: 1000 × 1.0 (mid-age) × 1.0 (driver) × 1.0 (no add'l drivers) × 1.0 (no coverage)
      expect(premium).toBe(1000);
    });

    it('should apply 0.9× factor for vehicles ≥8 years old', () => {
      const currentYear = new Date().getFullYear();
      const premium = (service as any).calculatePremiumProgressive({
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: new Date('1990-01-01'), // Age 35 - factor 1.0
          email: 'john@example.com',
        },
        vehicles: [
          {
            year: currentYear - 10, // 10 years old
            make: 'Ford',
            model: 'F-150',
            vin: '1FTFW1ET0BKE00001',
          },
        ],
        coverages: null,
        additionalDrivers: [],
      });

      // Base: 1000 × 0.9 (old car) × 1.0 (driver) × 1.0 (no add'l drivers) × 1.0 (no coverage)
      expect(premium).toBe(900);
    });
  });

  describe('Driver Age Factor', () => {
    it('should apply 1.8× factor for drivers <25 years old', () => {
      const premium = (service as any).calculatePremiumProgressive({
        driver: {
          firstName: 'Emily',
          lastName: 'Young',
          birthDate: new Date('2003-01-01'), // Age 22 - young driver
          email: 'emily@example.com',
        },
        vehicles: [
          {
            year: 2019, // Mid-age - factor 1.0
            make: 'Toyota',
            model: 'Camry',
            vin: '1HGBH41JXMN109186',
          },
        ],
        coverages: null,
        additionalDrivers: [],
      });

      // Base: 1000 × 1.0 (vehicle) × 1.8 (young driver) × 1.0 (no add'l drivers) × 1.0 (no coverage)
      expect(premium).toBe(1800);
    });

    it('should apply 1.0× factor for drivers 25-64 years old', () => {
      const premium = (service as any).calculatePremiumProgressive({
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: new Date('1985-01-01'), // Age 40 - baseline
          email: 'john@example.com',
        },
        vehicles: [
          {
            year: 2019, // Mid-age - factor 1.0
            make: 'Toyota',
            model: 'Camry',
            vin: '1HGBH41JXMN109186',
          },
        ],
        coverages: null,
        additionalDrivers: [],
      });

      // Base: 1000 × 1.0 (vehicle) × 1.0 (driver) × 1.0 (no add'l drivers) × 1.0 (no coverage)
      expect(premium).toBe(1000);
    });

    it('should apply 1.2× factor for drivers ≥65 years old', () => {
      const premium = (service as any).calculatePremiumProgressive({
        driver: {
          firstName: 'Robert',
          lastName: 'Senior',
          birthDate: new Date('1955-01-01'), // Age 70 - senior driver
          email: 'robert@example.com',
        },
        vehicles: [
          {
            year: 2019, // Mid-age - factor 1.0
            make: 'Toyota',
            model: 'Camry',
            vin: '1HGBH41JXMN109186',
          },
        ],
        coverages: null,
        additionalDrivers: [],
      });

      // Base: 1000 × 1.0 (vehicle) × 1.2 (senior driver) × 1.0 (no add'l drivers) × 1.0 (no coverage)
      expect(premium).toBe(1200);
    });
  });

  describe('Additional Drivers Factor', () => {
    it('should apply 1.15× factor per additional driver', () => {
      const premium = (service as any).calculatePremiumProgressive({
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: new Date('1990-01-01'), // Age 35 - factor 1.0
          email: 'john@example.com',
        },
        vehicles: [
          {
            year: 2019, // Mid-age - factor 1.0
            make: 'Toyota',
            model: 'Camry',
            vin: '1HGBH41JXMN109186',
          },
        ],
        coverages: null,
        additionalDrivers: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            birthDate: new Date('1992-01-01'),
            email: 'jane@example.com',
            relationship: 'spouse',
          },
        ],
      });

      // Base: 1000 × 1.0 (vehicle) × 1.0 (driver) × 1.15 (1 add'l driver) × 1.0 (no coverage)
      expect(premium).toBe(1150);
    });

    it('should correctly compound for multiple additional drivers', () => {
      const premium = (service as any).calculatePremiumProgressive({
        driver: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: new Date('1990-01-01'), // Age 35 - factor 1.0
          email: 'john@example.com',
        },
        vehicles: [
          {
            year: 2019, // Mid-age - factor 1.0
            make: 'Toyota',
            model: 'Camry',
            vin: '1HGBH41JXMN109186',
          },
        ],
        coverages: null,
        additionalDrivers: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            birthDate: new Date('1992-01-01'),
            email: 'jane@example.com',
            relationship: 'spouse',
          },
          {
            firstName: 'Tommy',
            lastName: 'Doe',
            birthDate: new Date('2007-01-01'),
            email: 'tommy@example.com',
            relationship: 'child',
          },
        ],
      });

      // Base: 1000 × 1.0 (vehicle) × 1.0 (driver) × 1.30 (2 add'l drivers = 1 + 0.15 * 2) × 1.0 (no coverage)
      expect(premium).toBe(1300);
    });
  });

  describe('Coverage Factors', () => {
    describe('Bodily Injury Limits', () => {
      it('should add 5% for 25/50 limits', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { bodilyInjuryLimit: '25/50' },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.05 BI + 0.05 default PD) = 1100
        expect(premium).toBe(1100);
      });

      it('should add 10% for 50/100 limits', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { bodilyInjuryLimit: '50/100' },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.10 BI + 0.05 default PD) = 1150
        expect(premium).toBe(1150);
      });

      it('should add 15% for 100/300 limits', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { bodilyInjuryLimit: '100/300' },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 BI + 0.05 default PD) = 1200
        expect(premium).toBe(1200);
      });

      it('should add 25% for 250/500 limits', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { bodilyInjuryLimit: '250/500' },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.25 BI + 0.05 default PD) = 1300
        expect(premium).toBe(1300);
      });
    });

    describe('Property Damage Limits', () => {
      it('should add 3% for $25k limit', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { propertyDamageLimit: '25000' },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.03 PD) = 1180
        expect(premium).toBe(1180);
      });

      it('should add 5% for $50k limit', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { propertyDamageLimit: '50000' },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 PD) = 1200
        expect(premium).toBe(1200);
      });

      it('should add 8% for $100k limit', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { propertyDamageLimit: '100000' },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.08 PD) = 1230
        expect(premium).toBe(1230);
      });
    });

    describe('Collision Deductibles', () => {
      it('should add 35% for $250 deductible', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { collision: true, collisionDeductible: 250 },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.35 collision) = 1550
        expect(premium).toBe(1550);
      });

      it('should add 30% for $500 deductible', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { collision: true, collisionDeductible: 500 },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.30 collision) = 1500
        expect(premium).toBe(1500);
      });

      it('should add 25% for $1000 deductible', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { collision: true, collisionDeductible: 1000 },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.25 collision) = 1450
        expect(premium).toBe(1450);
      });

      it('should add 20% for $2500 deductible', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { collision: true, collisionDeductible: 2500 },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.20 collision) = 1400
        expect(premium).toBe(1400);
      });
    });

    describe('Comprehensive Deductibles', () => {
      it('should add 25% for $250 deductible', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { comprehensive: true, comprehensiveDeductible: 250 },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.25 comp) = 1450
        expect(premium).toBe(1450);
      });

      it('should add 20% for $500 deductible', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { comprehensive: true, comprehensiveDeductible: 500 },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.20 comp) = 1400
        expect(premium).toBe(1400);
      });

      it('should add 15% for $1000 deductible', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { comprehensive: true, comprehensiveDeductible: 1000 },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.15 comp) = 1350
        expect(premium).toBe(1350);
      });

      it('should add 10% for $2500 deductible', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { comprehensive: true, comprehensiveDeductible: 2500 },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.10 comp) = 1300
        expect(premium).toBe(1300);
      });
    });

    describe('Optional Coverages', () => {
      it('should add 10% for uninsured motorist coverage', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { uninsuredMotorist: true },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.10 uninsured) = 1300
        expect(premium).toBe(1300);
      });

      it('should add 5% for roadside assistance', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { roadsideAssistance: true },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.05 roadside) = 1250
        expect(premium).toBe(1250);
      });

      it('should add 3% for $30/day rental reimbursement', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { rentalReimbursement: true, rentalLimit: 30 },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.03 rental) = 1230
        expect(premium).toBe(1230);
      });

      it('should add 5% for $50/day rental reimbursement', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { rentalReimbursement: true, rentalLimit: 50 },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.05 rental) = 1250
        expect(premium).toBe(1250);
      });

      it('should add 7% for $75/day rental reimbursement', () => {
        const premium = (service as any).calculatePremiumProgressive({
          driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1990-01-01'), email: 'john@example.com' },
          vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
          coverages: { rentalReimbursement: true, rentalLimit: 75 },
          additionalDrivers: [],
        });
        // Base: 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 default BI + 0.05 default PD + 0.07 rental) = 1270
        expect(premium).toBe(1270);
      });
    });
  });

  describe('Multiplicative Model', () => {
    it('should correctly multiply all factors together', () => {
      const currentYear = new Date().getFullYear();
      const premium = (service as any).calculatePremiumProgressive({
        driver: {
          firstName: 'Emily',
          lastName: 'Young',
          birthDate: new Date('2003-01-01'), // Age 22 - factor 1.8
          email: 'emily@example.com',
        },
        vehicles: [
          {
            year: currentYear - 1, // 1 year old - factor 1.3
            make: 'BMW',
            model: '3 Series',
            vin: 'WBA8E1C50HK000001',
          },
        ],
        coverages: {
          bodilyInjuryLimit: '100/300', // +0.15
          propertyDamageLimit: '50000', // +0.05
          collision: true,
          collisionDeductible: 500, // +0.30
          comprehensive: true,
          comprehensiveDeductible: 500, // +0.20
          uninsuredMotorist: true, // +0.10
        },
        additionalDrivers: [
          {
            firstName: 'Parent',
            lastName: 'Young',
            birthDate: new Date('1975-01-01'),
            email: 'parent@example.com',
            relationship: 'parent',
          },
        ], // Factor: 1.15
      });

      // Base: $1000
      // Vehicle: 1.3 (new car)
      // Driver: 1.8 (young driver)
      // Additional Drivers: 1.15 (1 additional driver)
      // Coverage: 1.0 + 0.15 + 0.05 + 0.30 + 0.20 + 0.10 = 1.80
      // Total: 1000 × 1.3 × 1.8 × 1.15 × 1.80 = 4,843.8 → 4,844 (rounded)
      expect(premium).toBe(4844);
    });
  });

  describe('Premium Range Validation', () => {
    it('should produce premiums in $800-$3500 range for typical scenarios', () => {
      // Scenario 1: Middle-aged driver, mid-age car, standard coverage
      const scenario1 = (service as any).calculatePremiumProgressive({
        driver: { firstName: 'John', lastName: 'Doe', birthDate: new Date('1985-01-01'), email: 'john@example.com' },
        vehicles: [{ year: 2019, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186' }],
        coverages: {
          bodilyInjuryLimit: '100/300',
          propertyDamageLimit: '50000',
          collision: true,
          collisionDeductible: 1000,
        },
        additionalDrivers: [],
      });
      // 1000 × 1.0 × 1.0 × 1.0 × (1 + 0.15 BI + 0.05 PD + 0.25 collision) = 1450
      expect(scenario1).toBe(1450);
      expect(scenario1).toBeGreaterThanOrEqual(800);
      expect(scenario1).toBeLessThanOrEqual(3500);

      // Scenario 2: Young driver, old car, minimum coverage
      const scenario2 = (service as any).calculatePremiumProgressive({
        driver: { firstName: 'Emily', lastName: 'Young', birthDate: new Date('2003-01-01'), email: 'emily@example.com' },
        vehicles: [{ year: 2010, make: 'Honda', model: 'Civic', vin: '1HGBH41JXMN109186' }],
        coverages: {
          bodilyInjuryLimit: '25/50',
          propertyDamageLimit: '25000',
        },
        additionalDrivers: [],
      });
      // 1000 × 0.9 (old car) × 1.8 (young driver) × 1.0 × (1 + 0.05 BI + 0.03 PD) = 1000 × 0.9 × 1.8 × 1.08 = 1750
      expect(scenario2).toBe(1750);
      expect(scenario2).toBeGreaterThanOrEqual(800);
      expect(scenario2).toBeLessThanOrEqual(3500);

      // Scenario 3: Senior driver, new car, high coverage
      const currentYear = new Date().getFullYear();
      const scenario3 = (service as any).calculatePremiumProgressive({
        driver: { firstName: 'Robert', lastName: 'Senior', birthDate: new Date('1955-01-01'), email: 'robert@example.com' },
        vehicles: [{ year: currentYear - 1, make: 'Lexus', model: 'ES', vin: 'JTHBK1GG0K2000001' }],
        coverages: {
          bodilyInjuryLimit: '250/500',
          propertyDamageLimit: '100000',
          collision: true,
          collisionDeductible: 250,
          comprehensive: true,
          comprehensiveDeductible: 250,
          uninsuredMotorist: true,
          roadsideAssistance: true,
        },
        additionalDrivers: [],
      });
      // 1000 × 1.3 (new car) × 1.2 (senior) × 1.0 × (1 + 0.25 BI + 0.08 PD + 0.35 coll + 0.25 comp + 0.10 uninsured + 0.05 roadside)
      // = 1000 × 1.3 × 1.2 × 2.08 = 3245
      expect(scenario3).toBe(3245);
      expect(scenario3).toBeGreaterThanOrEqual(800);
      expect(scenario3).toBeLessThanOrEqual(3500);
    });
  });
});
