/**
 * Test Data Fixtures for E2E Tests
 *
 * This file contains reusable test data for auto insurance quote flows.
 * All data follows OMG P&C Data Model v1.0 conventions.
 */

export const testVehicles = {
  honda2020: {
    year: '2020',
    make: 'Honda',
    model: 'Accord',
    vin: '1HGBH41JXMN109186',
  },
  toyota2019: {
    year: '2019',
    make: 'Toyota',
    model: 'Camry',
    vin: '4T1B11HK1KU123456',
  },
  ford2021: {
    year: '2021',
    make: 'Ford',
    model: 'F-150',
    vin: '1FTFW1E84MFA12345',
  },
};

export const testDrivers = {
  john: {
    firstName: 'John',
    lastName: 'Smith',
    birthDate: '1985-05-15',
    email: 'john.smith@example.com',
    phone: '555-0100',
  },
  jane: {
    firstName: 'Jane',
    lastName: 'Doe',
    birthDate: '1990-03-20',
    email: 'jane.doe@example.com',
    phone: '555-0200',
  },
  senior: {
    firstName: 'Robert',
    lastName: 'Johnson',
    birthDate: '1955-12-10',
    email: 'robert.johnson@example.com',
    phone: '555-0300',
  },
};

export const testAddresses = {
  losAngeles: {
    addressLine1: '123 Main St',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
  },
  sanFrancisco: {
    addressLine1: '456 Market St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
  },
  newYork: {
    addressLine1: '789 Broadway',
    city: 'New York',
    state: 'NY',
    zipCode: '10003',
  },
};

export const testCoverages = {
  minimum: {
    bodilyInjuryLiability: '25/50',
    propertyDamageLiability: '25',
    collision: false,
    comprehensive: false,
  },
  standard: {
    bodilyInjuryLiability: '100/300',
    propertyDamageLiability: '100',
    collision: true,
    comprehensive: true,
    collisionDeductible: '500',
    comprehensiveDeductible: '500',
  },
  premium: {
    bodilyInjuryLiability: '250/500',
    propertyDamageLiability: '100',
    collision: true,
    comprehensive: true,
    collisionDeductible: '250',
    comprehensiveDeductible: '250',
    uninsuredMotorist: true,
    medicalPayments: '5000',
  },
};

/**
 * Complete quote request data for testing
 */
export const completeQuoteRequest = {
  vehicle: testVehicles.honda2020,
  driver: testDrivers.john,
  address: testAddresses.losAngeles,
  coverage: testCoverages.standard,
};
