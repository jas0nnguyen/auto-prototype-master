# Feature Specification: Toggle-Style Progressive Insurance Quote Flow

**Feature Branch**: `002-toggle-progressive-flow`
**Created**: 2025-01-24
**Status**: Draft
**Input**: User description: "Toggle-style progressive insurance quote flow with prefill, enhanced rating, and add-ons management based on analysis of Toggle Insurance UX patterns"

## User Scenarios & Testing

### User Story 1 - Progressive Data Prefill from Existing Policy (Priority: P1)

A customer with existing auto insurance visits the site to get a new quote. Instead of manually entering all vehicle and driver details from scratch, the system automatically retrieves their current policy information from external carrier databases and prefills their quote with existing vehicles and drivers, significantly reducing data entry time.

**Why this priority**: This is the core differentiator of the Toggle flow. It reduces quote completion time by 60-70% and dramatically improves conversion rates. Without this, the feature loses its primary value proposition - the "progressive" aspect of progressive disclosure.

**Independent Test**: Can be fully tested by entering a last name and ZIP code that matches a mock prior policy in the database, then verifying that vehicles and drivers are auto-populated. Delivers immediate value by eliminating manual data entry for returning or switching customers.

**Acceptance Scenarios**:

1. **Given** a customer with an existing policy from another carrier, **When** they enter their last name and ZIP code on the initial screen, **Then** the system fetches their policy data from external carriers and displays a loading screen with progress indicators showing "Insurance history ✓" and "Checking vehicle information..."

2. **Given** the system successfully retrieved prior policy data, **When** the loading completes, **Then** the customer is shown a summary screen with their vehicles and drivers already populated in card format, ready for review and editing

3. **Given** no prior policy is found for the entered information, **When** the prefill search completes, **Then** the customer proceeds to a blank quote form to manually enter vehicle and driver information

4. **Given** the customer has multiple vehicles in their prior policy, **When** prefill data is applied, **Then** all vehicles are displayed as separate cards with complete details (year, make, model, VIN)

5. **Given** the customer has additional drivers in their prior policy, **When** prefill data is applied, **Then** all drivers are displayed as separate cards with their relationship and details

---

### User Story 2 - Card-Based Edit-In-Place Quote Modification (Priority: P1)

A customer reviewing their prefilled quote notices that one vehicle's annual mileage is outdated and wants to update it. Instead of navigating through a multi-step form flow, they can click "Edit vehicle" directly on the vehicle's card, make changes in an inline modal or drawer, and see the premium update in real-time on the sticky price sidebar.

**Why this priority**: This is the second core differentiator - the edit-in-place UX pattern. It allows customers to quickly iterate on their quote without losing context or navigating away. Essential for the "progressive disclosure" philosophy where complexity is revealed only when needed.

**Independent Test**: Can be fully tested by clicking "Edit vehicle" on any vehicle card, changing a field value (e.g., annual mileage), saving, and verifying the premium recalculates. Delivers value by making quote adjustments fast and intuitive.

**Acceptance Scenarios**:

1. **Given** a customer viewing the vehicle/driver summary screen, **When** they click "Edit vehicle" on any vehicle card, **Then** an inline edit interface (modal or drawer) opens with all vehicle details editable

2. **Given** the customer makes changes to vehicle information (annual mileage, ownership type, primary driver assignment), **When** they save changes, **Then** the premium recalculates immediately and the sticky price sidebar updates with the new total

3. **Given** a customer editing driver information, **When** they change the driver's age or marital status, **Then** the system applies appropriate rating factors and updates the premium breakdown

4. **Given** the customer clicks "Add vehicle(s)" or "Add another driver", **When** they complete the add form, **Then** a new card appears in the summary with the premium recalculated to include the new risk

5. **Given** the customer has made edits to multiple entities (vehicles and drivers), **When** they navigate to the coverage selection screen, **Then** all their changes persist and the coverage options reflect the updated vehicle/driver lineup

---

### User Story 3 - Enhanced Premium Calculation with Detailed Breakdown (Priority: P2)

A customer wants to understand why their premium is a certain amount and what factors are affecting it. The system provides a comprehensive breakdown showing base premium, rating factors (vehicle age, driver experience, location risk), applied discounts (multi-car, good driver, homeowner), surcharges (accidents, violations), and state taxes/fees - giving full transparency into the pricing.

**Why this priority**: Transparency builds trust and helps customers make informed decisions about coverage levels. This is essential for regulatory compliance and customer satisfaction, but the quote flow can function without detailed breakdowns initially (showing only total premium).

**Independent Test**: Can be fully tested by creating a quote with specific characteristics (e.g., 2 vehicles, clean driving record, homeowner) and verifying the premium breakdown shows expected discounts and the calculation logic is accurate. Delivers value through pricing transparency.

**Acceptance Scenarios**:

1. **Given** a customer with a clean driving record and multiple vehicles, **When** the system calculates their premium, **Then** the breakdown shows a multi-car discount (10%) and good driver discount (15%) clearly itemized

2. **Given** a customer with a recent accident or DUI, **When** the system calculates their premium, **Then** the breakdown shows appropriate surcharges (accident: 25%, DUI: 50%) applied to the base premium

3. **Given** a customer in a high-tax state, **When** the final premium is displayed, **Then** the breakdown separately shows base premium, total discounts, total surcharges, state premium tax (2-4%), policy fee ($10-25), and DMV fees

4. **Given** a customer adjusting coverage limits on the coverage selection screen, **When** they move a slider or change a dropdown value, **Then** the premium breakdown updates in real-time showing how the coverage change affects each coverage category (bodily injury, property damage, collision, comprehensive)

5. **Given** a customer with vehicles of different ages, **When** the premium breakdown is displayed, **Then** it shows vehicle age factors applied appropriately (newer vehicles have higher comprehensive/collision premiums)

---

### User Story 4 - Smart Missing Data Collection (Priority: P2)

A customer proceeds through the quote flow but has not provided certain required information (e.g., license number, lienholder details for financed vehicles). Instead of blocking progress or showing validation errors mid-flow, the system allows them to continue and then presents a dedicated "missing information" screen that collects only the required fields not yet provided - minimizing interruption and cognitive load.

**Why this priority**: This improves completion rates by avoiding premature validation errors and letting users maintain momentum. However, the quote flow can function with traditional inline validation, making this a nice-to-have rather than critical.

**Independent Test**: Can be fully tested by creating a quote without providing optional-turned-required fields (like lienholder info for a financed vehicle), proceeding to review, and verifying a missing info screen appears requesting only the necessary fields. Delivers value by reducing drop-off from validation friction.

**Acceptance Scenarios**:

1. **Given** a customer has selected "Financed" as ownership type for a vehicle but not provided lienholder information, **When** they attempt to finalize their quote, **Then** a missing information screen appears requesting lienholder name and address

2. **Given** a customer has not provided driver license numbers for any drivers, **When** they proceed past coverage selection, **Then** the missing information screen lists each driver and requests their license number and state

3. **Given** the customer completes all missing fields, **When** they click "Next", **Then** they proceed to the final review screen with a complete quote ready for binding

4. **Given** the customer provides some but not all missing information, **When** they attempt to proceed, **Then** the system clearly indicates which fields are still required before they can continue

5. **Given** all required information is already provided during the initial flow, **When** the customer proceeds to review, **Then** the missing information screen is skipped entirely

---

### User Story 5 - Vehicle-Specific Add-Ons Management (Priority: P3)

A customer wants to add rental reimbursement coverage to one vehicle but not others, or wants additional equipment coverage for aftermarket accessories on their truck. The system allows them to toggle add-on coverages per vehicle and select coverage amounts, with the premium updating to show the incremental cost for each add-on.

**Why this priority**: Add-ons are revenue-generating but not essential for an MVP quote flow. Customers can get baseline quotes without this feature, making it lower priority than core rating and prefill functionality.

**Independent Test**: Can be fully tested by toggling rental reimbursement for a specific vehicle, selecting an equipment coverage amount ($1,000 or $5,000), and verifying the premium increases appropriately. Delivers value by allowing customers to customize protection per vehicle.

**Acceptance Scenarios**:

1. **Given** a customer with multiple vehicles, **When** they view the add-ons screen, **Then** each vehicle is listed separately with toggle switches for rental reimbursement and additional equipment coverage

2. **Given** the customer toggles rental reimbursement "on" for one vehicle, **When** the premium recalculates, **Then** the price sidebar shows the incremental cost for that specific vehicle's rental coverage

3. **Given** the customer enables additional equipment coverage, **When** they select the coverage amount ($1,000 or $5,000), **Then** the premium adjusts based on the selected coverage limit

4. **Given** the customer has comprehensive or collision coverage on a vehicle, **When** they view add-ons, **Then** additional equipment coverage is available as an option with amount selection buttons

5. **Given** certain add-ons are always included (roadside assistance), **When** the customer views the add-ons screen, **Then** these are shown as enabled with toggles disabled and labeled "Always On"

---

### Edge Cases

- What happens when external carrier API is unavailable during prefill lookup? System should gracefully fall back to manual entry without blocking the quote flow.

- How does the system handle partial prefill data (e.g., vehicles found but no driver information)? Should populate available data and prompt for missing details.

- What happens if a customer's prior policy has 5 vehicles but they only want to insure 2? Should allow removal of prefilled vehicles via "Remove this vehicle" button on cards.

- How does the system handle VIN lookup failures for prefilled vehicles? Should display vehicle with available information and allow manual correction.

- What happens when a customer edits a prefilled vehicle's year/make/model to values that create an invalid VIN mismatch? System should validate and request VIN correction or removal.

- How does the system handle state-specific requirements (e.g., mandatory uninsured motorist coverage in some states)? Should apply state rules automatically and prevent customers from deselecting mandatory coverages.

- What happens when premium calculation fails mid-flow due to missing rating data? Should display user-friendly error message and allow customer to save partial quote for completion later.

- How does the system handle customers switching between "Owned", "Financed", and "Leased" ownership types? Should dynamically show/hide lienholder fields and update premium based on ownership risk factors.

- What happens when a customer adds a driver with a DUI or multiple accidents? Should apply appropriate surcharges and potentially display a message about high-risk status or specialist underwriting review.

- How does the system handle expiration of prefilled quote data? Should maintain quote for 30 days and send reminder emails before expiration.

- How does the system handle mock service failures or timeouts? System should log errors, use fallback defaults (e.g., default safety rating, medium risk driver), and continue quote flow without blocking the customer.

- What happens when VIN decoder returns incomplete data? System should populate available fields and allow customer to manually enter missing vehicle details.

- How does the system handle MVR check failures for drivers? System should default to medium risk level and calculate premium with conservative surcharges, then allow manual override if customer provides proof of clean record.

## Requirements

### Functional Requirements

#### Progressive Prefill System

- **FR-001**: System MUST provide a search interface for customers to look up prior policy information using last name and ZIP code
- **FR-002**: System MUST integrate with mock prior policy database to retrieve existing carrier policy data including vehicles, drivers, and coverage history. The prefill system MUST call the Prior Policy Lookup integration to search for existing policies by last name and ZIP code.
- **FR-003**: System MUST display an animated loading screen with progress indicators showing each prefill step (e.g., "Insurance history ✓", "Checking vehicle information...")
- **FR-004**: System MUST auto-populate a quote with prefilled vehicle data including year, make, model, VIN, and ownership type when prior policy is found
- **FR-005**: System MUST auto-populate a quote with prefilled driver data including name, date of birth, and relationship to primary insured when prior policy is found
- **FR-006**: System MUST allow customers to proceed with manual entry if no prior policy is found or if they choose to skip prefill
- **FR-007**: System MUST handle prefill service failures gracefully by falling back to manual entry without blocking the quote flow

#### Mock Service Integration

- **FR-007a**: System MUST integrate with VIN Decoder service to automatically populate vehicle year, make, model, trim, and body style when VIN is entered
- **FR-007b**: System MUST integrate with Vehicle Valuation service to determine replacement cost for comprehensive and collision coverage calculations
- **FR-007c**: System MUST integrate with Vehicle Safety Ratings service to apply safety discounts (5-star: 10%, 4-star: 5%) to premiums
- **FR-007d**: System MUST integrate with Motor Vehicle Record (MVR) service to retrieve driver history and calculate risk-based surcharges
- **FR-007e**: All mock service integrations MUST include realistic latency (1-3 seconds) and error scenarios (5-10% failure rate) to simulate production behavior
- **FR-007f**: All mock service integrations MUST be feature-flagged to allow enabling/disabling without code changes

#### Card-Based Summary and Edit-In-Place

- **FR-008**: System MUST display vehicles as individual cards showing key details (year, make, model) with an "Edit vehicle" action link
- **FR-009**: System MUST display drivers as individual cards showing name, age, and role (primary insured vs additional driver) with an "Edit driver" action link
- **FR-010**: System MUST provide "Add vehicle(s)" and "Add another driver" buttons on the summary screen to allow expansion of coverage
- **FR-011**: System MUST open an inline edit interface (modal or drawer) when "Edit vehicle" or "Edit driver" is clicked, allowing modification of all relevant fields
- **FR-012**: System MUST recalculate premium immediately when edit changes are saved and update the sticky price sidebar
- **FR-013**: System MUST persist all edit changes across navigation between quote flow screens
- **FR-014**: System MUST allow removal of vehicles or drivers via a "Remove" button on their respective cards

#### Sticky Price Sidebar with Live Updates

- **FR-015**: System MUST display a sticky price sidebar on all quote flow screens showing the current premium total
- **FR-016**: Price sidebar MUST show the policy term (e.g., "6-month policy quote"), down payment amount, and installment breakdown (e.g., "Due today + 5 payments of $X")
- **FR-017**: Price sidebar MUST update in real-time when any coverage, vehicle, or driver change is made
- **FR-018**: Price sidebar MUST display applied discounts by name (e.g., Multi-Car Discount, Homeowner Discount)
- **FR-019**: Price sidebar MUST show the total 6-month premium before installments

#### Enhanced Premium Calculation with Detailed Breakdown

- **FR-020**: System MUST calculate premium using detailed rating factors including vehicle age, driver age and experience, location ZIP code risk rating, and coverage limits
- **FR-021**: System MUST apply appropriate discounts when conditions are met: multi-policy (10%), good driver (15%), anti-theft device (5%), low annual mileage (10%), homeowner (5%), defensive driving course (10%), pay-in-full (5%)
- **FR-022**: System MUST apply appropriate surcharges when risk factors are present: accident in last 3 years (25%), DUI/DWI (50%), speeding violation (15%), at-fault claim (20%), young driver under 25 (40%), high-risk vehicle (30%), low credit score (20%), lapse in prior coverage (10%)
- **FR-023**: System MUST calculate state-specific premium tax (2-4% depending on state), policy fee ($10-25 per state), and DMV fees per state regulations
- **FR-024**: System MUST provide a coverage-level premium breakdown showing separate costs for bodily injury liability, property damage liability, collision, comprehensive, uninsured/underinsured motorist, medical payments, and rental reimbursement
- **FR-025**: System MUST store all premium calculation details (rating factors, discounts, surcharges, taxes/fees, coverage breakdowns) in a premium calculation audit table for transparency and compliance
- **FR-026**: System MUST return enhanced premium breakdown in API response including applied discounts array, applied surcharges array, taxes and fees object, coverage breakdown object, subtotal, and total

#### Missing Data Collection

- **FR-027**: System MUST identify which required fields are missing after the customer completes initial data entry (e.g., license numbers, lienholder information for financed vehicles)
- **FR-028**: System MUST present a dedicated "missing information" screen listing all required fields not yet provided, grouped by entity (vehicle or driver)
- **FR-029**: System MUST allow customers to proceed through most of the quote flow even with missing optional fields, deferring collection until final review
- **FR-030**: System MUST validate that all required fields are completed before allowing quote finalization or binding
- **FR-031**: System MUST provide clear error messaging indicating which fields are required if customer attempts to proceed with incomplete data

#### Vehicle-Specific Add-Ons Management

- **FR-032**: System MUST provide toggle switches for rental reimbursement coverage on a per-vehicle basis
- **FR-033**: System MUST provide toggle switches for additional equipment coverage on a per-vehicle basis with coverage amount selection ($1,000 or $5,000)
- **FR-034**: System MUST only offer additional equipment coverage to vehicles that have comprehensive or collision coverage
- **FR-035**: System MUST display "Always On" add-ons (like roadside assistance) with disabled toggles indicating they are included with every policy
- **FR-036**: System MUST recalculate premium when add-ons are toggled on/off and update the price sidebar with incremental costs
- **FR-037**: System MUST store vehicle-specific add-on selections in a vehicle_coverage join table linking vehicles to coverage types

#### Coverage Selection with Interactive Controls

- **FR-038**: System MUST organize coverages into categories: "Protect your assets" (liability), "Protect your vehicles" (physical damage), "Protect you & your loved ones" (medical/UM/UIM)
- **FR-039**: System MUST provide interactive sliders for adjusting coverage limits (e.g., bodily injury liability, property damage liability, deductibles)
- **FR-040**: System MUST provide dropdown selects for coverages with discrete options (e.g., bodily injury limits like $100k/$300k, $300k/$500k, $500k/$1M)
- **FR-041**: System MUST display current coverage value prominently next to each coverage title as user adjusts sliders or dropdowns
- **FR-042**: System MUST provide explanatory descriptions for each coverage type to help customers understand what they're purchasing

#### Data Model Extensions

- **FR-043**: Person entity MUST include fields for marital_status, years_licensed, relationship (for additional drivers), license_state, license_number, age_first_licensed
- **FR-044**: Vehicle entity MUST include fields for ownership_type (OWNED, LEASED, FINANCED), lienholder_name, lienholder_address, primary_driver_id (FK to person), usage_type (COMMUTE, PLEASURE, BUSINESS)
- **FR-045**: Policy entity MUST include fields for coverage_start_date and quote_status (INCOMPLETE, ENRICHED, QUOTED, EXPIRED)
- **FR-046**: System MUST create a vehicle_coverage table to store per-vehicle add-on selections with vehicle_id FK, coverage_type, enabled boolean, and coverage_amount
- **FR-047**: System MUST create a mock_prior_policies table to simulate external carrier policy data with fields for policy_number, last_name, zip_code, vehicles (JSONB), drivers (JSONB)

### External Integrations (Simulated for Demo)

This feature requires integration with external data sources that will be simulated for the demo application. In production, these would connect to real third-party APIs.

#### Prior Policy Lookup Integration

- **Purpose**: Retrieve existing auto insurance policy data from other carriers to prefill customer quotes
- **Input**: Customer last name and ZIP code
- **Output**: Policy data including vehicles (year, make, model, VIN, ownership type, annual mileage) and drivers (name, date of birth, relationship)
- **Behavior**: 70% success rate (policy found), 30% no results (proceed to manual entry), 2-second simulated latency
- **Error Handling**: Graceful fallback to manual entry if integration is unavailable
- **Demo Implementation**: Mock database table with 15-20 sample policies indexed by last name and ZIP code

#### VIN Decoder Integration

- **Purpose**: Decode Vehicle Identification Numbers to retrieve vehicle specifications
- **Input**: 17-character VIN
- **Output**: Vehicle details (year, make, model, trim, body style, engine, transmission, fuel type, manufacturer)
- **Validation**: VIN checksum validation (9th digit algorithm), year decoding from position 10
- **Error Handling**: Return error message for invalid VINs, allow manual entry override
- **Demo Implementation**: Mock database with 50+ common vehicles, VIN validation algorithm

#### Vehicle Valuation Integration

- **Purpose**: Estimate market value and replacement cost for rating calculations
- **Input**: Year, make, model, trim, mileage, condition
- **Output**: Trade-in value, private party value, dealer retail value, replacement cost
- **Calculation Logic**: Depreciation curves (20% first year, exponential decay), mileage adjustments (12k miles/year baseline), condition factors
- **Demo Implementation**: Mathematical model with realistic depreciation curves and base MSRP data

#### Vehicle Safety Ratings Integration

- **Purpose**: Retrieve safety ratings for insurance premium discounts
- **Input**: Year, make, model
- **Output**: NHTSA 5-star ratings (overall, frontal, side, rollover), IIHS ratings (crash tests, crash avoidance), advanced safety features
- **Rating Impact**: Higher safety ratings result in premium discounts (5-star: 10% discount, 4-star: 5% discount)
- **Demo Implementation**: Mock database with safety ratings for 100+ common vehicles

#### Motor Vehicle Record (MVR) Check Integration

- **Purpose**: Retrieve driver history for risk assessment and surcharge calculation
- **Input**: Driver license number, license state, date of birth
- **Output**: Driving score (0-100), risk level (LOW/MEDIUM/HIGH), incidents (accidents, violations, DUI), years licensed
- **Behavior**: 90% clean records (score 80-100, LOW risk), 8% moderate risk (1-2 violations), 2% high risk (accidents/DUI)
- **Error Handling**: Default to medium risk if MVR check fails
- **Demo Implementation**: Random generation based on statistical distribution of driver risk profiles

### Key Entities

- **Prior Policy Record**: Represents a customer's existing insurance policy from another carrier, containing vehicle and driver information used for prefill. Key attributes: policy number, carrier name, last name, ZIP code, vehicles array, drivers array, effective date, expiration date

- **Vehicle Coverage Assignment**: Represents the many-to-many relationship between vehicles and optional coverage add-ons (rental reimbursement, additional equipment). Key attributes: vehicle ID, coverage type, enabled status, coverage amount, effective date

- **Premium Calculation Breakdown**: Represents the detailed calculation audit trail showing how a premium was derived. Key attributes: quote ID, base premium, rating factors array, applied discounts array, applied surcharges array, coverage breakdown object, taxes and fees object, subtotal, total, calculation timestamp

- **Missing Field Record**: Represents required data that is missing from a quote and needs collection. Key attributes: quote ID, entity type (vehicle or driver), entity ID, field name, field label, required vs optional status

- **Driver Assessment**: Represents evaluation of driver risk factors including MVR check results (mock in demo mode). Key attributes: driver ID, accident count, violation count, DUI status, driving score (0-100), risk level (LOW/MEDIUM/HIGH), assessment date

- **Vehicle Assessment**: Represents evaluation of vehicle risk factors including safety ratings and theft risk (mock in demo mode). Key attributes: vehicle ID, safety rating (1-5 stars), theft risk level, repair cost category, market value, assessment date

- **VIN Decode Result**: Represents the output from the VIN decoder integration. Key attributes: VIN, valid flag, year, make, model, trim, body style, engine, transmission, fuel type, vehicle class, manufacturer, decode timestamp

- **Vehicle Valuation Result**: Represents the output from the vehicle valuation integration. Key attributes: year, make, model, mileage, condition, trade-in value, private party value, dealer retail value, replacement cost, confidence score, valuation date

- **Safety Rating Result**: Represents the output from the safety ratings integration. Key attributes: year, make, model, NHTSA overall rating, NHTSA frontal rating, NHTSA side rating, NHTSA rollover rating, IIHS crash test ratings, advanced safety features array, rating date

- **MVR Check Result**: Represents the output from the motor vehicle record integration. Key attributes: license number, license state, driving score, risk level, incidents array, years licensed, accident count, violation count, DUI status, check date

## Success Criteria

### Measurable Outcomes

- **SC-001**: Customers with prior policies complete quote in under 3 minutes (compared to 8-10 minutes for manual entry), representing 60-70% time savings
- **SC-002**: Quote completion rate increases by 40% for customers who use the prefill feature compared to manual entry baseline
- **SC-003**: 90% of customers successfully navigate the card-based summary screen and make at least one edit to prefilled data without assistance
- **SC-004**: Premium calculation completes in under 2 seconds even with complex scenarios (multiple vehicles, drivers, discounts, and surcharges)
- **SC-005**: System handles 1,000 concurrent quote creation requests without performance degradation or calculation errors
- **SC-006**: 95% of customers find the premium breakdown "clear and helpful" in understanding their quote (measured via post-quote survey)
- **SC-007**: Customer support tickets related to "why is my premium this amount" reduce by 50% after implementation of detailed breakdown feature
- **SC-008**: Missing information collection screen reduces quote abandonment by 25% compared to inline validation errors
- **SC-009**: Customers who add optional coverage add-ons (rental reimbursement, additional equipment) increase by 30% when presented with per-vehicle toggles vs traditional checkbox lists
- **SC-010**: Zero premium calculation discrepancies between frontend display and backend calculation (100% accuracy)
