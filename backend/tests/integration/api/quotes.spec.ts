/**
 * T162: Quotes API Integration Tests
 *
 * Comprehensive integration tests for the Quotes Controller endpoints.
 * Tests the full request/response cycle including:
 * - Single driver/vehicle quote creation
 * - Multi-driver/vehicle quote creation
 * - Quote retrieval by ID and quote number
 * - Updating primary driver
 * - Adding/updating additional drivers
 * - Adding/updating vehicles
 * - Updating coverage selections and finalizing quotes
 *
 * These tests use the actual NestJS application with real database connections.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('Quotes API Integration Tests (T162)', () => {
  let app: INestApplication;
  let createdQuoteNumber: string;
  let createdQuoteId: string;

  beforeAll(async () => {
    // Create NestJS testing module with full application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same middleware as production app
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      })
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/quotes - Create Quote', () => {
    it('should create quote with single driver/vehicle (legacy format)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          // Driver information (legacy single format)
          driver_first_name: 'John',
          driver_last_name: 'Doe',
          driver_birth_date: '1985-06-15',
          driver_email: 'john.doe@example.com',
          driver_phone: '555-123-4567',
          driver_gender: 'Male',
          driver_marital_status: 'Married',
          driver_years_licensed: 15,

          // Address
          address_line_1: '123 Main St',
          address_line_2: 'Apt 4B',
          address_city: 'Los Angeles',
          address_state: 'CA',
          address_zip: '90001',

          // Vehicle information (legacy single format)
          vehicle_year: 2020,
          vehicle_make: 'Honda',
          vehicle_model: 'Accord',
          vehicle_vin: '1HGCM82633A123456',
          vehicle_annual_mileage: 12000,
          vehicle_body_type: 'Sedan',
          vehicle_usage: 'commute',

          // Coverage selections
          coverage_bodily_injury: '100000/300000',
          coverage_property_damage: '50000',
          coverage_collision_deductible: 500,
          coverage_comprehensive_deductible: 500,
          include_uninsured_motorist: true,
          include_roadside_assistance: true,
        })
        .expect(201);

      expect(response.body).toHaveProperty('quoteNumber');
      expect(response.body).toHaveProperty('quoteId');
      expect(response.body).toHaveProperty('premium');
      expect(response.body).toHaveProperty('status', 'INCOMPLETE');

      // Validate DZXXXXXXXX format
      expect(response.body.quoteNumber).toMatch(/^DZ[A-Z0-9]{8}$/);

      // Save for later tests
      createdQuoteNumber = response.body.quoteNumber;
      createdQuoteId = response.body.quoteId;
    });

    it('should create quote with multi-driver/vehicle (new format)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          // Multi-driver format
          drivers: [
            {
              first_name: 'Jane',
              last_name: 'Smith',
              birth_date: '1988-03-22',
              email: 'jane.smith@example.com',
              phone: '555-987-6543',
              gender: 'Female',
              marital_status: 'Married',
              years_licensed: 12,
              is_primary: true,
            },
            {
              first_name: 'Bob',
              last_name: 'Smith',
              birth_date: '1986-07-10',
              email: 'bob.smith@example.com',
              phone: '555-987-6544',
              gender: 'Male',
              marital_status: 'Married',
              years_licensed: 14,
              relationship: 'spouse',
              is_primary: false,
            },
          ],

          // Multi-vehicle format
          vehicles: [
            {
              year: 2021,
              make: 'Toyota',
              model: 'Camry',
              vin: '4T1BF1FK5CU123456',
              annual_mileage: 10000,
              body_type: 'Sedan',
              usage: 'commute',
            },
            {
              year: 2019,
              make: 'Honda',
              model: 'CR-V',
              vin: '2HKRW2H85KH123456',
              annual_mileage: 8000,
              body_type: 'SUV',
              usage: 'pleasure',
            },
          ],

          // Address
          address_line_1: '456 Oak Ave',
          address_city: 'San Francisco',
          address_state: 'CA',
          address_zip: '94102',

          // Coverage selections
          coverage_start_date: '2025-11-01',
          coverage_bodily_injury_limit: '250000/500000',
          coverage_property_damage_limit: '100000',
          coverage_has_collision: true,
          coverage_collision_deductible: 1000,
          coverage_has_comprehensive: true,
          coverage_comprehensive_deductible: 500,
          coverage_has_uninsured: true,
          coverage_has_roadside: true,
          coverage_has_rental: true,
          coverage_rental_limit: 50,
        })
        .expect(201);

      expect(response.body).toHaveProperty('quoteNumber');
      expect(response.body).toHaveProperty('quoteId');
      expect(response.body).toHaveProperty('premium');
      expect(response.body.quoteNumber).toMatch(/^DZ[A-Z0-9]{8}$/);

      // Validate that multi-driver/vehicle data was stored in quote_snapshot
      expect(response.body).toHaveProperty('drivers');
      expect(response.body.drivers).toHaveLength(2);
      expect(response.body).toHaveProperty('vehicles');
      expect(response.body.vehicles).toHaveLength(2);
    });

    it('should reject quote creation with missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'Test',
          // Missing driver_last_name
          driver_birth_date: '1990-01-01',
          driver_email: 'test@example.com',
          address_line_1: '123 Test St',
          address_city: 'Test City',
          address_state: 'CA',
          address_zip: '90001',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should allow quote creation without phone number (optional field)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'NoPhone',
          driver_last_name: 'User',
          driver_birth_date: '1992-05-20',
          driver_email: 'nophone@example.com',
          // phone is intentionally omitted (optional)

          address_line_1: '789 NoPhone Blvd',
          address_city: 'Sacramento',
          address_state: 'CA',
          address_zip: '95814',

          vehicle_year: 2018,
          vehicle_make: 'Ford',
          vehicle_model: 'Focus',
          vehicle_vin: '1FADP3K20JL123456',
        })
        .expect(201);

      expect(response.body).toHaveProperty('quoteNumber');
      expect(response.body.quoteNumber).toMatch(/^DZ[A-Z0-9]{8}$/);
    });
  });

  describe('GET /api/v1/quotes/:id - Get Quote by ID', () => {
    it('should retrieve quote by quote number (DZXXXXXXXX format)', async () => {
      // First create a quote
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'Retrieve',
          driver_last_name: 'Test',
          driver_birth_date: '1987-09-12',
          driver_email: 'retrieve@test.com',
          driver_phone: '555-111-2222',
          address_line_1: '111 Retrieve Ln',
          address_city: 'Oakland',
          address_state: 'CA',
          address_zip: '94601',
          vehicle_year: 2022,
          vehicle_make: 'Tesla',
          vehicle_model: 'Model 3',
          vehicle_vin: '5YJ3E1EA3KF123456',
        });

      const quoteNumber = createResponse.body.quoteNumber;

      // Retrieve by quote number
      const response = await request(app.getHttpServer())
        .get(`/api/v1/quotes/${quoteNumber}`)
        .expect(200);

      expect(response.body).toHaveProperty('policy_number', quoteNumber);
      expect(response.body).toHaveProperty('status_code');
      expect(response.body).toHaveProperty('effective_date');
    });

    it('should return 404 for non-existent quote', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/quotes/DZNONEXIST')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/v1/quotes/reference/:quoteNumber - Get Quote by Reference', () => {
    it('should retrieve quote by reference number', async () => {
      // Create quote first
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'Reference',
          driver_last_name: 'Lookup',
          driver_birth_date: '1991-02-28',
          driver_email: 'reference@test.com',
          driver_phone: '555-333-4444',
          address_line_1: '222 Reference Rd',
          address_city: 'San Diego',
          address_state: 'CA',
          address_zip: '92101',
          vehicle_year: 2020,
          vehicle_make: 'BMW',
          vehicle_model: 'X5',
          vehicle_vin: '5UXCR6C0XL9123456',
        });

      const quoteNumber = createResponse.body.quoteNumber;

      // Retrieve using reference endpoint
      const response = await request(app.getHttpServer())
        .get(`/api/v1/quotes/reference/${quoteNumber}`)
        .expect(200);

      expect(response.body).toHaveProperty('policy_number', quoteNumber);
    });

    it('should return 404 for non-existent reference number', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/quotes/reference/DZFAKE1234')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
    });
  });

  describe('PUT /api/v1/quotes/:quoteNumber/primary-driver - Update Primary Driver', () => {
    it('should update primary driver information and recalculate premium', async () => {
      // Create initial quote
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'Original',
          driver_last_name: 'Driver',
          driver_birth_date: '1980-01-01',
          driver_email: 'original@test.com',
          driver_phone: '555-000-0001',
          address_line_1: '100 Original St',
          address_city: 'Fresno',
          address_state: 'CA',
          address_zip: '93650',
          vehicle_year: 2019,
          vehicle_make: 'Nissan',
          vehicle_model: 'Altima',
          vehicle_vin: '1N4BL4BV5KN123456',
        });

      const quoteNumber = createResponse.body.quoteNumber;
      const originalPremium = createResponse.body.premium;

      // Update primary driver
      const response = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/primary-driver`)
        .send({
          driver_first_name: 'Updated',
          driver_last_name: 'DriverName',
          driver_birth_date: '1995-05-15', // Younger driver
          driver_email: 'updated@test.com',
          driver_phone: '555-999-9999',
          driver_gender: 'Female',
          driver_marital_status: 'Single',
          address_line_1: '200 Updated Ave',
          address_city: 'San Jose',
          address_state: 'CA',
          address_zip: '95110',
        })
        .expect(200);

      expect(response.body).toHaveProperty('quoteNumber', quoteNumber);
      expect(response.body).toHaveProperty('premium');
      // Premium may change due to age difference
      expect(response.body.premium).toBeGreaterThan(0);
    });

    it('should return 404 when updating non-existent quote', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/quotes/DZNOTFOUND/primary-driver')
        .send({
          driver_first_name: 'Test',
          driver_last_name: 'User',
          driver_birth_date: '1990-01-01',
          driver_email: 'test@test.com',
          driver_phone: '555-000-0000',
          address_line_1: '123 Test St',
          address_city: 'Test',
          address_state: 'CA',
          address_zip: '90001',
        })
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
    });
  });

  describe('PUT /api/v1/quotes/:quoteNumber/drivers - Update Additional Drivers', () => {
    it('should add additional drivers to existing quote', async () => {
      // Create quote with single driver
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'Primary',
          driver_last_name: 'Only',
          driver_birth_date: '1985-03-10',
          driver_email: 'primary@test.com',
          driver_phone: '555-100-0001',
          address_line_1: '300 Primary Dr',
          address_city: 'Berkeley',
          address_state: 'CA',
          address_zip: '94704',
          vehicle_year: 2021,
          vehicle_make: 'Subaru',
          vehicle_model: 'Outback',
          vehicle_vin: '4S4BTANC5M3123456',
        });

      const quoteNumber = createResponse.body.quoteNumber;

      // Add additional drivers
      const response = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/drivers`)
        .send({
          additionalDrivers: [
            {
              first_name: 'Spouse',
              last_name: 'Driver',
              birth_date: '1987-08-20',
              email: 'spouse@test.com',
              phone: '555-100-0002',
              gender: 'Female',
              marital_status: 'Married',
              years_licensed: 10,
              relationship: 'spouse',
            },
            {
              first_name: 'Teen',
              last_name: 'Driver',
              birth_date: '2007-11-15',
              email: 'teen@test.com',
              phone: '555-100-0003',
              gender: 'Male',
              marital_status: 'Single',
              years_licensed: 1,
              relationship: 'child',
            },
          ],
        })
        .expect(200);

      expect(response.body).toHaveProperty('quoteNumber', quoteNumber);
      expect(response.body).toHaveProperty('drivers');
      expect(response.body.drivers.length).toBeGreaterThanOrEqual(2);
    });

    it('should update existing additional drivers', async () => {
      // Create quote with multi-driver
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          drivers: [
            {
              first_name: 'Main',
              last_name: 'Person',
              birth_date: '1982-06-05',
              email: 'main@test.com',
              phone: '555-200-0001',
              is_primary: true,
            },
            {
              first_name: 'Other',
              last_name: 'Person',
              birth_date: '1984-09-12',
              email: 'other@test.com',
              phone: '555-200-0002',
              relationship: 'spouse',
            },
          ],
          address_line_1: '400 Multi Dr',
          address_city: 'Palo Alto',
          address_state: 'CA',
          address_zip: '94301',
          vehicles: [
            {
              year: 2022,
              make: 'Audi',
              model: 'A4',
              vin: 'WAUFFAFL5CN123456',
            },
          ],
        });

      const quoteNumber = createResponse.body.quoteNumber;

      // Update with new set of additional drivers (replacing previous)
      const response = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/drivers`)
        .send({
          additionalDrivers: [
            {
              first_name: 'Replacement',
              last_name: 'Driver',
              birth_date: '1990-12-25',
              email: 'replacement@test.com',
              phone: '555-200-0003',
              relationship: 'other',
            },
          ],
        })
        .expect(200);

      expect(response.body).toHaveProperty('drivers');
      expect(response.body.drivers.some((d: any) => d.first_name === 'Replacement')).toBe(true);
    });
  });

  describe('PUT /api/v1/quotes/:quoteNumber/vehicles - Update Vehicles', () => {
    it('should add multiple vehicles to existing quote', async () => {
      // Create quote with single vehicle
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'Vehicle',
          driver_last_name: 'Owner',
          driver_birth_date: '1978-04-18',
          driver_email: 'vehicleowner@test.com',
          driver_phone: '555-300-0001',
          address_line_1: '500 Vehicle Blvd',
          address_city: 'Santa Clara',
          address_state: 'CA',
          address_zip: '95050',
          vehicle_year: 2020,
          vehicle_make: 'Chevrolet',
          vehicle_model: 'Malibu',
          vehicle_vin: '1G1ZD5ST5LF123456',
        });

      const quoteNumber = createResponse.body.quoteNumber;

      // Add more vehicles
      const response = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/vehicles`)
        .send({
          vehicles: [
            {
              year: 2020,
              make: 'Chevrolet',
              model: 'Malibu',
              vin: '1G1ZD5ST5LF123456', // Original
            },
            {
              year: 2023,
              make: 'Ford',
              model: 'F-150',
              vin: '1FTFW1E52PFA12345',
              annual_mileage: 15000,
              body_type: 'Truck',
            },
            {
              year: 2021,
              make: 'Mazda',
              model: 'CX-5',
              vin: 'JM3KFBDM5M0123456',
              annual_mileage: 9000,
              body_type: 'SUV',
            },
          ],
        })
        .expect(200);

      expect(response.body).toHaveProperty('vehicles');
      expect(response.body.vehicles).toHaveLength(3);
    });

    it('should allow vehicles without VIN (optional field)', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'NoVIN',
          driver_last_name: 'Test',
          driver_birth_date: '1989-07-22',
          driver_email: 'novin@test.com',
          driver_phone: '555-400-0001',
          address_line_1: '600 NoVIN St',
          address_city: 'Sunnyvale',
          address_state: 'CA',
          address_zip: '94085',
          vehicle_year: 2019,
          vehicle_make: 'Kia',
          vehicle_model: 'Sorento',
          // VIN intentionally omitted
        });

      const quoteNumber = createResponse.body.quoteNumber;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/vehicles`)
        .send({
          vehicles: [
            {
              year: 2019,
              make: 'Kia',
              model: 'Sorento',
              // No VIN provided
            },
            {
              year: 2022,
              make: 'Hyundai',
              model: 'Tucson',
              // No VIN provided
            },
          ],
        })
        .expect(200);

      expect(response.body).toHaveProperty('vehicles');
    });
  });

  describe('PUT /api/v1/quotes/:quoteNumber/coverage - Update Coverage and Finalize Quote', () => {
    it('should update coverage selections and transition status to QUOTED', async () => {
      // Create quote in INCOMPLETE status
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'Coverage',
          driver_last_name: 'Test',
          driver_birth_date: '1983-11-30',
          driver_email: 'coverage@test.com',
          driver_phone: '555-500-0001',
          address_line_1: '700 Coverage Ct',
          address_city: 'Cupertino',
          address_state: 'CA',
          address_zip: '95014',
          vehicle_year: 2023,
          vehicle_make: 'Mercedes-Benz',
          vehicle_model: 'C-Class',
          vehicle_vin: 'WDDWF4HB5PR123456',
        });

      const quoteNumber = createResponse.body.quoteNumber;
      expect(createResponse.body.status).toBe('INCOMPLETE');

      // Update coverage to finalize
      const response = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/coverage`)
        .send({
          coverage_start_date: '2025-12-01',
          coverage_bodily_injury_limit: '500000/1000000',
          coverage_property_damage_limit: '100000',
          coverage_collision: true,
          coverage_collision_deductible: 1000,
          coverage_comprehensive: true,
          coverage_comprehensive_deductible: 500,
          coverage_uninsured_motorist: true,
          coverage_roadside_assistance: true,
          coverage_rental_reimbursement: true,
          coverage_rental_limit: 75,
        })
        .expect(200);

      expect(response.body).toHaveProperty('quoteNumber', quoteNumber);
      expect(response.body).toHaveProperty('status', 'QUOTED');
      expect(response.body).toHaveProperty('premium');
      expect(response.body.premium).toBeGreaterThan(0);
    });

    it('should recalculate premium based on coverage selections', async () => {
      // Create quote
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'Premium',
          driver_last_name: 'Calc',
          driver_birth_date: '1992-02-14',
          driver_email: 'premium@test.com',
          driver_phone: '555-600-0001',
          address_line_1: '800 Premium Pl',
          address_city: 'Mountain View',
          address_state: 'CA',
          address_zip: '94040',
          vehicle_year: 2021,
          vehicle_make: 'Volkswagen',
          vehicle_model: 'Jetta',
          vehicle_vin: '3VWC57BU8MM123456',
        });

      const quoteNumber = createResponse.body.quoteNumber;

      // Set minimal coverage
      const minCoverageResponse = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/coverage`)
        .send({
          coverage_bodily_injury_limit: '15000/30000',
          coverage_property_damage_limit: '5000',
          coverage_collision: false,
          coverage_comprehensive: false,
          coverage_uninsured_motorist: false,
          coverage_roadside_assistance: false,
          coverage_rental_reimbursement: false,
        })
        .expect(200);

      const minPremium = minCoverageResponse.body.premium;

      // Update to maximum coverage (should increase premium)
      const maxCoverageResponse = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/coverage`)
        .send({
          coverage_bodily_injury_limit: '500000/1000000',
          coverage_property_damage_limit: '100000',
          coverage_collision: true,
          coverage_collision_deductible: 250,
          coverage_comprehensive: true,
          coverage_comprehensive_deductible: 250,
          coverage_uninsured_motorist: true,
          coverage_roadside_assistance: true,
          coverage_rental_reimbursement: true,
          coverage_rental_limit: 100,
        })
        .expect(200);

      const maxPremium = maxCoverageResponse.body.premium;

      // Max coverage should cost more than min coverage
      expect(maxPremium).toBeGreaterThan(minPremium);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed quote numbers gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/quotes/INVALID')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
    });

    it('should reject duplicate VINs on same quote', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'Duplicate',
          driver_last_name: 'VIN',
          driver_birth_date: '1986-05-10',
          driver_email: 'dupvin@test.com',
          driver_phone: '555-700-0001',
          address_line_1: '900 DupVIN Way',
          address_city: 'Milpitas',
          address_state: 'CA',
          address_zip: '95035',
          vehicle_year: 2020,
          vehicle_make: 'Toyota',
          vehicle_model: 'RAV4',
          vehicle_vin: 'JTMW1RFV8LD123456',
        });

      const quoteNumber = createResponse.body.quoteNumber;

      // Try to add vehicle with same VIN
      const response = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/vehicles`)
        .send({
          vehicles: [
            {
              year: 2020,
              make: 'Toyota',
              model: 'RAV4',
              vin: 'JTMW1RFV8LD123456', // Same VIN
            },
            {
              year: 2021,
              make: 'Toyota',
              model: 'RAV4',
              vin: 'JTMW1RFV8LD123456', // Duplicate VIN in same request
            },
          ],
        })
        .expect(500); // Should fail due to unique constraint

      expect(response.body).toHaveProperty('message');
    });

    it('should validate date formats in driver birth dates', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'Bad',
          driver_last_name: 'Date',
          driver_birth_date: 'not-a-date', // Invalid date format
          driver_email: 'baddate@test.com',
          driver_phone: '555-800-0001',
          address_line_1: '1000 BadDate Ln',
          address_city: 'San Mateo',
          address_state: 'CA',
          address_zip: '94401',
          vehicle_year: 2020,
          vehicle_make: 'Ford',
          vehicle_model: 'Fusion',
          vehicle_vin: '3FA6P0HD8LR123456',
        })
        .expect(500); // Should fail date parsing

      expect(response.body).toHaveProperty('message');
    });

    it('should handle extremely long names and addresses', async () => {
      const longName = 'A'.repeat(255);
      const longAddress = 'B'.repeat(500);

      const response = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: longName,
          driver_last_name: longName,
          driver_birth_date: '1990-01-01',
          driver_email: 'longname@test.com',
          driver_phone: '555-900-0001',
          address_line_1: longAddress,
          address_city: 'LongCity',
          address_state: 'CA',
          address_zip: '90001',
          vehicle_year: 2020,
          vehicle_make: 'Honda',
          vehicle_model: 'Civic',
          vehicle_vin: '19XFC2F59ME123456',
        });

      // Should either succeed or return validation error (depending on DB constraints)
      expect([201, 400, 500]).toContain(response.status);
    });
  });

  describe('Multi-Driver/Vehicle Workflow Tests', () => {
    it('should complete Progressive-style multi-step quote flow', async () => {
      // Step 1: Create initial quote with primary driver and one vehicle
      const step1 = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'Progressive',
          driver_last_name: 'User',
          driver_birth_date: '1985-08-15',
          driver_email: 'progressive@test.com',
          driver_phone: '555-PROG-001',
          address_line_1: '1100 Progressive Pkwy',
          address_city: 'Mayfield Village',
          address_state: 'OH',
          address_zip: '44124',
          vehicle_year: 2022,
          vehicle_make: 'Honda',
          vehicle_model: 'Civic',
          vehicle_vin: '2HGFC2F59NH123456',
        })
        .expect(201);

      const quoteNumber = step1.body.quoteNumber;
      expect(step1.body.status).toBe('INCOMPLETE');

      // Step 2: Add spouse driver
      const step2 = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/drivers`)
        .send({
          additionalDrivers: [
            {
              first_name: 'Spouse',
              last_name: 'User',
              birth_date: '1987-03-22',
              email: 'spouse@test.com',
              phone: '555-PROG-002',
              relationship: 'spouse',
            },
          ],
        })
        .expect(200);

      expect(step2.body.drivers.length).toBeGreaterThanOrEqual(2);

      // Step 3: Add second vehicle
      const step3 = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/vehicles`)
        .send({
          vehicles: [
            {
              year: 2022,
              make: 'Honda',
              model: 'Civic',
              vin: '2HGFC2F59NH123456',
            },
            {
              year: 2020,
              make: 'Toyota',
              model: 'Highlander',
              vin: '5TDJZRFH5LS123456',
              annual_mileage: 12000,
            },
          ],
        })
        .expect(200);

      expect(step3.body.vehicles).toHaveLength(2);

      // Step 4: Add teen driver
      const step4 = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/drivers`)
        .send({
          additionalDrivers: [
            {
              first_name: 'Spouse',
              last_name: 'User',
              birth_date: '1987-03-22',
              email: 'spouse@test.com',
              relationship: 'spouse',
            },
            {
              first_name: 'Teen',
              last_name: 'User',
              birth_date: '2008-06-10',
              email: 'teen@test.com',
              relationship: 'child',
              years_licensed: 0,
            },
          ],
        })
        .expect(200);

      expect(step4.body.drivers.length).toBeGreaterThanOrEqual(3);

      // Step 5: Update coverage and finalize
      const step5 = await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/coverage`)
        .send({
          coverage_start_date: '2025-11-15',
          coverage_bodily_injury_limit: '250000/500000',
          coverage_property_damage_limit: '100000',
          coverage_collision: true,
          coverage_collision_deductible: 500,
          coverage_comprehensive: true,
          coverage_comprehensive_deductible: 500,
          coverage_uninsured_motorist: true,
          coverage_roadside_assistance: true,
          coverage_rental_reimbursement: true,
          coverage_rental_limit: 50,
        })
        .expect(200);

      expect(step5.body.status).toBe('QUOTED');
      expect(step5.body.premium).toBeGreaterThan(0);
      expect(step5.body.drivers).toHaveLength(3);
      expect(step5.body.vehicles).toHaveLength(2);

      // Verify final quote retrieval
      const finalQuote = await request(app.getHttpServer())
        .get(`/api/v1/quotes/${quoteNumber}`)
        .expect(200);

      expect(finalQuote.body.status_code).toBe('QUOTED');
      expect(finalQuote.body.policy_number).toBe(quoteNumber);
    });
  });
});
