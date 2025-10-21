import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 *
 * These tests verify the backend API endpoints are working correctly.
 * They test the actual HTTP responses from the NestJS backend.
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

test.describe('Quotes API', () => {
  test('POST /quotes - should create a new quote', async ({ request }) => {
    const quoteData = {
      driver: {
        firstName: 'John',
        lastName: 'Smith',
        birthDate: '1985-05-15',
        email: 'john.smith@example.com',
        phone: '555-0100',
      },
      address: {
        addressLine1: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
      },
      vehicle: {
        year: 2020,
        make: 'Honda',
        model: 'Accord',
        vin: '1HGBH41JXMN109186',
      },
    };

    const response = await request.post(`${API_BASE_URL}/quotes`, {
      data: quoteData,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('quote_id');
    expect(body.data).toHaveProperty('quote_number');
    expect(body.data.quote_number).toMatch(/^Q[A-Z0-9]{5}$/); // QXXXXX format
    expect(body.data).toHaveProperty('total_premium');
    expect(body.data.total_premium).toBeGreaterThan(0);
  });

  test('GET /quotes/:id - should retrieve quote by UUID', async ({ request }) => {
    // First create a quote
    const createResponse = await request.post(`${API_BASE_URL}/quotes`, {
      data: {
        driver: {
          firstName: 'Jane',
          lastName: 'Doe',
          birthDate: '1990-03-20',
          email: 'jane.doe@example.com',
          phone: '555-0200',
        },
        address: {
          addressLine1: '456 Market St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
        },
        vehicle: {
          year: 2019,
          make: 'Toyota',
          model: 'Camry',
          vin: '4T1B11HK1KU123456',
        },
      },
    });

    const createBody = await createResponse.json();
    const quoteId = createBody.data.quote_id;

    // Now retrieve it
    const getResponse = await request.get(`${API_BASE_URL}/quotes/${quoteId}`);

    expect(getResponse.ok()).toBeTruthy();
    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();
    expect(getBody.success).toBe(true);
    expect(getBody.data.quote_id).toBe(quoteId);
    expect(getBody.data.driver.firstName).toBe('Jane');
    expect(getBody.data.vehicle.make).toBe('Toyota');
  });

  test('GET /quotes/reference/:number - should retrieve quote by quote number', async ({ request }) => {
    // First create a quote
    const createResponse = await request.post(`${API_BASE_URL}/quotes`, {
      data: {
        driver: {
          firstName: 'Robert',
          lastName: 'Johnson',
          birthDate: '1955-12-10',
          email: 'robert.johnson@example.com',
          phone: '555-0300',
        },
        address: {
          addressLine1: '789 Broadway',
          city: 'New York',
          state: 'NY',
          zipCode: '10003',
        },
        vehicle: {
          year: 2021,
          make: 'Ford',
          model: 'F-150',
          vin: '1FTFW1E84MFA12345',
        },
      },
    });

    const createBody = await createResponse.json();
    const quoteNumber = createBody.data.quote_number;

    // Now retrieve by reference number
    const getResponse = await request.get(`${API_BASE_URL}/quotes/reference/${quoteNumber}`);

    expect(getResponse.ok()).toBeTruthy();
    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();
    expect(getBody.success).toBe(true);
    expect(getBody.data.quote_number).toBe(quoteNumber);
    expect(getBody.data.driver.firstName).toBe('Robert');
    expect(getBody.data.vehicle.make).toBe('Ford');
  });

  test('GET /quotes/:id - should return 404 for non-existent quote', async ({ request }) => {
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const response = await request.get(`${API_BASE_URL}/quotes/${fakeUuid}`);

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeTruthy();
  });

  test('POST /quotes - should validate required fields', async ({ request }) => {
    const incompleteData = {
      driver: {
        firstName: 'John',
        // Missing required fields
      },
    };

    const response = await request.post(`${API_BASE_URL}/quotes`, {
      data: incompleteData,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeTruthy();
  });
});

test.describe('API Performance', () => {
  test('quote creation should complete within 5 seconds', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.post(`${API_BASE_URL}/quotes`, {
      data: {
        driver: {
          firstName: 'Performance',
          lastName: 'Test',
          birthDate: '1990-01-01',
          email: 'perf.test@example.com',
          phone: '555-9999',
        },
        address: {
          addressLine1: '123 Test St',
          city: 'Test City',
          state: 'CA',
          zipCode: '90001',
        },
        vehicle: {
          year: 2020,
          make: 'Test',
          model: 'Model',
          vin: '1HGBH41JXMN109999',
        },
      },
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(5000); // 5 seconds as per CLAUDE.md requirement
  });

  test('quote retrieval should complete within 500ms', async ({ request }) => {
    // First create a quote
    const createResponse = await request.post(`${API_BASE_URL}/quotes`, {
      data: {
        driver: {
          firstName: 'Speed',
          lastName: 'Test',
          birthDate: '1990-01-01',
          email: 'speed.test@example.com',
          phone: '555-8888',
        },
        address: {
          addressLine1: '123 Fast St',
          city: 'Quick City',
          state: 'CA',
          zipCode: '90001',
        },
        vehicle: {
          year: 2020,
          make: 'Fast',
          model: 'Car',
          vin: '1HGBH41JXMN108888',
        },
      },
    });

    const createBody = await createResponse.json();
    const quoteId = createBody.data.quote_id;

    // Now test retrieval performance
    const startTime = Date.now();

    const getResponse = await request.get(`${API_BASE_URL}/quotes/${quoteId}`);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(getResponse.ok()).toBeTruthy();
    expect(duration).toBeLessThan(500); // 500ms as per CLAUDE.md requirement
  });
});

test.describe('API CORS', () => {
  test('should allow requests from frontend origin', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/quotes`, {
      data: {
        driver: {
          firstName: 'CORS',
          lastName: 'Test',
          birthDate: '1990-01-01',
          email: 'cors.test@example.com',
          phone: '555-7777',
        },
        address: {
          addressLine1: '123 CORS St',
          city: 'CORS City',
          state: 'CA',
          zipCode: '90001',
        },
        vehicle: {
          year: 2020,
          make: 'CORS',
          model: 'Model',
          vin: '1HGBH41JXMN107777',
        },
      },
      headers: {
        'Origin': 'http://localhost:5173',
      },
    });

    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeTruthy();
  });
});
