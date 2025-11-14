import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Container, Text } from '@sureapp/canary-design-system';
import { TechStartupLayout } from './components/shared/TechStartupLayout';
import { LoadingAnimation, LoadingStep } from './components/LoadingAnimation';
import { ScreenProgress } from './components/ScreenProgress';
import { useCreateQuote } from '../../hooks/useQuote';
import { MOCK_VIN_DATABASE } from '../../../database/seeds/mock-vin-data';

/**
 * LoadingPrefill Screen (Screen 04 of 19) - T089
 *
 * Orchestrates mock services and creates the quote:
 * 1. Verifying insurance history (~2s) - simulates external lookup
 * 2. Retrieving vehicle information (~2s) - simulates VIN decode
 * 3. Creating your quote (~2s) - actual POST /api/v1/quotes
 *
 * After completion, navigates to Summary with quote number in URL
 *
 * Mock Data Randomization:
 * - Vehicles: 70% chance of 1 vehicle, 25% chance of 2 vehicles, 5% chance of 3 vehicles
 *   Randomly selected from 18 vehicle options in MOCK_VIN_DATABASE
 * - Additional Drivers: 60% chance of 0, 30% chance of 1 additional driver, 10% chance of 2 drivers
 * - Annual Mileage: Random between 8,000-20,000 miles per vehicle
 */

/**
 * Mock additional driver names pool
 */
const MOCK_DRIVER_NAMES = [
  { firstName: 'Sarah', lastName: 'Johnson' },
  { firstName: 'Michael', lastName: 'Williams' },
  { firstName: 'Emily', lastName: 'Brown' },
  { firstName: 'David', lastName: 'Davis' },
  { firstName: 'Jessica', lastName: 'Miller' },
  { firstName: 'Christopher', lastName: 'Wilson' },
  { firstName: 'Ashley', lastName: 'Moore' },
  { firstName: 'Matthew', lastName: 'Taylor' },
  { firstName: 'Amanda', lastName: 'Anderson' },
  { firstName: 'Joshua', lastName: 'Thomas' },
];

/**
 * Generate mock additional drivers (0-2 drivers)
 * - 60% chance: 0 additional drivers (primary only)
 * - 30% chance: 1 additional driver
 * - 10% chance: 2 additional drivers
 */
function generateMockAdditionalDrivers(primaryDriver: { first_name: string; last_name: string; birth_date: string }) {
  const random = Math.random();

  // 60% chance of no additional drivers
  if (random > 0.4) {
    return [];
  }

  // 10% chance of 2 additional drivers
  const driverCount = random < 0.1 ? 2 : 1;

  const additionalDrivers = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < driverCount; i++) {
    // Pick random name (avoid primary driver's name and duplicates)
    let randomDriver;
    let attempts = 0;
    do {
      randomDriver = MOCK_DRIVER_NAMES[Math.floor(Math.random() * MOCK_DRIVER_NAMES.length)];
      attempts++;
    } while (
      (randomDriver.firstName === primaryDriver.first_name &&
       randomDriver.lastName === primaryDriver.last_name) ||
      usedNames.has(`${randomDriver.firstName} ${randomDriver.lastName}`) &&
      attempts < 20
    );

    usedNames.add(`${randomDriver.firstName} ${randomDriver.lastName}`);

    // Generate birth date (25-65 years old)
    const ageYears = Math.floor(Math.random() * (65 - 25 + 1)) + 25;
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - ageYears);
    birthDate.setMonth(Math.floor(Math.random() * 12));
    birthDate.setDate(Math.floor(Math.random() * 28) + 1); // Safe day range

    // Random gender
    const gender = Math.random() < 0.5 ? 'M' : 'F';

    // Random relationship
    const relationships = ['Spouse', 'Child', 'Parent', 'Other'];
    const relationship = relationships[Math.floor(Math.random() * relationships.length)];

    additionalDrivers.push({
      first_name: randomDriver.firstName,
      last_name: randomDriver.lastName,
      birth_date: birthDate.toISOString().split('T')[0],
      gender,
      relationship,
      license_number: `D${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      license_state: 'CA', // Same state as primary
    });
  }

  return additionalDrivers;
}

/**
 * Generate mock additional vehicles (1-3 vehicles total)
 * - 70% chance: 1 vehicle only
 * - 25% chance: 2 vehicles
 * - 5% chance: 3 vehicles
 */
function generateMockVehicles() {
  const random = Math.random();

  // Determine number of vehicles
  let vehicleCount = 1; // Default: 1 vehicle
  if (random > 0.95) {
    vehicleCount = 3; // 5% chance
  } else if (random > 0.70) {
    vehicleCount = 2; // 25% chance
  }

  const vehicles = [];
  const usedVINs = new Set<string>();

  // Map body_style to body_type (backend expects specific values)
  const bodyTypeMapping: { [key: string]: string } = {
    'Sedan': 'Sedan',
    'SUV': 'SUV',
    'Crew Cab Pickup': 'Pickup',
    'SuperCrew Pickup': 'Pickup',
    'Hatchback': 'Hatchback',
    'Wagon': 'Wagon',
  };

  for (let i = 0; i < vehicleCount; i++) {
    // Pick random vehicle (avoid duplicates)
    let randomVehicle;
    let attempts = 0;
    do {
      randomVehicle = MOCK_VIN_DATABASE[Math.floor(Math.random() * MOCK_VIN_DATABASE.length)];
      attempts++;
    } while (usedVINs.has(randomVehicle.vin) && attempts < 20);

    usedVINs.add(randomVehicle.vin);

    // Randomize annual mileage (8,000 - 20,000 miles)
    const randomMileage = Math.floor(Math.random() * (20000 - 8000 + 1)) + 8000;

    vehicles.push({
      year: randomVehicle.year,
      make: randomVehicle.make,
      model: randomVehicle.model,
      vin: randomVehicle.vin,
      annual_mileage: randomMileage,
      body_type: bodyTypeMapping[randomVehicle.body_style] || 'Sedan',
      trim: randomVehicle.trim,
      body_style: randomVehicle.body_style,
    });
  }

  return vehicles;
}

const LoadingPrefill: React.FC = () => {
  const navigate = useNavigate();
  const createQuote = useCreateQuote();

  const [steps, setSteps] = useState<LoadingStep[]>([
    { label: 'Verifying insurance history', status: 'pending' },
    { label: 'Retrieving vehicle information', status: 'pending' },
    { label: 'Creating your quote', status: 'pending' },
  ]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // T089: Load prefill orchestration with actual quote creation
    const runPrefillFlow = async () => {
      try {
        // Get stored data from previous screens
        const quoteData = JSON.parse(sessionStorage.getItem('quote-v2-data') || '{}');

        if (!quoteData.getStarted || !quoteData.effectiveDate || !quoteData.email) {
          throw new Error('Missing required data. Please start from the beginning.');
        }

        // Step 1: Insurance history (mock - 2s delay)
        setSteps(prev => prev.map((step, i) =>
          i === 0 ? { ...step, status: 'loading' as const } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSteps(prev => prev.map((step, i) =>
          i === 0 ? { ...step, status: 'completed' as const } : step
        ));

        // Step 2: Vehicle information (mock - 2s delay)
        // In a real implementation, this would decode VIN and get vehicle details
        setSteps(prev => prev.map((step, i) =>
          i === 1 ? { ...step, status: 'loading' as const } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate mock vehicles (1-3 vehicles)
        const mockVehicles = generateMockVehicles();
        const primaryVehicle = mockVehicles[0]; // First vehicle for quote creation

        // Generate mock additional drivers (optional)
        const additionalDrivers = generateMockAdditionalDrivers({
          first_name: quoteData.getStarted.first_name,
          last_name: quoteData.getStarted.last_name,
          birth_date: quoteData.getStarted.birth_date,
        });

        console.log('[LoadingPrefill] Randomly generated vehicles:', mockVehicles.map(v => ({
          make: v.make,
          model: v.model,
          year: v.year,
          trim: v.trim,
          body_style: v.body_style,
          vin: v.vin,
          mileage: v.annual_mileage,
        })));

        if (additionalDrivers.length > 0) {
          console.log('[LoadingPrefill] Generated additional drivers:', additionalDrivers);
        }

        // Store additional vehicles for later use in Summary screen
        if (mockVehicles.length > 1) {
          sessionStorage.setItem('quote-v2-additionalVehicles', JSON.stringify(mockVehicles.slice(1)));
          console.log('[LoadingPrefill] Stored additional vehicles:', mockVehicles.length - 1);
        }

        // Store additional drivers for later use in Summary screen
        if (additionalDrivers.length > 0) {
          sessionStorage.setItem('quote-v2-additionalDrivers', JSON.stringify(additionalDrivers));
        }

        setSteps(prev => prev.map((step, i) =>
          i === 1 ? { ...step, status: 'completed' as const } : step
        ));

        // Step 3: Create quote (actual API call)
        setSteps(prev => prev.map((step, i) =>
          i === 2 ? { ...step, status: 'loading' as const } : step
        ));

        // Format phone number for API (remove formatting)
        const phoneDigits = quoteData.email.mobile ? quoteData.email.mobile.replace(/\D/g, '') : '';
        const formattedPhone = phoneDigits ? `${phoneDigits.slice(0,3)}-${phoneDigits.slice(3,6)}-${phoneDigits.slice(6)}` : '';

        // Create quote with collected data
        const quotePayload = {
          // Primary driver info (from GetStarted)
          driver_first_name: quoteData.getStarted.first_name,
          driver_last_name: quoteData.getStarted.last_name,
          driver_birth_date: quoteData.getStarted.birth_date,
          driver_email: quoteData.email.email,
          driver_phone: formattedPhone || undefined,

          // Address (from GetStarted)
          address_line_1: quoteData.getStarted.line_1_address,
          address_line_2: quoteData.getStarted.line_2_address || undefined,
          address_city: quoteData.getStarted.municipality_name,
          address_state: quoteData.getStarted.state_code,
          address_zip: quoteData.getStarted.postal_code,

          // Vehicle (from mock service) - fixed to use legacy format
          vehicle_year: primaryVehicle.year,
          vehicle_make: primaryVehicle.make,
          vehicle_model: primaryVehicle.model,
          vehicle_vin: primaryVehicle.vin,
          vehicle_annual_mileage: primaryVehicle.annual_mileage,
          vehicle_body_type: primaryVehicle.body_type,

          // Coverage start date (from EffectiveDate)
          coverage_start_date: quoteData.effectiveDate,

          // Default coverages - match Coverage screen defaults
          // This ensures Summary screen shows accurate initial premium
          coverage_bodily_injury_limit: '100000/300000',
          coverage_property_damage_limit: '50000',
          coverage_medical_payments_limit: 5000,
          coverage_uninsured_motorist_bodily_injury: '100000/300000',
          coverage_underinsured_motorist_bodily_injury: '100000/300000',
          coverage_has_collision: true,
          coverage_collision_deductible: 500,
          coverage_has_comprehensive: true,
          coverage_comprehensive_deductible: 500,
          coverage_has_roadside: true, // Always included
        };

        console.log('[LoadingPrefill] Creating quote with payload:', quotePayload);
        console.log('[LoadingPrefill] Coverage fields in payload:', {
          coverage_bodily_injury_limit: quotePayload.coverage_bodily_injury_limit,
          coverage_property_damage_limit: quotePayload.coverage_property_damage_limit,
          coverage_medical_payments_limit: quotePayload.coverage_medical_payments_limit,
          coverage_uninsured_motorist_bodily_injury: quotePayload.coverage_uninsured_motorist_bodily_injury,
          coverage_underinsured_motorist_bodily_injury: quotePayload.coverage_underinsured_motorist_bodily_injury,
          coverage_has_collision: quotePayload.coverage_has_collision,
          coverage_collision_deductible: quotePayload.coverage_collision_deductible,
          coverage_has_comprehensive: quotePayload.coverage_has_comprehensive,
          coverage_comprehensive_deductible: quotePayload.coverage_comprehensive_deductible,
          coverage_has_roadside: quotePayload.coverage_has_roadside,
        });
        const quoteResult = await createQuote.mutateAsync(quotePayload);

        setSteps(prev => prev.map((step, i) =>
          i === 2 ? { ...step, status: 'completed' as const } : step
        ));

        // Store quote number for later use
        sessionStorage.setItem('quote-v2-quoteNumber', quoteResult.quoteNumber);

        // Navigate to summary with quote number
        setTimeout(() => {
          navigate(`/quote-v2/summary/${quoteResult.quoteNumber}`);
        }, 500);

      } catch (err) {
        console.error('[LoadingPrefill] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to create quote. Please try again.');
        setSteps(prev => prev.map(step =>
          step.status === 'loading' ? { ...step, status: 'pending' as const } : step
        ));
      }
    };

    runPrefillFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <TechStartupLayout>
      <ScreenProgress currentScreen={4} totalScreens={19} />

      <Container padding="large">
        <Layout display="flex-column" gap="large" flexAlign="center" flexJustify="center">
          <LoadingAnimation steps={steps} />

          {error && (
            <Layout display="flex-column" gap="small" flexAlign="center" style={{ marginTop: '32px' }}>
              <Text variant="body-regular" color="error" align="center">
                {error}
              </Text>
              <Text variant="body-small" color="subtle" align="center">
                <a href="/quote-v2/get-started" style={{ color: '#667eea', textDecoration: 'underline' }}>
                  Start over
                </a>
              </Text>
            </Layout>
          )}
        </Layout>
      </Container>
    </TechStartupLayout>
  );
};

export default LoadingPrefill;
