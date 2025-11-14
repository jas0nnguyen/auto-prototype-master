import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestLoadingAnimation } from '../../components/everest/specialized/EverestLoadingAnimation';
import { EverestText } from '../../components/everest/core/EverestText';
import { useCreateQuote } from '../../hooks/useQuote';
import { MOCK_VIN_DATABASE } from '../../../database/seeds/mock-vin-data';
import './LoadingPrefill.css';

/**
 * LoadingPrefill Screen (Screen 04 of 16) - Everest Design
 *
 * Orchestrates mock services and creates the quote:
 * 1. Verifying insurance history (~2s) - simulates external lookup
 * 2. Retrieving vehicle information (~2s) - simulates VIN decode
 * 3. Creating your quote (~2s) - actual POST /api/v1/quotes
 *
 * Design:
 * - Full-page loading animation with car icon
 * - Headline: "Climbing the mountain of data..."
 * - Progress bar showing completion percentage
 * - No card wrapper (full screen experience)
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
 */
function generateMockAdditionalDrivers(primaryDriver: { first_name: string; last_name: string; birth_date: string }) {
  const random = Math.random();
  if (random > 0.4) return [];

  const driverCount = random < 0.1 ? 2 : 1;
  const additionalDrivers = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < driverCount; i++) {
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

    const ageYears = Math.floor(Math.random() * (65 - 25 + 1)) + 25;
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - ageYears);
    birthDate.setMonth(Math.floor(Math.random() * 12));
    birthDate.setDate(Math.floor(Math.random() * 28) + 1);

    const gender = Math.random() < 0.5 ? 'M' : 'F';
    const relationships = ['Spouse', 'Child', 'Parent', 'Other'];
    const relationship = relationships[Math.floor(Math.random() * relationships.length)];

    additionalDrivers.push({
      first_name: randomDriver.firstName,
      last_name: randomDriver.lastName,
      birth_date: birthDate.toISOString().split('T')[0],
      gender,
      relationship,
      license_number: `D${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      license_state: 'CA',
    });
  }

  return additionalDrivers;
}

/**
 * Generate mock vehicles (1-3 vehicles total)
 */
function generateMockVehicles() {
  const random = Math.random();
  let vehicleCount = 1;
  if (random > 0.95) vehicleCount = 3;
  else if (random > 0.70) vehicleCount = 2;

  const vehicles = [];
  const usedVINs = new Set<string>();

  const bodyTypeMapping: { [key: string]: string } = {
    'Sedan': 'Sedan',
    'SUV': 'SUV',
    'Crew Cab Pickup': 'Pickup',
    'SuperCrew Pickup': 'Pickup',
    'Hatchback': 'Hatchback',
    'Wagon': 'Wagon',
  };

  for (let i = 0; i < vehicleCount; i++) {
    let randomVehicle;
    let attempts = 0;
    do {
      randomVehicle = MOCK_VIN_DATABASE[Math.floor(Math.random() * MOCK_VIN_DATABASE.length)];
      attempts++;
    } while (usedVINs.has(randomVehicle.vin) && attempts < 20);

    usedVINs.add(randomVehicle.vin);

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

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Verifying insurance history...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runPrefillFlow = async () => {
      try {
        // Get stored data from previous screens
        const quoteData = JSON.parse(sessionStorage.getItem('quote-v2-data') || '{}');

        if (!quoteData.getStarted || !quoteData.effectiveDate || !quoteData.email) {
          throw new Error('Missing required data. Please start from the beginning.');
        }

        // Step 1: Insurance history (0-33%)
        setCurrentStep('Verifying insurance history...');
        setProgress(10);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(33);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Vehicle information (33-66%)
        setCurrentStep('Retrieving vehicle information...');
        setProgress(40);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate mock data
        const mockVehicles = generateMockVehicles();
        const primaryVehicle = mockVehicles[0];
        const additionalDrivers = generateMockAdditionalDrivers({
          first_name: quoteData.getStarted.first_name,
          last_name: quoteData.getStarted.last_name,
          birth_date: quoteData.getStarted.birth_date,
        });

        console.log('[LoadingPrefill] Generated vehicles:', mockVehicles.length);
        console.log('[LoadingPrefill] Generated additional drivers:', additionalDrivers.length);

        // Store additional data
        if (mockVehicles.length > 1) {
          sessionStorage.setItem('quote-v2-additionalVehicles', JSON.stringify(mockVehicles.slice(1)));
        }
        if (additionalDrivers.length > 0) {
          sessionStorage.setItem('quote-v2-additionalDrivers', JSON.stringify(additionalDrivers));
        }

        setProgress(66);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Create quote (66-100%)
        setCurrentStep('Creating your quote...');
        setProgress(75);

        const phoneDigits = quoteData.email.mobile ? quoteData.email.mobile.replace(/\D/g, '') : '';
        const formattedPhone = phoneDigits ? `${phoneDigits.slice(0,3)}-${phoneDigits.slice(3,6)}-${phoneDigits.slice(6)}` : '';

        const quotePayload = {
          driver_first_name: quoteData.getStarted.first_name,
          driver_last_name: quoteData.getStarted.last_name,
          driver_birth_date: quoteData.getStarted.birth_date,
          driver_email: quoteData.email.email,
          driver_phone: formattedPhone || undefined,
          address_line_1: quoteData.getStarted.line_1_address,
          address_line_2: quoteData.getStarted.line_2_address || undefined,
          address_city: quoteData.getStarted.municipality_name,
          address_state: quoteData.getStarted.state_code,
          address_zip: quoteData.getStarted.postal_code,
          vehicle_year: primaryVehicle.year,
          vehicle_make: primaryVehicle.make,
          vehicle_model: primaryVehicle.model,
          vehicle_vin: primaryVehicle.vin,
          vehicle_annual_mileage: primaryVehicle.annual_mileage,
          vehicle_body_type: primaryVehicle.body_type,
          coverage_start_date: quoteData.effectiveDate,
          coverage_bodily_injury_limit: '100000/300000',
          coverage_property_damage_limit: '50000',
          coverage_medical_payments_limit: 5000,
          coverage_uninsured_motorist_bodily_injury: '100000/300000',
          coverage_underinsured_motorist_bodily_injury: '100000/300000',
          coverage_has_collision: true,
          coverage_collision_deductible: 500,
          coverage_has_comprehensive: true,
          coverage_comprehensive_deductible: 500,
          coverage_has_roadside: true,
        };

        const quoteResult = await createQuote.mutateAsync(quotePayload);
        setProgress(100);

        // Store quote number
        sessionStorage.setItem('quote-v2-quoteNumber', quoteResult.quoteNumber);

        // Navigate to summary
        setTimeout(() => {
          navigate(`/quote-v2/summary/${quoteResult.quoteNumber}`);
        }, 500);

      } catch (err) {
        console.error('[LoadingPrefill] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to create quote. Please try again.');
        setProgress(0);
      }
    };

    runPrefillFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <EverestLayout noBackgroundImage>
      <div className="loading-prefill-container">
        <EverestLoadingAnimation
          message={currentStep}
          progress={progress}
          overlay
        />

        {error && (
          <div className="loading-prefill-error">
            <EverestText variant="body" className="loading-prefill-error-message">
              {error}
            </EverestText>
            <EverestText variant="small">
              <a href="/quote-v2/get-started" className="loading-prefill-retry-link">
                Start over
              </a>
            </EverestText>
          </div>
        )}
      </div>
    </EverestLayout>
  );
};

export default LoadingPrefill;
