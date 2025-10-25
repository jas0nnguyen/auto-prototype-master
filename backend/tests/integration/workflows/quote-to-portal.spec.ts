/**
 * T167: End-to-End Workflow Integration Test
 *
 * Complete user journey from quote creation to portal access.
 * This test validates the entire application flow:
 * 1. Create multi-driver/vehicle quote (Progressive flow simulation)
 * 2. Update drivers (add spouse, add teen driver)
 * 3. Update vehicles (add second vehicle)
 * 4. Update coverage selections
 * 5. Bind quote to policy with payment
 * 6. Activate policy (BOUND → IN_FORCE)
 * 7. Access portal with policy number
 * 8. View dashboard with multi-driver/vehicle data
 * 9. File claim with vehicle/driver selection
 * 10. Verify complete workflow success
 *
 * This is the most comprehensive integration test, validating
 * all API controllers working together in a real-world scenario.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('Quote-to-Portal End-to-End Workflow (T167)', () => {
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

  it('should complete full quote-to-portal workflow successfully', async () => {
    // ========================================
    // STEP 1: Create Initial Quote (Single Driver, Single Vehicle)
    // ========================================
    console.log('\n[STEP 1] Creating initial quote with primary driver and vehicle...');

    const step1Response = await request(app.getHttpServer())
      .post('/api/v1/quotes')
      .send({
        driver_first_name: 'Emily',
        driver_last_name: 'Johnson',
        driver_birth_date: '1985-04-12',
        driver_email: 'emily.johnson@example.com',
        driver_phone: '555-E2E-0001',
        driver_gender: 'Female',
        driver_marital_status: 'Married',
        driver_years_licensed: 15,

        address_line_1: '1234 Maple Street',
        address_line_2: 'Unit 5B',
        address_city: 'Portland',
        address_state: 'OR',
        address_zip: '97201',

        vehicle_year: 2021,
        vehicle_make: 'Honda',
        vehicle_model: 'CR-V',
        vehicle_vin: '2HKRW2H85MH123456',
        vehicle_annual_mileage: 12000,
        vehicle_body_type: 'SUV',
        vehicle_usage: 'commute',
      })
      .expect(201);

    const quoteNumber = step1Response.body.quoteNumber;
    const quoteId = step1Response.body.quoteId;

    expect(quoteNumber).toMatch(/^DZ[A-Z0-9]{8}$/);
    expect(step1Response.body.status).toBe('INCOMPLETE');
    expect(step1Response.body.premium).toBeGreaterThan(0);

    console.log(`✓ Quote created: ${quoteNumber} (Status: INCOMPLETE)`);

    // ========================================
    // STEP 2: Add Spouse Driver
    // ========================================
    console.log('\n[STEP 2] Adding spouse driver...');

    const step2Response = await request(app.getHttpServer())
      .put(`/api/v1/quotes/${quoteNumber}/drivers`)
      .send({
        additionalDrivers: [
          {
            first_name: 'Michael',
            last_name: 'Johnson',
            birth_date: '1983-08-22',
            email: 'michael.johnson@example.com',
            phone: '555-E2E-0002',
            gender: 'Male',
            marital_status: 'Married',
            years_licensed: 17,
            relationship: 'spouse',
          },
        ],
      })
      .expect(200);

    expect(step2Response.body.drivers.length).toBeGreaterThanOrEqual(2);
    expect(step2Response.body.quoteNumber).toBe(quoteNumber);

    console.log('✓ Spouse driver added (Total drivers: 2)');

    // ========================================
    // STEP 3: Add Second Vehicle
    // ========================================
    console.log('\n[STEP 3] Adding second vehicle...');

    const step3Response = await request(app.getHttpServer())
      .put(`/api/v1/quotes/${quoteNumber}/vehicles`)
      .send({
        vehicles: [
          {
            year: 2021,
            make: 'Honda',
            model: 'CR-V',
            vin: '2HKRW2H85MH123456', // Original vehicle
            annual_mileage: 12000,
            body_type: 'SUV',
          },
          {
            year: 2019,
            make: 'Toyota',
            model: 'Highlander',
            vin: '5TDJZRFH5KS987654', // Second vehicle
            annual_mileage: 10000,
            body_type: 'SUV',
            usage: 'pleasure',
          },
        ],
      })
      .expect(200);

    expect(step3Response.body.vehicles).toHaveLength(2);
    expect(step3Response.body.quoteNumber).toBe(quoteNumber);

    console.log('✓ Second vehicle added (Total vehicles: 2)');

    // ========================================
    // STEP 4: Add Teen Driver
    // ========================================
    console.log('\n[STEP 4] Adding teen driver...');

    const step4Response = await request(app.getHttpServer())
      .put(`/api/v1/quotes/${quoteNumber}/drivers`)
      .send({
        additionalDrivers: [
          {
            first_name: 'Michael',
            last_name: 'Johnson',
            birth_date: '1983-08-22',
            email: 'michael.johnson@example.com',
            phone: '555-E2E-0002',
            gender: 'Male',
            marital_status: 'Married',
            years_licensed: 17,
            relationship: 'spouse',
          },
          {
            first_name: 'Sarah',
            last_name: 'Johnson',
            birth_date: '2007-06-15', // 18 years old
            email: 'sarah.johnson@example.com',
            phone: '555-E2E-0003',
            gender: 'Female',
            marital_status: 'Single',
            years_licensed: 1,
            relationship: 'child',
          },
        ],
      })
      .expect(200);

    expect(step4Response.body.drivers.length).toBeGreaterThanOrEqual(3);

    console.log('✓ Teen driver added (Total drivers: 3)');

    // ========================================
    // STEP 5: Update Coverage Selections and Finalize Quote
    // ========================================
    console.log('\n[STEP 5] Updating coverage selections and finalizing quote...');

    const step5Response = await request(app.getHttpServer())
      .put(`/api/v1/quotes/${quoteNumber}/coverage`)
      .send({
        coverage_start_date: '2025-12-01',
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

    expect(step5Response.body.status).toBe('QUOTED');
    expect(step5Response.body.premium).toBeGreaterThan(0);
    expect(step5Response.body.drivers).toHaveLength(3);
    expect(step5Response.body.vehicles).toHaveLength(2);

    const quotedPremium = step5Response.body.premium;

    console.log(`✓ Quote finalized (Status: QUOTED, Premium: $${quotedPremium})`);

    // ========================================
    // STEP 6: Bind Quote to Policy with Payment
    // ========================================
    console.log('\n[STEP 6] Binding quote to policy with credit card payment...');

    const step6Response = await request(app.getHttpServer())
      .post('/api/v1/policies/bind')
      .send({
        quoteNumber,
        paymentMethod: 'credit_card',
        cardNumber: '4242424242424242', // Valid test card
        cardExpiry: '12/28',
        cardCvv: '123',
      })
      .expect(200);

    expect(step6Response.body.success).toBe(true);
    expect(step6Response.body.data.policyNumber).toBe(quoteNumber);
    expect(step6Response.body.data.status).toBe('BOUND');
    expect(step6Response.body.data.payment).toBeTruthy();
    expect(step6Response.body.data.payment.status_code).toBe('COMPLETED');
    expect(step6Response.body.data.payment.payment_details).toContain('****4242');
    expect(step6Response.body.data.documents).toBeInstanceOf(Array);
    expect(step6Response.body.data.documents.length).toBeGreaterThan(0);

    const policyId = step6Response.body.data.policyId;

    console.log(`✓ Policy bound successfully (Policy ID: ${policyId}, Status: BOUND)`);
    console.log(`  Payment processed: ${step6Response.body.data.payment.payment_method_type}`);
    console.log(`  Documents generated: ${step6Response.body.data.documents.length}`);

    // ========================================
    // STEP 7: Activate Policy (BOUND → IN_FORCE)
    // ========================================
    console.log('\n[STEP 7] Activating policy...');

    const step7Response = await request(app.getHttpServer())
      .post(`/api/v1/policies/${policyId}/activate`)
      .expect(200);

    expect(step7Response.body.success).toBe(true);
    expect(step7Response.body.data.status).toBe('IN_FORCE');
    expect(step7Response.body.data.effectiveDate).toBeTruthy();
    expect(step7Response.body.data.expirationDate).toBeTruthy();

    console.log('✓ Policy activated (Status: IN_FORCE)');
    console.log(`  Effective Date: ${step7Response.body.data.effectiveDate}`);
    console.log(`  Expiration Date: ${step7Response.body.data.expirationDate}`);

    // ========================================
    // STEP 8: Access Portal with Policy Number
    // ========================================
    console.log('\n[STEP 8] Accessing portal dashboard...');

    const step8Response = await request(app.getHttpServer())
      .get(`/api/v1/portal/${quoteNumber}/dashboard`)
      .expect(200);

    expect(step8Response.body.success).toBe(true);
    expect(step8Response.body.data).toBeTruthy();
    expect(step8Response.body.data.policy).toBeTruthy();
    expect(step8Response.body.data.policy.policy_number).toBe(quoteNumber);

    // Validate multi-driver/vehicle data in dashboard
    expect(step8Response.body.data.drivers).toBeInstanceOf(Array);
    expect(step8Response.body.data.drivers.length).toBeGreaterThanOrEqual(3);
    expect(step8Response.body.data.vehicles).toBeInstanceOf(Array);
    expect(step8Response.body.data.vehicles.length).toBeGreaterThanOrEqual(2);

    // Validate premium breakdown
    expect(step8Response.body.data.premiumBreakdown).toBeTruthy();
    expect(step8Response.body.data.premiumBreakdown.total).toBe(quotedPremium);

    // Validate payments
    expect(step8Response.body.data.payments).toBeInstanceOf(Array);
    expect(step8Response.body.data.payments.length).toBeGreaterThan(0);

    console.log('✓ Dashboard accessed successfully');
    console.log(`  Policy: ${step8Response.body.data.policy.policy_number}`);
    console.log(`  Drivers: ${step8Response.body.data.drivers.length}`);
    console.log(`  Vehicles: ${step8Response.body.data.vehicles.length}`);
    console.log(`  Premium: $${step8Response.body.data.premiumBreakdown.total}`);

    // ========================================
    // STEP 9: View Policy Details
    // ========================================
    console.log('\n[STEP 9] Viewing policy details...');

    const step9Response = await request(app.getHttpServer())
      .get(`/api/v1/portal/${quoteNumber}/policy`)
      .expect(200);

    expect(step9Response.body.success).toBe(true);
    expect(step9Response.body.data).toBeTruthy();
    expect(step9Response.body.data.policy_number).toBe(quoteNumber);
    expect(step9Response.body.data.status_code).toBe('IN_FORCE');

    console.log('✓ Policy details retrieved');

    // ========================================
    // STEP 10: View Billing History
    // ========================================
    console.log('\n[STEP 10] Viewing billing history...');

    const step10Response = await request(app.getHttpServer())
      .get(`/api/v1/portal/${quoteNumber}/billing`)
      .expect(200);

    expect(step10Response.body.success).toBe(true);
    expect(step10Response.body.data).toBeInstanceOf(Array);
    expect(step10Response.body.data.length).toBeGreaterThan(0);

    // Verify initial payment is in billing history
    const initialPayment = step10Response.body.data.find(
      (p: any) => p.status_code === 'COMPLETED'
    );
    expect(initialPayment).toBeTruthy();
    expect(initialPayment.payment_method_type).toBe('credit_card');

    console.log(`✓ Billing history retrieved (${step10Response.body.data.length} payment(s))`);

    // ========================================
    // STEP 11: File a New Claim
    // ========================================
    console.log('\n[STEP 11] Filing a new claim...');

    const step11Response = await request(app.getHttpServer())
      .post(`/api/v1/portal/${quoteNumber}/claims`)
      .send({
        incident_date: '2025-11-20',
        loss_type: 'COLLISION',
        description: 'Rear-ended at stoplight on Main Street. Other driver admitted fault.',
        vehicle_identifier: '2HKRW2H85MH123456', // Honda CR-V VIN
        driver_identifier: 'emily.johnson@example.com', // Primary driver
      })
      .expect(201);

    expect(step11Response.body.success).toBe(true);
    expect(step11Response.body.data).toBeTruthy();
    expect(step11Response.body.data.claim_identifier).toBeTruthy();
    expect(step11Response.body.data.claim_number).toBeTruthy();
    expect(step11Response.body.data.status_code).toBeTruthy();

    const claimId = step11Response.body.data.claim_identifier;
    const claimNumber = step11Response.body.data.claim_number;

    console.log(`✓ Claim filed successfully (Claim Number: ${claimNumber})`);
    console.log(`  Loss Type: COLLISION`);
    console.log(`  Vehicle: Honda CR-V (VIN: 2HKRW2H85MH123456)`);

    // ========================================
    // STEP 12: View Claims List
    // ========================================
    console.log('\n[STEP 12] Viewing claims list...');

    const step12Response = await request(app.getHttpServer())
      .get(`/api/v1/portal/${quoteNumber}/claims`)
      .expect(200);

    expect(step12Response.body.success).toBe(true);
    expect(step12Response.body.data).toBeInstanceOf(Array);
    expect(step12Response.body.data.length).toBeGreaterThan(0);

    // Verify filed claim appears in list
    const filedClaim = step12Response.body.data.find(
      (c: any) => c.claim_identifier === claimId
    );
    expect(filedClaim).toBeTruthy();
    expect(filedClaim.claim_number).toBe(claimNumber);

    console.log(`✓ Claims list retrieved (${step12Response.body.data.length} claim(s))`);

    // ========================================
    // STEP 13: View Claim Details
    // ========================================
    console.log('\n[STEP 13] Viewing claim details...');

    const step13Response = await request(app.getHttpServer())
      .get(`/api/v1/portal/${quoteNumber}/claims/${claimId}`)
      .expect(200);

    expect(step13Response.body.success).toBe(true);
    expect(step13Response.body.data).toBeTruthy();
    expect(step13Response.body.data.claim_identifier).toBe(claimId);
    expect(step13Response.body.data.claim_number).toBe(claimNumber);
    expect(step13Response.body.data.incident_date).toBeTruthy();
    expect(step13Response.body.data.description).toBeTruthy();

    console.log('✓ Claim details retrieved');
    console.log(`  Claim Number: ${step13Response.body.data.claim_number}`);
    console.log(`  Status: ${step13Response.body.data.status_code}`);
    console.log(`  Incident Date: ${step13Response.body.data.incident_date}`);

    // ========================================
    // FINAL VALIDATION
    // ========================================
    console.log('\n[FINAL VALIDATION] Verifying complete workflow...');

    // Verify policy is still IN_FORCE
    const finalPolicyCheck = await request(app.getHttpServer())
      .get(`/api/v1/policies/${quoteNumber}`)
      .expect(200);

    expect(finalPolicyCheck.body.data.status_code).toBe('IN_FORCE');

    // Verify all multi-driver/vehicle data preserved
    const finalDashboardCheck = await request(app.getHttpServer())
      .get(`/api/v1/portal/${quoteNumber}/dashboard`)
      .expect(200);

    expect(finalDashboardCheck.body.data.drivers).toHaveLength(3);
    expect(finalDashboardCheck.body.data.vehicles).toHaveLength(2);
    expect(finalDashboardCheck.body.data.claims).toHaveLength(1);

    console.log('\n✅ COMPLETE WORKFLOW PASSED');
    console.log('====================================');
    console.log('Summary:');
    console.log(`  Quote Number: ${quoteNumber}`);
    console.log(`  Policy ID: ${policyId}`);
    console.log(`  Status: IN_FORCE`);
    console.log(`  Drivers: 3 (Primary + Spouse + Teen)`);
    console.log(`  Vehicles: 2 (Honda CR-V + Toyota Highlander)`);
    console.log(`  Premium: $${quotedPremium}`);
    console.log(`  Payment: Processed (Credit Card)`);
    console.log(`  Documents: Generated`);
    console.log(`  Claims: 1 (COLLISION)`);
    console.log('====================================\n');
  });

  it('should handle workflow with ACH payment instead of credit card', async () => {
    console.log('\n[ACH WORKFLOW] Testing with ACH payment...');

    // Create quote
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/quotes')
      .send({
        driver_first_name: 'David',
        driver_last_name: 'Smith',
        driver_birth_date: '1978-09-05',
        driver_email: 'david.smith@example.com',
        driver_phone: '555-ACH-0001',
        address_line_1: '5678 Oak Avenue',
        address_city: 'Seattle',
        address_state: 'WA',
        address_zip: '98101',
        vehicle_year: 2020,
        vehicle_make: 'Tesla',
        vehicle_model: 'Model 3',
        vehicle_vin: '5YJ3E1EA3LF123456',
      })
      .expect(201);

    const quoteNumber = createResponse.body.quoteNumber;

    // Finalize coverage
    await request(app.getHttpServer())
      .put(`/api/v1/quotes/${quoteNumber}/coverage`)
      .send({
        coverage_bodily_injury_limit: '100000/300000',
        coverage_property_damage_limit: '50000',
        coverage_collision: true,
        coverage_collision_deductible: 1000,
      })
      .expect(200);

    // Bind with ACH
    const bindResponse = await request(app.getHttpServer())
      .post('/api/v1/policies/bind')
      .send({
        quoteNumber,
        paymentMethod: 'ach',
        routingNumber: '110000000',
        accountNumber: '000123456789',
        accountType: 'checking',
      })
      .expect(200);

    expect(bindResponse.body.data.payment.payment_method_type).toBe('ach');
    expect(bindResponse.body.data.payment.payment_details).toContain('****6789');

    console.log('✓ ACH payment workflow completed successfully');
  });

  it('should handle workflow with maximum drivers and vehicles', async () => {
    console.log('\n[MAX ENTITIES] Testing with 4 drivers and 4 vehicles...');

    // Create multi-driver/vehicle quote
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/quotes')
      .send({
        drivers: [
          {
            first_name: 'Primary',
            last_name: 'MaxTest',
            birth_date: '1970-01-01',
            email: 'primary@maxtest.com',
            phone: '555-MAX-0001',
            is_primary: true,
          },
          {
            first_name: 'Spouse',
            last_name: 'MaxTest',
            birth_date: '1972-02-02',
            email: 'spouse@maxtest.com',
            phone: '555-MAX-0002',
            relationship: 'spouse',
          },
          {
            first_name: 'Teen1',
            last_name: 'MaxTest',
            birth_date: '2007-03-03',
            email: 'teen1@maxtest.com',
            phone: '555-MAX-0003',
            relationship: 'child',
          },
          {
            first_name: 'Teen2',
            last_name: 'MaxTest',
            birth_date: '2008-04-04',
            email: 'teen2@maxtest.com',
            phone: '555-MAX-0004',
            relationship: 'child',
          },
        ],
        vehicles: [
          {
            year: 2023,
            make: 'Toyota',
            model: 'Camry',
            vin: '4T1B11HK9PU123456',
          },
          {
            year: 2022,
            make: 'Honda',
            model: 'Accord',
            vin: '1HGCV1F39NA123456',
          },
          {
            year: 2021,
            make: 'Mazda',
            model: 'CX-5',
            vin: 'JM3KFBDL5M0123456',
          },
          {
            year: 2020,
            make: 'Subaru',
            model: 'Outback',
            vin: '4S4BTANC5L3123456',
          },
        ],
        address_line_1: '9999 Max Capacity Blvd',
        address_city: 'Austin',
        address_state: 'TX',
        address_zip: '78701',
      })
      .expect(201);

    const quoteNumber = createResponse.body.quoteNumber;
    expect(createResponse.body.drivers).toHaveLength(4);
    expect(createResponse.body.vehicles).toHaveLength(4);

    // Finalize and bind
    await request(app.getHttpServer())
      .put(`/api/v1/quotes/${quoteNumber}/coverage`)
      .send({
        coverage_bodily_injury_limit: '100000/300000',
        coverage_property_damage_limit: '50000',
        coverage_collision: true,
        coverage_collision_deductible: 500,
      })
      .expect(200);

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

    await request(app.getHttpServer())
      .post(`/api/v1/policies/${quoteNumber}/activate`)
      .expect(200);

    // Access portal
    const dashboardResponse = await request(app.getHttpServer())
      .get(`/api/v1/portal/${quoteNumber}/dashboard`)
      .expect(200);

    expect(dashboardResponse.body.data.drivers).toHaveLength(4);
    expect(dashboardResponse.body.data.vehicles).toHaveLength(4);

    console.log('✓ Maximum entities workflow completed successfully');
    console.log(`  Drivers: ${dashboardResponse.body.data.drivers.length}`);
    console.log(`  Vehicles: ${dashboardResponse.body.data.vehicles.length}`);
  });
});
