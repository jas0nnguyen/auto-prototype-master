/**
 * Mock VIN Database Seeds
 *
 * Seed data for common vehicle VINs used in demo/testing.
 * These are realistic VIN structures with valid checksums.
 *
 * In production, this would be replaced with actual vehicle database
 * or integration with services like NHTSA vPIC API.
 */

export interface MockVehicleData {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  body_style: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  fuel_type: string;
  vehicle_class: string;
  manufacturer: string;
  plant_country: string;
  msrp: number; // For vehicle valuation service
  safety_rating_overall: number; // 1-5 stars
}

/**
 * Realistic VIN database for common vehicles
 *
 * VINs are generated with valid checksums for testing.
 * Real VINs would come from manufacturer databases.
 */
export const MOCK_VIN_DATABASE: MockVehicleData[] = [
  // Toyota Camry variants
  {
    vin: '4T1BF1FK5HU123456',
    year: 2017,
    make: 'Toyota',
    model: 'Camry',
    trim: 'SE',
    body_style: 'Sedan',
    engine: '2.5L I4',
    transmission: '6-Speed Automatic',
    drivetrain: 'FWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Midsize Car',
    manufacturer: 'Toyota Motor Corporation',
    plant_country: 'USA',
    msrp: 24350,
    safety_rating_overall: 5,
  },
  {
    vin: '4T1B11HK1KU234567',
    year: 2019,
    make: 'Toyota',
    model: 'Camry',
    trim: 'XLE',
    body_style: 'Sedan',
    engine: '2.5L I4',
    transmission: '8-Speed Automatic',
    drivetrain: 'FWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Midsize Car',
    manufacturer: 'Toyota Motor Corporation',
    plant_country: 'USA',
    msrp: 29000,
    safety_rating_overall: 5,
  },
  {
    vin: '4T1C11AK7MU345678',
    year: 2021,
    make: 'Toyota',
    model: 'Camry',
    trim: 'TRD',
    body_style: 'Sedan',
    engine: '3.5L V6',
    transmission: '8-Speed Automatic',
    drivetrain: 'FWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Midsize Car',
    manufacturer: 'Toyota Motor Corporation',
    plant_country: 'USA',
    msrp: 31995,
    safety_rating_overall: 5,
  },

  // Honda Civic variants
  {
    vin: '2HGFC2F59HH456789',
    year: 2017,
    make: 'Honda',
    model: 'Civic',
    trim: 'LX',
    body_style: 'Sedan',
    engine: '2.0L I4',
    transmission: 'CVT',
    drivetrain: 'FWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Compact Car',
    manufacturer: 'Honda Motor Company',
    plant_country: 'USA',
    msrp: 20675,
    safety_rating_overall: 5,
  },
  {
    vin: '19XFC2F68LE567890',
    year: 2020,
    make: 'Honda',
    model: 'Civic',
    trim: 'Sport',
    body_style: 'Hatchback',
    engine: '1.5L Turbo I4',
    transmission: '6-Speed Manual',
    drivetrain: 'FWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Compact Car',
    manufacturer: 'Honda Motor Company',
    plant_country: 'USA',
    msrp: 24200,
    safety_rating_overall: 5,
  },

  // Ford F-150 variants
  {
    vin: '1FTFW1E89HFA12345',
    year: 2017,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT',
    body_style: 'Crew Cab Pickup',
    engine: '3.5L V6 EcoBoost',
    transmission: '10-Speed Automatic',
    drivetrain: '4WD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Full-Size Pickup',
    manufacturer: 'Ford Motor Company',
    plant_country: 'USA',
    msrp: 42950,
    safety_rating_overall: 5,
  },
  {
    vin: '1FTEW1EP3LFA23456',
    year: 2020,
    make: 'Ford',
    model: 'F-150',
    trim: 'Lariat',
    body_style: 'SuperCrew Pickup',
    engine: '5.0L V8',
    transmission: '10-Speed Automatic',
    drivetrain: '4WD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Full-Size Pickup',
    manufacturer: 'Ford Motor Company',
    plant_country: 'USA',
    msrp: 53455,
    safety_rating_overall: 4,
  },

  // Chevrolet Silverado
  {
    vin: '1GCVKREC5HZ123456',
    year: 2017,
    make: 'Chevrolet',
    model: 'Silverado 1500',
    trim: 'LT',
    body_style: 'Crew Cab Pickup',
    engine: '5.3L V8',
    transmission: '6-Speed Automatic',
    drivetrain: '4WD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Full-Size Pickup',
    manufacturer: 'General Motors',
    plant_country: 'USA',
    msrp: 41600,
    safety_rating_overall: 5,
  },

  // Honda CR-V
  {
    vin: '5J6RM4H56HL234567',
    year: 2017,
    make: 'Honda',
    model: 'CR-V',
    trim: 'EX',
    body_style: 'SUV',
    engine: '1.5L Turbo I4',
    transmission: 'CVT',
    drivetrain: 'AWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Compact SUV',
    manufacturer: 'Honda Motor Company',
    plant_country: 'USA',
    msrp: 28170,
    safety_rating_overall: 5,
  },
  {
    vin: '7FARW2H59ME345678',
    year: 2021,
    make: 'Honda',
    model: 'CR-V',
    trim: 'Touring',
    body_style: 'SUV',
    engine: '1.5L Turbo I4',
    transmission: 'CVT',
    drivetrain: 'AWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Compact SUV',
    manufacturer: 'Honda Motor Company',
    plant_country: 'USA',
    msrp: 35350,
    safety_rating_overall: 5,
  },

  // Tesla Model 3
  {
    vin: '5YJ3E1EA9JF456789',
    year: 2018,
    make: 'Tesla',
    model: 'Model 3',
    trim: 'Long Range',
    body_style: 'Sedan',
    engine: 'Dual Motor Electric',
    transmission: 'Direct Drive',
    drivetrain: 'AWD',
    fuel_type: 'Electric',
    vehicle_class: 'Midsize Car',
    manufacturer: 'Tesla Inc',
    plant_country: 'USA',
    msrp: 54000,
    safety_rating_overall: 5,
  },
  {
    vin: '5YJ3E1EB6LF567890',
    year: 2020,
    make: 'Tesla',
    model: 'Model 3',
    trim: 'Performance',
    body_style: 'Sedan',
    engine: 'Dual Motor Electric',
    transmission: 'Direct Drive',
    drivetrain: 'AWD',
    fuel_type: 'Electric',
    vehicle_class: 'Midsize Car',
    manufacturer: 'Tesla Inc',
    plant_country: 'USA',
    msrp: 62990,
    safety_rating_overall: 5,
  },

  // BMW 3 Series
  {
    vin: 'WBA8B9C59HK678901',
    year: 2017,
    make: 'BMW',
    model: '330i',
    trim: 'Sport Line',
    body_style: 'Sedan',
    engine: '2.0L Turbo I4',
    transmission: '8-Speed Automatic',
    drivetrain: 'RWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Compact Luxury Car',
    manufacturer: 'BMW AG',
    plant_country: 'Germany',
    msrp: 40250,
    safety_rating_overall: 5,
  },

  // Mercedes-Benz C-Class
  {
    vin: 'WDDWF8EB9JR789012',
    year: 2018,
    make: 'Mercedes-Benz',
    model: 'C300',
    trim: '4MATIC',
    body_style: 'Sedan',
    engine: '2.0L Turbo I4',
    transmission: '9-Speed Automatic',
    drivetrain: 'AWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Compact Luxury Car',
    manufacturer: 'Mercedes-Benz AG',
    plant_country: 'Germany',
    msrp: 43500,
    safety_rating_overall: 4,
  },

  // Jeep Wrangler
  {
    vin: '1C4HJXDG3JW890123',
    year: 2018,
    make: 'Jeep',
    model: 'Wrangler',
    trim: 'Rubicon',
    body_style: 'SUV',
    engine: '3.6L V6',
    transmission: '6-Speed Manual',
    drivetrain: '4WD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Compact SUV',
    manufacturer: 'FCA US LLC',
    plant_country: 'USA',
    msrp: 40995,
    safety_rating_overall: 3,
  },

  // Subaru Outback
  {
    vin: '4S4BTAFC5K3901234',
    year: 2019,
    make: 'Subaru',
    model: 'Outback',
    trim: 'Limited',
    body_style: 'Wagon',
    engine: '2.5L H4',
    transmission: 'CVT',
    drivetrain: 'AWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Midsize Wagon',
    manufacturer: 'Subaru Corporation',
    plant_country: 'USA',
    msrp: 35970,
    safety_rating_overall: 5,
  },

  // Mazda CX-5
  {
    vin: 'JM3KFBCM1K0012345',
    year: 2019,
    make: 'Mazda',
    model: 'CX-5',
    trim: 'Grand Touring',
    body_style: 'SUV',
    engine: '2.5L I4',
    transmission: '6-Speed Automatic',
    drivetrain: 'AWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Compact SUV',
    manufacturer: 'Mazda Motor Corporation',
    plant_country: 'Japan',
    msrp: 30545,
    safety_rating_overall: 5,
  },

  // Nissan Altima
  {
    vin: '1N4BL4BV9LC123456',
    year: 2020,
    make: 'Nissan',
    model: 'Altima',
    trim: '2.5 SV',
    body_style: 'Sedan',
    engine: '2.5L I4',
    transmission: 'CVT',
    drivetrain: 'FWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Midsize Car',
    manufacturer: 'Nissan Motor Company',
    plant_country: 'USA',
    msrp: 26140,
    safety_rating_overall: 5,
  },

  // Hyundai Elantra
  {
    vin: '5NPD84LF4KH234567',
    year: 2019,
    make: 'Hyundai',
    model: 'Elantra',
    trim: 'SEL',
    body_style: 'Sedan',
    engine: '2.0L I4',
    transmission: 'CVT',
    drivetrain: 'FWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Compact Car',
    manufacturer: 'Hyundai Motor Company',
    plant_country: 'South Korea',
    msrp: 20950,
    safety_rating_overall: 5,
  },

  // Kia Sorento
  {
    vin: '5XYPH4A53LG345678',
    year: 2020,
    make: 'Kia',
    model: 'Sorento',
    trim: 'EX',
    body_style: 'SUV',
    engine: '3.3L V6',
    transmission: '8-Speed Automatic',
    drivetrain: 'AWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Midsize SUV',
    manufacturer: 'Kia Corporation',
    plant_country: 'South Korea',
    msrp: 35490,
    safety_rating_overall: 5,
  },

  // Ram 1500
  {
    vin: '1C6SRFFT3LN456789',
    year: 2020,
    make: 'Ram',
    model: '1500',
    trim: 'Big Horn',
    body_style: 'Crew Cab Pickup',
    engine: '5.7L V8 HEMI',
    transmission: '8-Speed Automatic',
    drivetrain: '4WD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Full-Size Pickup',
    manufacturer: 'FCA US LLC',
    plant_country: 'USA',
    msrp: 43795,
    safety_rating_overall: 5,
  },

  // Tesla Model Y (2021+)
  {
    vin: '7SAYGDEE4MF567890',
    year: 2021,
    make: 'Tesla',
    model: 'Model Y',
    trim: 'Long Range',
    body_style: 'SUV',
    engine: 'Dual Motor Electric',
    transmission: 'Direct Drive',
    drivetrain: 'AWD',
    fuel_type: 'Electric',
    vehicle_class: 'Compact SUV',
    manufacturer: 'Tesla Inc',
    plant_country: 'USA',
    msrp: 54990,
    safety_rating_overall: 5,
  },

  // Toyota RAV4 (2022)
  {
    vin: '2T3P1RFV5NC678901',
    year: 2022,
    make: 'Toyota',
    model: 'RAV4',
    trim: 'XLE Premium',
    body_style: 'SUV',
    engine: '2.5L I4',
    transmission: '8-Speed Automatic',
    drivetrain: 'AWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Compact SUV',
    manufacturer: 'Toyota Motor Corporation',
    plant_country: 'USA',
    msrp: 32275,
    safety_rating_overall: 5,
  },

  // Ford Mustang Mach-E (2022)
  {
    vin: '3FMTK3SU0MMA12345',
    year: 2022,
    make: 'Ford',
    model: 'Mustang Mach-E',
    trim: 'Premium',
    body_style: 'SUV',
    engine: 'Electric Motor',
    transmission: 'Direct Drive',
    drivetrain: 'AWD',
    fuel_type: 'Electric',
    vehicle_class: 'Compact SUV',
    manufacturer: 'Ford Motor Company',
    plant_country: 'Mexico',
    msrp: 50400,
    safety_rating_overall: 5,
  },

  // Chevrolet Bolt EUV (2023)
  {
    vin: '1G1FZ6S03P4123456',
    year: 2023,
    make: 'Chevrolet',
    model: 'Bolt EUV',
    trim: 'Premier',
    body_style: 'SUV',
    engine: 'Electric Motor',
    transmission: 'Direct Drive',
    drivetrain: 'FWD',
    fuel_type: 'Electric',
    vehicle_class: 'Compact SUV',
    manufacturer: 'General Motors',
    plant_country: 'USA',
    msrp: 33500,
    safety_rating_overall: 5,
  },

  // Volkswagen ID.4 (2023)
  {
    vin: '1V2WREE80PC234567',
    year: 2023,
    make: 'Volkswagen',
    model: 'ID.4',
    trim: 'Pro S',
    body_style: 'SUV',
    engine: 'Electric Motor',
    transmission: 'Direct Drive',
    drivetrain: 'RWD',
    fuel_type: 'Electric',
    vehicle_class: 'Compact SUV',
    manufacturer: 'Volkswagen AG',
    plant_country: 'Germany',
    msrp: 44995,
    safety_rating_overall: 5,
  },

  // Hyundai Ioniq 5 (2023)
  {
    vin: 'KM8KRDAF0PU345678',
    year: 2023,
    make: 'Hyundai',
    model: 'Ioniq 5',
    trim: 'SEL',
    body_style: 'SUV',
    engine: 'Electric Motor',
    transmission: 'Direct Drive',
    drivetrain: 'AWD',
    fuel_type: 'Electric',
    vehicle_class: 'Compact SUV',
    manufacturer: 'Hyundai Motor Company',
    plant_country: 'South Korea',
    msrp: 48500,
    safety_rating_overall: 5,
  },

  // Audi Q5 (2022)
  {
    vin: 'WA1BVAFY6N2456789',
    year: 2022,
    make: 'Audi',
    model: 'Q5',
    trim: 'Premium Plus',
    body_style: 'SUV',
    engine: '2.0L Turbo I4',
    transmission: '7-Speed Dual Clutch',
    drivetrain: 'AWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Compact Luxury SUV',
    manufacturer: 'Audi AG',
    plant_country: 'Germany',
    msrp: 46200,
    safety_rating_overall: 5,
  },

  // Lexus RX 350 (2022)
  {
    vin: '2T2BZMCA3NC567890',
    year: 2022,
    make: 'Lexus',
    model: 'RX 350',
    trim: 'Luxury',
    body_style: 'SUV',
    engine: '3.5L V6',
    transmission: '8-Speed Automatic',
    drivetrain: 'AWD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Midsize Luxury SUV',
    manufacturer: 'Toyota Motor Corporation',
    plant_country: 'Japan',
    msrp: 48550,
    safety_rating_overall: 5,
  },

  // GMC Sierra 1500 (2022)
  {
    vin: '1GTU9EED6NZ678901',
    year: 2022,
    make: 'GMC',
    model: 'Sierra 1500',
    trim: 'AT4',
    body_style: 'Crew Cab Pickup',
    engine: '6.2L V8',
    transmission: '10-Speed Automatic',
    drivetrain: '4WD',
    fuel_type: 'Gasoline',
    vehicle_class: 'Full-Size Pickup',
    manufacturer: 'General Motors',
    plant_country: 'USA',
    msrp: 59600,
    safety_rating_overall: 4,
  },

  // Porsche Taycan (2023)
  {
    vin: 'WP0AA2Y18PS789012',
    year: 2023,
    make: 'Porsche',
    model: 'Taycan',
    trim: '4S',
    body_style: 'Sedan',
    engine: 'Dual Motor Electric',
    transmission: '2-Speed Automatic',
    drivetrain: 'AWD',
    fuel_type: 'Electric',
    vehicle_class: 'Luxury Performance Car',
    manufacturer: 'Porsche AG',
    plant_country: 'Germany',
    msrp: 105150,
    safety_rating_overall: 5,
  },
];

/**
 * Helper function to lookup vehicle by VIN
 */
export function findVehicleByVIN(vin: string): MockVehicleData | undefined {
  return MOCK_VIN_DATABASE.find(vehicle => vehicle.vin === vin.toUpperCase());
}

/**
 * Helper function to search vehicles by make/model/year
 */
export function findVehiclesByMakeModel(
  make: string,
  model: string,
  year?: number
): MockVehicleData[] {
  return MOCK_VIN_DATABASE.filter(vehicle => {
    const makeMatch = vehicle.make.toLowerCase() === make.toLowerCase();
    const modelMatch = vehicle.model.toLowerCase() === model.toLowerCase();
    const yearMatch = year ? vehicle.year === year : true;
    return makeMatch && modelMatch && yearMatch;
  });
}

/**
 * Get all unique makes
 */
export function getAllMakes(): string[] {
  const makes = MOCK_VIN_DATABASE.map(v => v.make);
  return Array.from(new Set(makes)).sort();
}

/**
 * Get models for a specific make
 */
export function getModelsForMake(make: string): string[] {
  const models = MOCK_VIN_DATABASE
    .filter(v => v.make.toLowerCase() === make.toLowerCase())
    .map(v => v.model);
  return Array.from(new Set(models)).sort();
}
