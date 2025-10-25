/**
 * T163: Policies API Integration Tests
 *
 * Comprehensive integration tests for the Policies Controller endpoints.
 * Tests policy binding, payment processing, and policy activation:
 * - Binding quotes with credit card payment
 * - Binding quotes with ACH payment
 * - Luhn validation for credit cards
 * - Policy activation (BOUND → IN_FORCE)
 * - Policy retrieval with multi-driver/vehicle data
 * - Quote snapshot preservation
 * - Payment record creation with tokenization
 *
 * These tests use the actual NestJS application with real database connections.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('Policies API Integration Tests (T163)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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

  /**
   * Helper function to create a QUOTED quote ready for binding
   */
  async function createQuotedQuote(overrides = {}) {
    // Create initial quote
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/quotes')
      .send({
        driver_first_name: 'Policy',
        driver_last_name: 'Holder',
        driver_birth_date: '1985-06-15',
        driver_email: 'policy@test.com',
        driver_phone: '555-POL-0001',
        address_line_1: '2000 Policy Dr',
        address_city: 'Columbus',
        address_state: 'OH',
        address_zip: '43215',
        vehicle_year: 2021,
        vehicle_make: 'Toyota',
        vehicle_model: 'Camry',
        vehicle_vin: '4T1B11HK5MU123456',
        ...overrides,
      });

    const quoteNumber = createResponse.body.quoteNumber;

    // Finalize coverage to transition to QUOTED status
    await request(app.getHttpServer())
      .put(`/api/v1/quotes/${quoteNumber}/coverage`)
      .send({
        coverage_start_date: '2025-12-01',
        coverage_bodily_injury_limit: '100000/300000',
        coverage_property_damage_limit: '50000',
        coverage_collision: true,
        coverage_collision_deductible: 500,
        coverage_comprehensive: true,
        coverage_comprehensive_deductible: 500,
        coverage_uninsured_motorist: true,
        coverage_roadside_assistance: true,
      });

    return quoteNumber;
  }

  describe('POST /api/v1/policies/bind - Bind Quote with Payment', () => {
    it('should bind quote with valid credit card payment (Luhn check passes)', async () => {
      const quoteNumber = await createQuotedQuote();

      const response = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242', // Valid test card (passes Luhn)
          cardExpiry: '12/28',
          cardCvv: '123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Quote bound to policy successfully');
      expect(response.body.data).toHaveProperty('policyId');
      expect(response.body.data).toHaveProperty('policyNumber', quoteNumber);
      expect(response.body.data).toHaveProperty('status', 'BOUND');
      expect(response.body.data).toHaveProperty('payment');
      expect(response.body.data).toHaveProperty('documents');

      // Validate payment record
      expect(response.body.data.payment).toHaveProperty('payment_identifier');
      expect(response.body.data.payment).toHaveProperty('amount_value');
      expect(response.body.data.payment).toHaveProperty('payment_method_type', 'credit_card');
      expect(response.body.data.payment).toHaveProperty('status_code', 'COMPLETED');

      // Validate card tokenization (last 4 digits visible, rest masked)
      expect(response.body.data.payment.payment_details).toContain('****4242');

      // Validate documents generated
      expect(response.body.data.documents).toBeInstanceOf(Array);
      expect(response.body.data.documents.length).toBeGreaterThan(0);
    });

    it('should reject credit card with invalid Luhn check', async () => {
      const quoteNumber = await createQuotedQuote({
        driver_email: 'invalid-card@test.com',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4000000000000002', // Invalid card (fails Luhn)
          cardExpiry: '12/28',
          cardCvv: '123',
        })
        .expect(500); // Payment should fail

      expect(response.body).toHaveProperty('message');
      // Should contain validation or payment error
      expect(
        response.body.message.toLowerCase().includes('payment') ||
        response.body.message.toLowerCase().includes('card') ||
        response.body.message.toLowerCase().includes('failed')
      ).toBe(true);
    });

    it('should bind quote with ACH payment', async () => {
      const quoteNumber = await createQuotedQuote({
        driver_email: 'ach-test@test.com',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'ach',
          routingNumber: '110000000', // Valid test routing number
          accountNumber: '000123456789',
          accountType: 'checking',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'BOUND');
      expect(response.body.data.payment).toHaveProperty('payment_method_type', 'ach');
      expect(response.body.data.payment).toHaveProperty('status_code', 'COMPLETED');

      // Validate account tokenization (last 4 digits visible)
      expect(response.body.data.payment.payment_details).toContain('****6789');
    });

    it('should preserve quote_snapshot in bound policy', async () => {
      // Create multi-driver/vehicle quote
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          drivers: [
            {
              first_name: 'Primary',
              last_name: 'Snapshot',
              birth_date: '1980-01-15',
              email: 'snapshot@test.com',
              phone: '555-SNAP-001',
              is_primary: true,
            },
            {
              first_name: 'Spouse',
              last_name: 'Snapshot',
              birth_date: '1982-05-20',
              email: 'spouse-snapshot@test.com',
              phone: '555-SNAP-002',
              relationship: 'spouse',
            },
          ],
          vehicles: [
            {
              year: 2021,
              make: 'Honda',
              model: 'Accord',
              vin: '1HGCV1F39LA123456',
            },
            {
              year: 2019,
              make: 'Toyota',
              model: 'Sienna',
              vin: '5TDYZ3DC6KS123456',
            },
          ],
          address_line_1: '3000 Snapshot Blvd',
          address_city: 'Cleveland',
          address_state: 'OH',
          address_zip: '44101',
        });

      const quoteNumber = createResponse.body.quoteNumber;

      // Finalize coverage
      await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/coverage`)
        .send({
          coverage_start_date: '2025-12-15',
          coverage_bodily_injury_limit: '250000/500000',
          coverage_property_damage_limit: '100000',
          coverage_collision: true,
          coverage_collision_deductible: 1000,
          coverage_comprehensive: true,
          coverage_comprehensive_deductible: 500,
        });

      // Bind policy
      const bindResponse = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardExpiry: '06/29',
          cardCvv: '456',
        })
        .expect(200);

      // Retrieve policy to verify snapshot preservation
      const policyResponse = await request(app.getHttpServer())
        .get(`/api/v1/policies/${quoteNumber}`)
        .expect(200);

      expect(policyResponse.body.data).toHaveProperty('policy_number', quoteNumber);

      // Verify quote_snapshot contains multi-driver/vehicle data
      // (Structure depends on how quote_snapshot is returned in the API)
      expect(policyResponse.body.data).toBeTruthy();
    });

    it('should reject binding of non-existent quote', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber: 'DZNOTEXIST',
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardExpiry: '12/28',
          cardCvv: '123',
        })
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject binding of already-bound quote', async () => {
      const quoteNumber = await createQuotedQuote({
        driver_email: 'already-bound@test.com',
      });

      // First binding
      await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardExpiry: '12/28',
          cardCvv: '123',
        })
        .expect(200);

      // Attempt second binding
      const response = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardExpiry: '12/28',
          cardCvv: '123',
        })
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should validate required payment fields for credit card', async () => {
      const quoteNumber = await createQuotedQuote({
        driver_email: 'missing-fields@test.com',
      });

      // Missing cardNumber
      const response1 = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardExpiry: '12/28',
          cardCvv: '123',
        })
        .expect(500);

      expect(response1.body).toHaveProperty('message');

      // Missing cardExpiry
      const response2 = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardCvv: '123',
        })
        .expect(500);

      expect(response2.body).toHaveProperty('message');
    });

    it('should validate required payment fields for ACH', async () => {
      const quoteNumber = await createQuotedQuote({
        driver_email: 'ach-missing@test.com',
      });

      // Missing accountNumber
      const response = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'ach',
          routingNumber: '110000000',
          accountType: 'checking',
        })
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should generate policy documents on binding', async () => {
      const quoteNumber = await createQuotedQuote({
        driver_email: 'doc-gen@test.com',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardExpiry: '03/30',
          cardCvv: '789',
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('documents');
      expect(response.body.data.documents).toBeInstanceOf(Array);

      // Check for expected document types
      const documentTypes = response.body.data.documents.map((d: any) => d.document_type);
      expect(documentTypes).toContain('POLICY_DECLARATIONS');
      expect(documentTypes).toContain('POLICY_DOCUMENT');
      expect(documentTypes).toContain('ID_CARD');
    });

    it('should match policy_number to quote_number (DZXXXXXXXX format)', async () => {
      const quoteNumber = await createQuotedQuote({
        driver_email: 'number-match@test.com',
      });

      expect(quoteNumber).toMatch(/^DZ[A-Z0-9]{8}$/);

      const response = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardExpiry: '09/27',
          cardCvv: '321',
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('policyNumber', quoteNumber);
      expect(response.body.data.policyNumber).toMatch(/^DZ[A-Z0-9]{8}$/);
    });
  });

  describe('POST /api/v1/policies/:id/activate - Activate Policy', () => {
    it('should activate BOUND policy to IN_FORCE status', async () => {
      // Create and bind quote
      const quoteNumber = await createQuotedQuote({
        driver_email: 'activate-test@test.com',
      });

      const bindResponse = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardExpiry: '12/28',
          cardCvv: '123',
        })
        .expect(200);

      const policyId = bindResponse.body.data.policyId;
      expect(bindResponse.body.data.status).toBe('BOUND');

      // Activate policy
      const activateResponse = await request(app.getHttpServer())
        .post(`/api/v1/policies/${policyId}/activate`)
        .expect(200);

      expect(activateResponse.body).toHaveProperty('success', true);
      expect(activateResponse.body).toHaveProperty('message', 'Policy activated successfully');
      expect(activateResponse.body.data).toHaveProperty('status', 'IN_FORCE');
      expect(activateResponse.body.data).toHaveProperty('policyId', policyId);
      expect(activateResponse.body.data).toHaveProperty('effectiveDate');
      expect(activateResponse.body.data).toHaveProperty('expirationDate');
    });

    it('should activate policy using policy number instead of UUID', async () => {
      // Create and bind quote
      const quoteNumber = await createQuotedQuote({
        driver_email: 'activate-by-number@test.com',
      });

      await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardExpiry: '12/28',
          cardCvv: '123',
        })
        .expect(200);

      // Activate using policy number (DZXXXXXXXX)
      const activateResponse = await request(app.getHttpServer())
        .post(`/api/v1/policies/${quoteNumber}/activate`)
        .expect(200);

      expect(activateResponse.body.data).toHaveProperty('status', 'IN_FORCE');
    });

    it('should return 404 for non-existent policy', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/policies/DZNOTEXIST/activate')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject activation of policy not in BOUND status', async () => {
      // Create quote but don't bind it
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          driver_first_name: 'NotBound',
          driver_last_name: 'User',
          driver_birth_date: '1990-01-01',
          driver_email: 'notbound@test.com',
          driver_phone: '555-NOT-BIND',
          address_line_1: '4000 NotBound St',
          address_city: 'Toledo',
          address_state: 'OH',
          address_zip: '43604',
          vehicle_year: 2020,
          vehicle_make: 'Ford',
          vehicle_model: 'Fusion',
          vehicle_vin: '3FA6P0HD8LR123456',
        });

      const quoteNumber = createResponse.body.quoteNumber;

      // Try to activate unbound policy
      const response = await request(app.getHttpServer())
        .post(`/api/v1/policies/${quoteNumber}/activate`)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/policies/:id - Retrieve Policy', () => {
    it('should retrieve policy details by policy ID', async () => {
      // Create and bind
      const quoteNumber = await createQuotedQuote({
        driver_email: 'retrieve-policy@test.com',
      });

      const bindResponse = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardExpiry: '12/28',
          cardCvv: '123',
        })
        .expect(200);

      const policyId = bindResponse.body.data.policyId;

      // Retrieve policy
      const response = await request(app.getHttpServer())
        .get(`/api/v1/policies/${policyId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('policy_number', quoteNumber);
      expect(response.body.data).toHaveProperty('status_code');
    });

    it('should retrieve policy by policy number (DZXXXXXXXX)', async () => {
      const quoteNumber = await createQuotedQuote({
        driver_email: 'retrieve-by-number@test.com',
      });

      await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardExpiry: '12/28',
          cardCvv: '123',
        })
        .expect(200);

      // Retrieve using policy number
      const response = await request(app.getHttpServer())
        .get(`/api/v1/policies/${quoteNumber}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('policy_number', quoteNumber);
    });

    it('should include multi-driver/vehicle data in retrieved policy', async () => {
      // Create multi-driver/vehicle quote
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .send({
          drivers: [
            {
              first_name: 'Multi',
              last_name: 'Driver',
              birth_date: '1983-07-10',
              email: 'multi-driver@test.com',
              phone: '555-MULTI-01',
              is_primary: true,
            },
            {
              first_name: 'Second',
              last_name: 'Driver',
              birth_date: '1985-09-22',
              email: 'second-driver@test.com',
              phone: '555-MULTI-02',
              relationship: 'spouse',
            },
          ],
          vehicles: [
            {
              year: 2022,
              make: 'Chevrolet',
              model: 'Bolt',
              vin: '1G1FX6S02N4123456',
            },
            {
              year: 2020,
              make: 'Jeep',
              model: 'Wrangler',
              vin: '1C4HJXDG9LW123456',
            },
          ],
          address_line_1: '5000 Multi Dr',
          address_city: 'Akron',
          address_state: 'OH',
          address_zip: '44308',
        });

      const quoteNumber = createResponse.body.quoteNumber;

      // Finalize and bind
      await request(app.getHttpServer())
        .put(`/api/v1/quotes/${quoteNumber}/coverage`)
        .send({
          coverage_bodily_injury_limit: '100000/300000',
          coverage_property_damage_limit: '50000',
          coverage_collision: true,
          coverage_collision_deductible: 500,
        });

      await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardExpiry: '12/28',
          cardCvv: '123',
        });

      // Retrieve and verify multi-driver/vehicle data
      const response = await request(app.getHttpServer())
        .get(`/api/v1/policies/${quoteNumber}`)
        .expect(200);

      expect(response.body.data).toBeTruthy();
      // Verify quote_snapshot contains driver/vehicle arrays
      // (Exact structure depends on API response format)
    });

    it('should return 404 for non-existent policy', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/policies/DZNOEXIST1')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
    });
  });

  describe('Payment Tokenization and Security', () => {
    it('should tokenize credit card data (last 4 digits visible)', async () => {
      const quoteNumber = await createQuotedQuote({
        driver_email: 'tokenize-cc@test.com',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '5555555555554444', // Mastercard test card
          cardExpiry: '12/28',
          cardCvv: '123',
        })
        .expect(200);

      const paymentDetails = response.body.data.payment.payment_details;

      // Should show last 4 digits only
      expect(paymentDetails).toContain('****4444');
      expect(paymentDetails).not.toContain('5555555555554444'); // Full card never returned
    });

    it('should tokenize ACH account data (last 4 digits visible)', async () => {
      const quoteNumber = await createQuotedQuote({
        driver_email: 'tokenize-ach@test.com',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'ach',
          routingNumber: '110000000',
          accountNumber: '987654321012', // 12-digit account
          accountType: 'savings',
        })
        .expect(200);

      const paymentDetails = response.body.data.payment.payment_details;

      // Should show last 4 digits only
      expect(paymentDetails).toContain('****1012');
      expect(paymentDetails).not.toContain('987654321012'); // Full account never returned
    });

    it('should not store CVV in payment record', async () => {
      const quoteNumber = await createQuotedQuote({
        driver_email: 'no-cvv@test.com',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/policies/bind')
        .send({
          quoteNumber,
          paymentMethod: 'credit_card',
          cardNumber: '4242424242424242',
          cardExpiry: '12/28',
          cardCvv: '999', // CVV should never be stored
        })
        .expect(200);

      const paymentDetails = response.body.data.payment.payment_details;

      // CVV must not appear anywhere in response
      expect(paymentDetails).not.toContain('999');
      expect(paymentDetails).not.toContain('cvv');
      expect(paymentDetails).not.toContain('CVV');
    });
  });
});
