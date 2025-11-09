/**
 * Document Formatters - Data mapping utilities for template rendering
 *
 * Maps OMG P&C Data Model entities to template data structures for document generation.
 * Follows data-mapping.md specification from Feature 003.
 *
 * Template Variables (26 total):
 * - Policy Info: policy_number, policy_start_date, policy_end_date, issue_date
 * - Agent: agent_name, agent_number
 * - Insured: insured_name, insured_address_line1, insured_city, insured_state, insured_zip
 * - Vehicles: Array of {vehicle_number, year, make, model, vin, use}
 * - Drivers: Array of {name, date_of_birth, license_number, relationship}
 * - Coverages: Array of {coverage_name, limit, deductible, premium}
 * - Totals: total_six_month_premium, total_annual_premium
 * - Payment: payment_plan, monthly_payment, installment_fee, first_payment_due
 * - Generation: generation_timestamp
 */

/**
 * Interface representing declarations page template data
 */
export interface DeclarationsPageData {
  // Policy Information
  policy_number: string;
  policy_start_date: string;
  policy_end_date: string;
  issue_date: string;

  // Agent Information
  agent_name: string;
  agent_number: string;

  // Named Insured
  insured_name: string;
  insured_address_line1: string;
  insured_city: string;
  insured_state: string;
  insured_zip: string;

  // Vehicles
  vehicles: Array<{
    vehicle_number: number;
    year: number;
    make: string;
    model: string;
    vin: string;
    use: string;
  }>;

  // Drivers
  drivers: Array<{
    name: string;
    date_of_birth: string;
    license_number: string;
    relationship: string;
  }>;

  // Coverages (first vehicle by default)
  vehicle_number: number;
  coverages: Array<{
    coverage_name: string;
    limit: string;
    deductible: string;
    premium: string;
  }>;

  // Premium Totals
  total_six_month_premium: string;
  total_annual_premium: string;

  // Payment Information
  payment_plan: string;
  monthly_payment: string;
  installment_fee?: string;
  first_payment_due: string;

  // Generation Metadata
  generation_timestamp: string;
}

/**
 * Map policy data to declarations page template format
 *
 * @param policy - Policy entity with all related data
 * @param vehicles - Array of vehicle entities
 * @param parties - Array of party entities (drivers, policyholder)
 * @param coverages - Array of coverage entities
 * @returns Formatted data ready for template rendering
 */
export function mapPolicyToDeclarationsData(
  policy: any,
  vehicles: any[],
  parties: any[],
  coverages: any[],
): DeclarationsPageData {
  // Find primary policyholder
  const primaryPolicyholder = parties.find(
    (p) => p.role_type === 'PRIMARY_POLICYHOLDER' || p.role_type === 'NAMED_INSURED',
  );

  if (!primaryPolicyholder) {
    throw new Error('Primary policyholder not found');
  }

  // Format dates (handle UTC timezone properly)
  const formatDate = (date: Date | string): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    // Use UTC methods to avoid timezone offset issues
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${month}/${day}/${year}`;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Map vehicles
  const mappedVehicles = vehicles.map((vehicle, index) => ({
    vehicle_number: index + 1,
    year: vehicle.model_year || vehicle.year,
    make: vehicle.make || 'Unknown',
    model: vehicle.model || 'Unknown',
    vin: vehicle.vin || 'N/A',
    use: vehicle.primary_use || vehicle.use || 'Personal',
  }));

  // Map drivers
  const drivers = parties.filter(
    (p) => p.role_type === 'PRIMARY_POLICYHOLDER' || p.role_type === 'ADDITIONAL_DRIVER',
  );

  const mappedDrivers = drivers.map((driver) => ({
    name: `${driver.first_name || ''} ${driver.last_name || ''}`.trim(),
    date_of_birth: driver.birth_date ? formatDate(driver.birth_date) : 'N/A',
    license_number: driver.drivers_license_number || driver.license_number || 'N/A',
    relationship:
      driver.role_type === 'PRIMARY_POLICYHOLDER'
        ? 'Named Insured'
        : driver.relationship || 'Additional Driver',
  }));

  // Map coverages (show first vehicle's coverages in summary)
  const mappedCoverages = coverages.map((cov) => {
    // Format limit
    let limit = 'N/A';
    if (cov.limit_amount) {
      if (cov.coverage_type?.includes('LIABILITY')) {
        // Split limit format: "$50,000 / $100,000"
        limit = `$${formatCurrency(cov.limit_amount)}`;
      } else {
        limit = `$${formatCurrency(cov.limit_amount)}`;
      }
    }

    // Format deductible
    const deductible = cov.deductible_amount
      ? `$${formatCurrency(cov.deductible_amount)}`
      : 'N/A';

    return {
      coverage_name: formatCoverageName(cov.coverage_type || 'Unknown Coverage'),
      limit,
      deductible,
      premium: formatCurrency(cov.coverage_premium || 0),
    };
  });

  // Calculate totals from policy or quote_snapshot
  const quoteSnapshot = policy.quote_snapshot as any;
  const totalPremium = policy.total_premium || quoteSnapshot?.premium?.total || quoteSnapshot?.premium?.sixMonth || 0;
  const sixMonthPremium = totalPremium;
  const annualPremium = totalPremium * 2;

  // Determine payment plan
  let paymentPlan = 'Full Payment';
  let monthlyPayment = formatCurrency(0);
  let installmentFee: string | undefined = undefined;

  if (policy.payment_plan) {
    if (policy.payment_plan === 'MONTHLY') {
      paymentPlan = 'Monthly Installments (6 payments)';
      monthlyPayment = formatCurrency(sixMonthPremium / 6);
      installmentFee = formatCurrency(5); // Example $5 installment fee
    } else if (policy.payment_plan === 'QUARTERLY') {
      paymentPlan = 'Quarterly Payments (2 payments)';
      monthlyPayment = formatCurrency(sixMonthPremium / 2);
    } else if (policy.payment_plan === 'FULL') {
      paymentPlan = 'Full Payment';
      monthlyPayment = formatCurrency(sixMonthPremium);
    }
  }

  // First payment due (coverage start date)
  const firstPaymentDue = policy.coverage_start_date
    ? formatDate(policy.coverage_start_date)
    : formatDate(new Date());

  // Build template data
  return {
    // Policy Information
    policy_number: policy.policy_number || 'N/A',
    policy_start_date: policy.coverage_start_date
      ? formatDate(policy.coverage_start_date)
      : 'N/A',
    policy_end_date: policy.coverage_end_date ? formatDate(policy.coverage_end_date) : 'N/A',
    issue_date: policy.created_at ? formatDate(policy.created_at) : formatDate(new Date()),

    // Agent Information (hardcoded for demo)
    agent_name: 'John Smith',
    agent_number: 'A12345',

    // Named Insured
    insured_name: `${primaryPolicyholder.first_name || ''} ${primaryPolicyholder.last_name || ''}`.trim() || 'N/A',
    insured_address_line1: primaryPolicyholder.address_line_1 || primaryPolicyholder.address || 'N/A',
    insured_city: primaryPolicyholder.city || 'N/A',
    insured_state: primaryPolicyholder.state_province || primaryPolicyholder.state || 'N/A',
    insured_zip: primaryPolicyholder.postal_code || primaryPolicyholder.zip || 'N/A',

    // Vehicles
    vehicles: mappedVehicles,

    // Drivers
    drivers: mappedDrivers,

    // Coverages (first vehicle)
    vehicle_number: 1,
    coverages: mappedCoverages,

    // Premium Totals
    total_six_month_premium: formatCurrency(sixMonthPremium),
    total_annual_premium: formatCurrency(annualPremium),

    // Payment Information
    payment_plan: paymentPlan,
    monthly_payment: monthlyPayment,
    installment_fee: installmentFee,
    first_payment_due: firstPaymentDue,

    // Generation Metadata
    generation_timestamp: new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

/**
 * Format coverage type enum to human-readable name
 */
function formatCoverageName(coverageType: string): string {
  const coverageNames: Record<string, string> = {
    BODILY_INJURY_LIABILITY: 'Bodily Injury Liability',
    PROPERTY_DAMAGE_LIABILITY: 'Property Damage Liability',
    COMPREHENSIVE: 'Comprehensive',
    COLLISION: 'Collision',
    UNINSURED_MOTORIST: 'Uninsured Motorist',
    UNDERINSURED_MOTORIST: 'Underinsured Motorist',
    PERSONAL_INJURY_PROTECTION: 'Personal Injury Protection (PIP)',
    MEDICAL_PAYMENTS: 'Medical Payments',
    RENTAL_REIMBURSEMENT: 'Rental Reimbursement',
    ROADSIDE_ASSISTANCE: 'Roadside Assistance',
  };

  return coverageNames[coverageType] || coverageType.replace(/_/g, ' ');
}

/**
 * Format address object to multi-line string
 */
export function formatAddress(address: {
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
}): string {
  const lines: string[] = [];

  if (address.address_line_1) {
    lines.push(address.address_line_1);
  }

  if (address.address_line_2) {
    lines.push(address.address_line_2);
  }

  if (address.city && address.state_province && address.postal_code) {
    lines.push(`${address.city}, ${address.state_province} ${address.postal_code}`);
  }

  return lines.join('\n');
}

/**
 * Format phone number to (XXX) XXX-XXXX
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }

  // Return as-is if not 10 digits
  return phone;
}
