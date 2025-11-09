# Declarations Page Template - Data Mapping

**Template File**: `declarations-page.html`
**Template Engine**: Mustache/Handlebars (uses `{{variable}}` and `{{#array}}...{{/array}}` syntax)
**Generated**: 2025-11-09
**Purpose**: Map template variables to OMG P&C Data Model entities

## Template Analysis

### Template Syntax Used
- **Simple variables**: `{{variable_name}}` - Direct replacement
- **Array iteration**: `{{#array}}...{{/array}}` - Loops over collections
- **Conditional rendering**: `{{#condition}}...{{/condition}}` - Show/hide based on value

### CSS Features Required for PDF Generation
- `@page` rule for letter size and margins
- Table styling with borders and backgrounds
- Page break control (`page-break-inside: avoid`)
- Custom fonts (Times New Roman)
- Color styling (#1a472a green theme)

## Required Template Variables

### 1. Policy Information Section

| Template Variable | Data Type | OMG Entity | Field/Derivation | Notes |
|------------------|-----------|------------|------------------|-------|
| `{{policy_number}}` | string | Policy | `policy_number` | Human-readable format (DZXXXXXXXX) |
| `{{policy_start_date}}` | date | Policy | `coverage_start_date` | Format: MM/DD/YYYY |
| `{{policy_end_date}}` | date | Policy | `coverage_end_date` | Format: MM/DD/YYYY |
| `{{issue_date}}` | date | Policy | `created_at` or `issued_date` | Format: MM/DD/YYYY |
| `{{agent_name}}` | string | N/A | Mock data | Demo mode: "OMG Insurance Agent" |
| `{{agent_number}}` | string | N/A | Mock data | Demo mode: "AG-12345" |

**Notes**:
- Agent information not currently tracked in OMG model for demo mode
- All dates must be formatted consistently (MM/DD/YYYY)
- Policy number already uses human-readable format

---

### 2. Named Insured Section

| Template Variable | Data Type | OMG Entity | Field/Derivation | Notes |
|------------------|-----------|------------|------------------|-------|
| `{{insured_name}}` | string | Person (via PartyRole) | `first_name` + `last_name` | Primary policyholder |
| `{{insured_address_line1}}` | string | CommunicationIdentity | `address_line_1` | Mailing address |
| `{{insured_city}}` | string | CommunicationIdentity | `city` | Mailing address city |
| `{{insured_state}}` | string | CommunicationIdentity | `state_province` | Mailing address state |
| `{{insured_zip}}` | string | CommunicationIdentity | `postal_code` | Mailing address zip |

**Query Logic**:
1. Get Policy by `policy_id`
2. Join to `party_role` where `role_type = 'PRIMARY_POLICYHOLDER'`
3. Join to `person` via `party_id`
4. Join to `communication_identity` via `party_id` where `identity_type = 'MAILING_ADDRESS'`

**Data Transformations**:
- Concatenate `first_name` + space + `last_name` for full name
- Handle middle name if present: `first_name` + `middle_name` + `last_name`

---

### 3. Insured Vehicles Section (Array)

**Array Variable**: `{{#vehicles}}...{{/vehicles}}`

| Template Variable | Data Type | OMG Entity | Field/Derivation | Notes |
|------------------|-----------|------------|------------------|-------|
| `{{vehicle_number}}` | integer | N/A | Array index + 1 | 1-based numbering |
| `{{year}}` | integer | Vehicle | `model_year` | 4-digit year |
| `{{make}}` | string | Vehicle | `make` | Vehicle manufacturer |
| `{{model}}` | string | Vehicle | `model` | Vehicle model |
| `{{vin}}` | string | Vehicle | `vin` | 17-character VIN |
| `{{use}}` | string | Vehicle | `primary_use` | E.g., "Commute", "Pleasure" |

**Query Logic**:
1. Get all `insurable_object` records where `insurable_object.policy_id = policy_id`
2. Join to `vehicle` via `insurable_object.insurable_object_id = vehicle.insurable_object_id`
3. Order by `vehicle.created_at` or `insurable_object.sequence_number`

**Data Transformations**:
- Primary use should be human-readable (capitalize first letter)
- VIN should be uppercase

---

### 4. Listed Drivers Section (Array)

**Array Variable**: `{{#drivers}}...{{/drivers}}`

| Template Variable | Data Type | OMG Entity | Field/Derivation | Notes |
|------------------|-----------|------------|------------------|-------|
| `{{name}}` | string | Person | `first_name` + `last_name` | Full name |
| `{{date_of_birth}}` | date | Person | `birth_date` | Format: MM/DD/YYYY |
| `{{license_number}}` | string | Person | `drivers_license_number` | As stored |
| `{{relationship}}` | string | PartyRole | `role_type` | E.g., "Policyholder", "Spouse", "Child" |

**Query Logic**:
1. Get all `party_role` records where `party_role.policy_id = policy_id` AND `role_type IN ('PRIMARY_POLICYHOLDER', 'ADDITIONAL_DRIVER')`
2. Join to `person` via `party_id`
3. Order by role_type (primary first), then by `created_at`

**Data Transformations**:
- Concatenate first and last name
- Format date of birth as MM/DD/YYYY
- Map role_type to human-readable:
  - `PRIMARY_POLICYHOLDER` → "Policyholder"
  - `ADDITIONAL_DRIVER` → Actual relationship (from `person` table if stored, else "Additional Driver")

---

### 5. Coverage Summary Section (Array)

**Array Variable**: `{{#coverages}}...{{/coverages}}`

| Template Variable | Data Type | OMG Entity | Field/Derivation | Notes |
|------------------|-----------|------------|------------------|-------|
| `{{coverage_name}}` | string | Coverage | `coverage_type` | Human-readable name |
| `{{limit}}` | string | Coverage | `limit_amount` + `limit_type` | E.g., "$100,000/$300,000" |
| `{{deductible}}` | string | Coverage | `deductible_amount` | E.g., "$500" or "N/A" |
| `{{premium}}` | decimal | Coverage | `coverage_premium` | 6-month premium, 2 decimals |

**Query Logic**:
1. Get all `coverage` records where `coverage.policy_id = policy_id`
2. Order by coverage_type priority (liability first, then optional coverages)

**Data Transformations**:
- Format coverage_type to human-readable:
  - `BODILY_INJURY_LIABILITY` → "Bodily Injury Liability"
  - `PROPERTY_DAMAGE_LIABILITY` → "Property Damage Liability"
  - `COLLISION` → "Collision"
  - `COMPREHENSIVE` → "Comprehensive"
  - `UNINSURED_MOTORIST` → "Uninsured/Underinsured Motorist"
  - `ROADSIDE_ASSISTANCE` → "Roadside Assistance"
  - `RENTAL_REIMBURSEMENT` → "Rental Reimbursement"
- Format limits:
  - Split liability: "$100,000/$300,000/$100,000" (BI/PD/UM)
  - Single limits: "$100,000"
- Format deductible:
  - If present: "$500"
  - If not applicable: "N/A"
- Format premium: Always 2 decimal places

---

### 6. Premium Totals Section

| Template Variable | Data Type | Source | Calculation | Notes |
|------------------|-----------|--------|-------------|-------|
| `{{total_six_month_premium}}` | decimal | Policy | `total_premium` | 6-month total, 2 decimals |
| `{{total_annual_premium}}` | decimal | Policy | `total_premium * 2` | Annual total, 2 decimals |

**Query Logic**:
- Get `total_premium` from Policy table
- Annual premium = 6-month premium × 2

**Data Transformations**:
- Format with 2 decimal places
- No dollar sign in variable (added in template)

---

### 7. Payment Information Section

| Template Variable | Data Type | Source | Field/Derivation | Notes |
|------------------|-----------|--------|------------------|-------|
| `{{payment_plan}}` | string | Policy or Payment | Payment frequency | E.g., "Paid in Full" or "Monthly Installments" |
| `{{monthly_payment}}` | decimal | Policy | Calculated from total_premium | 6-month / 6 or annual / 12 |
| `{{installment_fee}}` | decimal | N/A | Mock/config | Optional: $5-10 per month |
| `{{first_payment_due}}` | date | Policy | `coverage_start_date` | Format: MM/DD/YYYY |

**Query Logic**:
- Payment plan from Policy or Payment table (if tracked)
- Calculate monthly payment based on total_premium

**Data Transformations**:
- Monthly payment: total_premium / 6 (for 6-month policy)
- Format dates as MM/DD/YYYY
- Installment fee is conditional (only shows if payment plan is monthly)

---

### 8. Footer Section

| Template Variable | Data Type | Source | Derivation | Notes |
|------------------|-----------|--------|-----------|-------|
| `{{generation_timestamp}}` | datetime | N/A | `new Date()` | Format: MM/DD/YYYY HH:MM AM/PM |

**Data Transformations**:
- Format: "01/15/2025 02:30 PM"

---

## Data Source Summary

### OMG Entities Required

1. **Policy** - Core policy information
2. **Person** - Policyholder and driver information
3. **CommunicationIdentity** - Mailing address
4. **PartyRole** - Driver relationships
5. **Vehicle** - Vehicle details
6. **InsurableObject** - Links vehicles to policy
7. **Coverage** - Coverage details and premiums

### Database Joins Required

```sql
-- Simplified query structure
SELECT
  -- Policy Info
  p.policy_number,
  p.coverage_start_date,
  p.coverage_end_date,
  p.total_premium,

  -- Named Insured (Primary Policyholder)
  person.first_name,
  person.last_name,
  addr.address_line_1,
  addr.city,
  addr.state_province,
  addr.postal_code,

  -- Vehicles (array)
  v.model_year,
  v.make,
  v.model,
  v.vin,
  v.primary_use,

  -- Drivers (array)
  driver.first_name,
  driver.last_name,
  driver.birth_date,
  driver.drivers_license_number,
  pr.role_type,

  -- Coverages (array)
  c.coverage_type,
  c.limit_amount,
  c.deductible_amount,
  c.coverage_premium

FROM policy p

-- Primary Policyholder
JOIN party_role pr_primary ON p.policy_id = pr_primary.policy_id
  AND pr_primary.role_type = 'PRIMARY_POLICYHOLDER'
JOIN person ON pr_primary.party_id = person.person_id
JOIN communication_identity addr ON person.person_id = addr.party_id
  AND addr.identity_type = 'MAILING_ADDRESS'

-- All Drivers
LEFT JOIN party_role pr ON p.policy_id = pr.policy_id
  AND pr.role_type IN ('PRIMARY_POLICYHOLDER', 'ADDITIONAL_DRIVER')
LEFT JOIN person driver ON pr.party_id = driver.person_id

-- Vehicles
LEFT JOIN insurable_object io ON p.policy_id = io.policy_id
LEFT JOIN vehicle v ON io.insurable_object_id = v.insurable_object_id

-- Coverages
LEFT JOIN coverage c ON p.policy_id = c.policy_id

ORDER BY vehicle sequence, driver sequence, coverage priority
```

---

## Template Engine Requirements

### Recommended: Handlebars (Mustache-compatible)

**Why Handlebars**:
- Supports all syntax used in template (`{{}}`, `{{#}}`, `{{/}}`)
- Logic-less templates (keeps business logic in code)
- Well-documented and widely used
- TypeScript support available (`handlebars` npm package)

**Alternative: Mustache**
- Lighter weight
- Same syntax
- May need additional logic for conditional rendering

### Template Compilation Process

1. **Load template**: Read HTML file from filesystem or database
2. **Compile template**: Parse template into executable function
   ```typescript
   const template = Handlebars.compile(htmlString);
   ```
3. **Prepare data**: Fetch all required data from database and format
4. **Render HTML**: Execute template with data
   ```typescript
   const renderedHtml = template(templateData);
   ```
5. **Convert to PDF**: Use HTML-to-PDF library (Puppeteer/Playwright)

---

## Data Formatting Utilities Needed

### Date Formatting
```typescript
function formatDate(date: Date | string): string {
  // Convert to MM/DD/YYYY format
  return new Date(date).toLocaleDateString('en-US');
}
```

### Currency Formatting
```typescript
function formatCurrency(amount: number): string {
  // Return with 2 decimal places, no dollar sign
  return amount.toFixed(2);
}
```

### Name Formatting
```typescript
function formatFullName(firstName: string, middleName?: string, lastName: string): string {
  return middleName
    ? `${firstName} ${middleName} ${lastName}`
    : `${firstName} ${lastName}`;
}
```

### Coverage Type Formatting
```typescript
function formatCoverageType(type: string): string {
  const mappings = {
    'BODILY_INJURY_LIABILITY': 'Bodily Injury Liability',
    'PROPERTY_DAMAGE_LIABILITY': 'Property Damage Liability',
    'COLLISION': 'Collision',
    'COMPREHENSIVE': 'Comprehensive',
    'UNINSURED_MOTORIST': 'Uninsured/Underinsured Motorist',
    'ROADSIDE_ASSISTANCE': 'Roadside Assistance',
    'RENTAL_REIMBURSEMENT': 'Rental Reimbursement',
  };
  return mappings[type] || type;
}
```

### Coverage Limit Formatting
```typescript
function formatCoverageLimit(coverage: Coverage): string {
  if (coverage.coverage_type === 'BODILY_INJURY_LIABILITY') {
    // Split limits: $100,000/$300,000
    return `$${formatCurrency(coverage.per_person_limit)}/$${formatCurrency(coverage.per_accident_limit)}`;
  }
  // Single limit
  return `$${formatCurrency(coverage.limit_amount)}`;
}
```

---

## Template Validation Requirements

### Before Document Generation

1. **Required Fields Check**: Ensure all required variables have values
2. **Array Validation**: Verify at least one vehicle and one driver exist
3. **Data Type Validation**: Confirm dates are valid, numbers are numeric
4. **Formatting Validation**: Dates formatted correctly, currency has 2 decimals

### Missing Data Handling

| Scenario | Fallback Behavior |
|----------|------------------|
| Missing agent info | Use "OMG Insurance Agent" / "AG-12345" |
| Missing middle name | Omit from full name |
| No installment fee | Don't show conditional section |
| Missing deductible | Show "N/A" |
| Missing coverage limit | Show "Contact Agent" |

---

## PDF Generation Considerations

### Required CSS Support

- ✅ `@page` rules for margins and page size
- ✅ Table styling (borders, backgrounds, widths)
- ✅ Custom fonts (Times New Roman)
- ✅ Color values (hex colors)
- ✅ Page break controls

### Recommended PDF Libraries

1. **Puppeteer** (Chromium-based)
   - Best CSS support
   - Handles @page rules
   - May require Chromium binary
   - Works with Vercel serverless (with layer)

2. **Playwright** (Chromium/Firefox/WebKit)
   - Similar to Puppeteer
   - Better TypeScript support
   - Already used in project for testing

3. **pdf-lib** (Pure JavaScript)
   - Lighter weight
   - Limited HTML/CSS support
   - Better for simple layouts

**Recommendation**: **Playwright** - already in dependencies, excellent CSS support, TypeScript-first

---

## Testing Data Requirements

### Sample Data Object

```typescript
const sampleDecPageData = {
  // Policy Info
  policy_number: "DZQV87Z4FH",
  policy_start_date: "01/15/2025",
  policy_end_date: "07/15/2025",
  issue_date: "01/15/2025",
  agent_name: "OMG Insurance Agent",
  agent_number: "AG-12345",

  // Named Insured
  insured_name: "John Smith",
  insured_address_line1: "123 Main Street",
  insured_city: "San Francisco",
  insured_state: "CA",
  insured_zip: "94102",

  // Vehicles (array)
  vehicles: [
    {
      vehicle_number: 1,
      year: 2020,
      make: "Toyota",
      model: "Camry",
      vin: "1HGBH41JXMN109186",
      use: "Commute"
    },
    {
      vehicle_number: 2,
      year: 2019,
      make: "Honda",
      model: "Accord",
      vin: "2HGFA16599H123456",
      use: "Pleasure"
    }
  ],

  // Drivers (array)
  drivers: [
    {
      name: "John Smith",
      date_of_birth: "05/15/1980",
      license_number: "D1234567",
      relationship: "Policyholder"
    },
    {
      name: "Jane Smith",
      date_of_birth: "08/22/1982",
      license_number: "D2345678",
      relationship: "Spouse"
    }
  ],

  // Coverages (array)
  coverages: [
    {
      coverage_name: "Bodily Injury Liability",
      limit: "$100,000/$300,000",
      deductible: "N/A",
      premium: "245.50"
    },
    {
      coverage_name: "Property Damage Liability",
      limit: "$100,000",
      deductible: "N/A",
      premium: "180.00"
    },
    {
      coverage_name: "Collision",
      limit: "Actual Cash Value",
      deductible: "$500",
      premium: "420.00"
    },
    {
      coverage_name: "Comprehensive",
      limit: "Actual Cash Value",
      deductible: "$500",
      premium: "315.00"
    }
  ],

  // Premium Totals
  total_six_month_premium: "1160.50",
  total_annual_premium: "2321.00",

  // Payment Info
  payment_plan: "Paid in Full",
  monthly_payment: "193.42",
  installment_fee: "5.00",
  first_payment_due: "01/15/2025",

  // Footer
  generation_timestamp: "01/15/2025 02:30 PM"
};
```

---

## Summary

**Total Variables**: 26 unique template variables
**Arrays**: 3 (vehicles, drivers, coverages)
**OMG Entities**: 7 (Policy, Person, CommunicationIdentity, PartyRole, Vehicle, InsurableObject, Coverage)
**Data Transformations**: 8 formatting utilities required
**Template Engine**: Handlebars (recommended)
**PDF Engine**: Playwright (recommended, already in project)

This mapping ensures complete coverage of all template requirements with clear traceability to OMG P&C Data Model entities.
