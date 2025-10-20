/**
 * VIN Decoder Mock Service
 *
 * Simulates a vehicle identification number (VIN) decoder service.
 * In production, this would call services like NHTSA API or commercial VIN decoders.
 *
 * Features:
 * - VIN checksum validation (9th digit validation)
 * - Mock database lookup for common vehicles
 * - Realistic response structure
 * - Error handling for invalid VINs
 *
 * VIN Structure (17 characters):
 * Positions 1-3: World Manufacturer Identifier (WMI)
 * Position 4-8: Vehicle Descriptor Section (VDS)
 * Position 9: Check digit (validation)
 * Position 10: Model year
 * Position 11: Plant code
 * Position 12-17: Sequential number
 */

import { Injectable } from '@nestjs/common';

/**
 * VIN Decode Result Interface
 */
export interface VINDecodeResult {
  vin: string;
  valid: boolean;
  year: number;
  make: string;
  model: string;
  trim?: string;
  body_style: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  fuel_type: string;
  vehicle_class: string;
  manufacturer: string;
  plant_country: string;
  error_message?: string;
}

/**
 * VIN Transliteration weights for checksum calculation
 * Reference: https://en.wikipedia.org/wiki/Vehicle_identification_number
 */
const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/**
 * VIN character values for checksum calculation
 */
const VIN_VALUES: Record<string, number> = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
  'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
};

/**
 * Year encoding in VIN (position 10)
 */
const VIN_YEAR_CODES: Record<string, number> = {
  'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015, 'G': 2016,
  'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023,
  'R': 2024, 'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029, 'Y': 2030,
  '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005, '6': 2006, '7': 2007,
  '8': 2008, '9': 2009,
};

@Injectable()
export class VINDecoderService {
  /**
   * Decode a VIN and return vehicle information
   *
   * @param vin - Vehicle Identification Number (17 characters)
   * @returns Promise<VINDecodeResult>
   */
  async decode(vin: string): Promise<VINDecodeResult> {
    // Normalize VIN (uppercase, trim whitespace)
    const normalizedVIN = vin.trim().toUpperCase();

    // Validate VIN format
    if (!this.isValidVINFormat(normalizedVIN)) {
      return {
        vin: normalizedVIN,
        valid: false,
        year: 0,
        make: '',
        model: '',
        body_style: '',
        fuel_type: '',
        vehicle_class: '',
        manufacturer: '',
        plant_country: '',
        error_message: 'Invalid VIN format. VIN must be exactly 17 alphanumeric characters (excluding I, O, Q).',
      };
    }

    // Validate checksum (9th digit)
    if (!this.validateChecksum(normalizedVIN)) {
      return {
        vin: normalizedVIN,
        valid: false,
        year: 0,
        make: '',
        model: '',
        body_style: '',
        fuel_type: '',
        vehicle_class: '',
        manufacturer: '',
        plant_country: '',
        error_message: 'Invalid VIN checksum. The 9th digit does not match calculated value.',
      };
    }

    // Extract year from VIN
    const year = this.extractYear(normalizedVIN);

    // Check mock database for this VIN
    const vehicleData = await this.lookupVIN(normalizedVIN);

    if (vehicleData) {
      return {
        ...vehicleData,
        vin: normalizedVIN,
        valid: true,
        year,
      };
    }

    // If not in database, return generic decoded info based on WMI
    return this.decodeWMI(normalizedVIN, year);
  }

  /**
   * Validate VIN format (17 characters, no I/O/Q)
   */
  private isValidVINFormat(vin: string): boolean {
    // Must be exactly 17 characters
    if (vin.length !== 17) {
      return false;
    }

    // Must be alphanumeric only (no I, O, Q allowed in VIN)
    const validPattern = /^[A-HJ-NPR-Z0-9]{17}$/;
    return validPattern.test(vin);
  }

  /**
   * Validate VIN checksum (9th digit)
   *
   * Algorithm:
   * 1. Convert each character to its numeric value
   * 2. Multiply by position weight
   * 3. Sum all products
   * 4. Divide by 11, take remainder
   * 5. If remainder is 10, check digit is 'X', otherwise it's the remainder digit
   */
  private validateChecksum(vin: string): boolean {
    let sum = 0;

    for (let i = 0; i < 17; i++) {
      const char = vin[i];
      const value = VIN_VALUES[char];

      if (value === undefined) {
        return false; // Invalid character
      }

      sum += value * VIN_WEIGHTS[i];
    }

    const remainder = sum % 11;
    const checkDigit = vin[8]; // 9th position (0-indexed)

    // Check digit can be 0-9 or X (for 10)
    if (remainder === 10) {
      return checkDigit === 'X';
    } else {
      return checkDigit === remainder.toString();
    }
  }

  /**
   * Extract model year from VIN (10th position)
   */
  private extractYear(vin: string): number {
    const yearCode = vin[9]; // 10th position (0-indexed)
    return VIN_YEAR_CODES[yearCode] || new Date().getFullYear();
  }

  /**
   * Lookup VIN in mock database
   *
   * In production, this would query a database seeded with common VINs
   * or call an external API like NHTSA vPIC API.
   */
  private async lookupVIN(vin: string): Promise<Partial<VINDecodeResult> | null> {
    // Import mock database (in production, this would be a database query)
    const { findVehicleByVIN } = await import('../../../../database/seeds/mock-vin-data');

    const vehicleData = findVehicleByVIN(vin);

    if (!vehicleData) {
      return null;
    }

    return {
      make: vehicleData.make,
      model: vehicleData.model,
      trim: vehicleData.trim,
      body_style: vehicleData.body_style,
      engine: vehicleData.engine,
      transmission: vehicleData.transmission,
      drivetrain: vehicleData.drivetrain,
      fuel_type: vehicleData.fuel_type,
      vehicle_class: vehicleData.vehicle_class,
      manufacturer: vehicleData.manufacturer,
      plant_country: vehicleData.plant_country,
    };
  }

  /**
   * Decode World Manufacturer Identifier (WMI) - first 3 characters
   *
   * This provides basic manufacturer and country information when
   * full VIN is not in the database.
   */
  private decodeWMI(vin: string, year: number): VINDecodeResult {
    const wmi = vin.substring(0, 3);

    // Common WMI prefixes
    const wmiDatabase: Record<string, { manufacturer: string; country: string; make: string }> = {
      '1FA': { manufacturer: 'Ford Motor Company', country: 'USA', make: 'Ford' },
      '1FB': { manufacturer: 'Ford Motor Company', country: 'USA', make: 'Ford' },
      '1FC': { manufacturer: 'Ford Motor Company', country: 'USA', make: 'Ford' },
      '1FT': { manufacturer: 'Ford Motor Company', country: 'USA', make: 'Ford' },
      '1G1': { manufacturer: 'General Motors', country: 'USA', make: 'Chevrolet' },
      '1G4': { manufacturer: 'General Motors', country: 'USA', make: 'Buick' },
      '1GC': { manufacturer: 'General Motors', country: 'USA', make: 'Chevrolet' },
      '1GN': { manufacturer: 'General Motors', country: 'USA', make: 'Chevrolet' },
      '1HG': { manufacturer: 'Honda', country: 'USA', make: 'Honda' },
      '1N4': { manufacturer: 'Nissan', country: 'USA', make: 'Nissan' },
      '2C3': { manufacturer: 'Chrysler', country: 'Canada', make: 'Chrysler' },
      '2G1': { manufacturer: 'General Motors', country: 'Canada', make: 'Chevrolet' },
      '2HG': { manufacturer: 'Honda', country: 'Canada', make: 'Honda' },
      '2T1': { manufacturer: 'Toyota', country: 'Canada', make: 'Toyota' },
      '3FA': { manufacturer: 'Ford Motor Company', country: 'Mexico', make: 'Ford' },
      '3N1': { manufacturer: 'Nissan', country: 'Mexico', make: 'Nissan' },
      '4T1': { manufacturer: 'Toyota', country: 'USA', make: 'Toyota' },
      '5YJ': { manufacturer: 'Tesla', country: 'USA', make: 'Tesla' },
      'JHM': { manufacturer: 'Honda', country: 'Japan', make: 'Honda' },
      'JM1': { manufacturer: 'Mazda', country: 'Japan', make: 'Mazda' },
      'JN1': { manufacturer: 'Nissan', country: 'Japan', make: 'Nissan' },
      'JTD': { manufacturer: 'Toyota', country: 'Japan', make: 'Toyota' },
      'KM8': { manufacturer: 'Hyundai', country: 'South Korea', make: 'Hyundai' },
      'KNA': { manufacturer: 'Kia', country: 'South Korea', make: 'Kia' },
      'SAL': { manufacturer: 'Land Rover', country: 'UK', make: 'Land Rover' },
      'WBA': { manufacturer: 'BMW', country: 'Germany', make: 'BMW' },
      'WDB': { manufacturer: 'Mercedes-Benz', country: 'Germany', make: 'Mercedes-Benz' },
      'WP0': { manufacturer: 'Porsche', country: 'Germany', make: 'Porsche' },
      'WVW': { manufacturer: 'Volkswagen', country: 'Germany', make: 'Volkswagen' },
      'YV1': { manufacturer: 'Volvo', country: 'Sweden', make: 'Volvo' },
    };

    const wmiData = wmiDatabase[wmi] || {
      manufacturer: 'Unknown Manufacturer',
      country: 'Unknown',
      make: 'Unknown',
    };

    return {
      vin,
      valid: true,
      year,
      make: wmiData.make,
      model: 'Unknown Model',
      body_style: 'Unknown',
      fuel_type: 'Gasoline', // Default assumption
      vehicle_class: 'Passenger Car',
      manufacturer: wmiData.manufacturer,
      plant_country: wmiData.country,
      error_message: 'VIN is valid but detailed vehicle information not found in database. Showing WMI decode only.',
    };
  }

  /**
   * Batch decode multiple VINs
   *
   * @param vins - Array of VIN numbers
   * @returns Promise<VINDecodeResult[]>
   */
  async batchDecode(vins: string[]): Promise<VINDecodeResult[]> {
    const results = await Promise.all(
      vins.map(vin => this.decode(vin))
    );
    return results;
  }
}
