# Feature Specification: Auto Insurance Purchase Flow

**Feature Branch**: `001-auto-insurance-flow`
**Created**: 2025-10-17
**Status**: Draft
**Standard**: OMG Property & Casualty Data Model v1.0 Compliant
**Input**: User description: "i want to create an auto insurance purchase flow. when the user creates a quote it should create an object and move that object through from quote to policy after the user enters in payment info and binds the policy. once the policy is bound that user should be created in the system and can access their policy via a self-service portal. all data should persist, i want a backend DB using neon to house all quotes > policy > user"

## Overview

This specification defines an auto insurance purchase platform built on the OMG Property & Casualty Data Model v1.0 standard, ensuring industry-standard data structures and interoperability with other P&C systems. The platform enables users to generate quotes, bind policies, and manage their insurance through a self-service portal with full conformance to OMG standards.

**Demo Application Notice**: This is a demonstration application designed to showcase a production-ready insurance purchase flow. The following external integrations are simulated with realistic behavior: payment processing (mock payment gateway), email delivery (in-app preview/notifications), and third-party vehicle data services (VIN decoder, vehicle valuation, safety ratings). All simulations provide production-like user experiences and response patterns without actual external API calls or transactions. All other aspects of the system (data model, business logic, security practices, user flows) are implemented as production-ready to demonstrate best practices and OMG compliance.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quote Generation (Priority: P1)

A prospective customer visits the platform to obtain an auto insurance quote by entering their vehicle and driver information, receiving an instant price estimate without needing to create an account.

**Why this priority**: This is the entry point for all users and the primary value proposition - getting a quick quote. Without this, no other functionality matters. This represents the minimal viable product that can be independently tested and demonstrates value.

**Independent Test**: Can be fully tested by entering vehicle/driver details (make, model, year, driver age, location) and receiving a calculated quote amount. Delivers immediate value by showing the user their potential insurance cost.

**Acceptance Scenarios**:

1. **Given** a user visits the quote page, **When** they enter a valid VIN or select vehicle details (make, model, year), **Then** the system retrieves vehicle information (via simulated VIN decoder/vehicle data service) and generates a quote with a premium amount and coverage details
2. **Given** a user has entered incomplete information, **When** they attempt to generate a quote, **Then** the system displays clear validation messages indicating which required fields are missing
3. **Given** a user has entered invalid data (e.g., future year, invalid zip code), **When** they submit the form, **Then** the system displays specific error messages for each invalid field
4. **Given** a quote has been generated, **When** the user views the quote, **Then** they see a unique quote reference number, premium amount, coverage breakdown, and quote expiration date

---

### User Story 2 - Policy Binding and Payment (Priority: P2)

A user with an active quote can proceed to bind the policy by providing payment information, converting their quote into an active insurance policy.

**Why this priority**: This is the conversion step that transforms a quote into revenue. It requires the quote functionality to exist first but is essential for the business model to function.

**Independent Test**: Can be tested by starting with a valid quote and completing the payment flow. Delivers value by allowing users to purchase insurance and generates a confirmed policy.

**Acceptance Scenarios**:

1. **Given** a user has a valid quote, **When** they choose to bind the policy and enter payment information (credit card or bank account details), **Then** the system simulates payment processing with realistic validation and creates an active policy with a policy number upon successful mock payment
2. **Given** a user is entering payment information, **When** the mock payment validation fails (e.g., simulated declined card, invalid card number format, insufficient funds scenario), **Then** the system displays a clear error message matching real payment gateway responses and allows the user to retry with different payment information
3. **Given** a user has successfully bound a policy, **When** the transaction completes, **Then** the system displays a confirmation page with the policy number, effective date, and coverage summary
4. **Given** a policy has been bound, **When** the user receives confirmation, **Then** the quote status is updated to "converted" and the policy status is set to "active"
5. **Given** a quote has expired, **When** a user attempts to bind it, **Then** the system prevents binding and prompts the user to generate a new quote

---

### User Story 3 - Account Creation and Portal Access (Priority: P3)

After successfully binding a policy, a user account is automatically created, allowing the policyholder to access a self-service portal where they can view their policy details, billing/payment history, file claims, and manage their insurance.

**Why this priority**: This enhances the user experience and reduces customer service burden, but the core transaction (quote + purchase) can function without it. This is a value-add feature that improves retention and demonstrates production-ready self-service capabilities.

**Independent Test**: Can be tested by completing a policy binding and then accessing the portal with the generated credentials. Delivers value by providing ongoing policy management, billing transparency, and claims reporting capabilities.

**Acceptance Scenarios**:

1. **Given** a user has successfully bound a policy, **When** the transaction completes, **Then** a user account is automatically created using the email address provided during quote/binding
2. **Given** a new account has been created, **When** the account creation completes, **Then** the system displays/generates a welcome message with login credentials (or a secure link to set a password) and instructions to access the portal
3. **Given** a user has portal access, **When** they log in for the first time, **Then** they can view their active policy details including coverage, premium, effective dates, and policy documents
4. **Given** a user is logged into the portal, **When** they navigate to their policy, **Then** they can view their quote history, including converted and expired quotes
5. **Given** a user has multiple policies (edge case for future), **When** they log in, **Then** they see a dashboard listing all their policies with the ability to select and view each one
6. **Given** a user is logged into the portal, **When** they navigate to billing/payment history, **Then** they can view all payment transactions including date, amount, payment method (masked), status, and transaction details
7. **Given** a user is logged into the portal, **When** they select "File a Claim", **Then** they can submit a new claim by providing incident details (date, location, description, photos), vehicle information, and receive a claim reference number
8. **Given** a user has filed a claim, **When** they view their claim history, **Then** they can see all submitted claims with status (submitted, under review, approved, denied, closed), claim number, incident date, and claim amount

---

### Edge Cases

**Quote Flow Edge Cases:**
- How does the system handle a quote that expires before payment? (System prevents binding and prompts user to generate new quote)
- How does system handle duplicate quote submissions? (Detect duplicate requests within 5 minutes and return existing quote)
- How does system handle concurrent quote generations by the same user? (Allow multiple quotes, each with unique reference number)

**Vehicle Data Lookup Edge Cases:**
- What happens when a user enters an invalid VIN format? (Display validation error with VIN format requirements, suggest corrections)
- What happens when a VIN is not found in the simulated vehicle database? (Provide manual vehicle entry option, allow user to input make/model/year)
- What happens when vehicle data service simulation times out? (Display friendly error message, provide retry option or manual entry fallback)
- What happens when vehicle valuation data is unavailable? (Use default valuation estimates based on make/model/year, display disclaimer)
- What happens when safety rating data is missing for older vehicles? (Display "Safety ratings not available for this model year", allow quote to proceed)
- How does system handle VINs for exotic or rare vehicles not in mock dataset? (Provide manual entry with vehicle type selection, estimate market value based on category)

**Payment & Binding Edge Cases:**
- What happens if payment processing is slow or times out? (Display processing message with realistic loading states, simulate network delays, implement timeout handling with retry capability)
- What happens if the quote-to-policy conversion fails mid-transaction? (Implement transaction rollback, maintain quote in "pending" status, notify user)

**Account & Portal Edge Cases:**
- What happens when a user tries to access the portal before their account is created? (Display appropriate message indicating account is being set up)
- How does system handle users who already have an account binding a second policy? (Link new policy to existing account rather than creating duplicate account)
- What happens when a user tries to file a claim for a vehicle not on their policy? (Display validation error, show list of insured vehicles)
- What happens when claim photo upload fails (network error, file too large)? (Display error message, allow retry, show file size limits)
- What happens when no payment history exists (newly bound policy)? (Display "No payment history yet" message with upcoming payment due date)
- What happens when a user tries to view a claim that was filed by another party on their policy? (Display claim with appropriate permissions, show role as "policyholder" vs "claimant")
- What happens when policy documents are still being generated? (Display "Documents processing" status with estimated availability time)
- What happens when a user has multiple policies and tries to file a claim? (Prompt user to select which policy the claim is for before proceeding)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST capture and store quote requests with vehicle details (make, model, year, VIN), driver details (age, driving history, location), and requested coverage levels, enriching vehicle data through simulated third-party vehicle information services
- **FR-002**: System MUST generate a unique quote reference number for each quote request
- **FR-003**: System MUST calculate insurance premium using a realistic rating engine based on industry-standard rating factors including vehicle characteristics, driver profile, location, coverage selections, and risk scoring. The rating engine MUST persist complete calculation audit trail (all rating factors, weights, discounts, surcharges, intermediate values) to Premium Calculation entity with timestamp and quote_id FK for transparency and regulatory compliance.
- **FR-004**: System MUST assign a quote expiration date of 30 days from quote creation
- **FR-005**: System MUST validate all input data (vehicle information, driver information, payment details) before processing
- **FR-006**: System MUST allow users to retrieve and view previously generated quotes using the quote reference number
- **FR-007**: System MUST transition a quote object to a policy object when user completes payment and binding process
- **FR-008**: System MUST simulate payment processing with realistic mock payment gateway behavior (including validation, success/failure scenarios, and processing delays) before creating policy
- **FR-009**: System MUST generate a unique policy number for each successfully bound policy
- **FR-010**: System MUST store policy effective date, expiration date, coverage details, and premium amount
- **FR-011**: System MUST automatically create a user account when a policy is successfully bound
- **FR-012**: System MUST generate and display account credentials and welcome information after account creation (via in-app preview, notification center, or demo email service)
- **FR-013**: System MUST provide URL-based portal access using policy number (demo mode - no authentication required)
- **FR-014**: System MUST allow authenticated users to view all their active and historical policies
- **FR-015**: System MUST allow authenticated users to view their quote history (active, expired, and converted quotes)
- **FR-016**: System MUST persist all data (quotes, policies, user accounts) in the database with appropriate relationships
- **FR-017**: System MUST track the status of each quote (draft, active, expired, converted)
- **FR-018**: System MUST track the status of each policy (pending, active, cancelled, expired)
- **FR-019**: System MUST prevent binding of expired quotes and display user-friendly message indicating quote expiration with link to generate new quote
- **FR-020**: System MUST link multiple policies to the same portal access token if the user binds additional policies using the same email address

**OMG P&C Data Model Compliance Requirements:**

- **FR-021**: System MUST implement all OMG core entities: Party, Person (subtype of Party), Communication Identity, Geographic Location, Location Address, Account, Product, Agreement, Policy (subtype of Agreement), Insurable Object, Vehicle (subtype of Insurable Object), Coverage, Policy Coverage Detail, Policy Limit, Policy Deductible, Policy Amount (Money), Event, Policy Event, Assessment, and required relationship tables
- **FR-022**: System MUST use OMG Party Role pattern for all relationships between Party and major entities (Agreement Party Role, Account Party Role, Insurable Object Party Role)
- **FR-023**: System MUST use OMG naming conventions with standard class words (Identifier, Code, Name, Description, Date, Amount, etc.) for all entity attributes
- **FR-024**: System MUST implement Policy as a subtype of Agreement, inheriting agreement attributes and adding policy-specific attributes
- **FR-025**: System MUST implement Vehicle as a subtype of Insurable Object, inheriting insurable object attributes and adding vehicle-specific attributes
- **FR-026**: System MUST track temporal validity for all relationships using begin_date and end_date attributes per OMG pattern
- **FR-027**: System MUST track effective_date and expiration_date for all Policy Coverage Details, Policy Limits, and Policy Deductibles
- **FR-028**: System MUST create Policy Event records for all significant policy lifecycle events (quote creation, binding, activation) with event_type_code and event_date
- **FR-029**: System MUST organize coverages by Coverage Part (LIABILITY, COLLISION, COMPREHENSIVE, PIP, UM, UIM) following OMG coverage structure
- **FR-030**: System MUST link Coverage to Policy through Policy Coverage Detail entity (not direct relationship)
- **FR-031**: System MUST store premium amounts using Policy Amount entity with amount_type_code (PREMIUM, TAX, FEE, SURCHARGE)
- **FR-032**: System MUST create Account entity for each customer and link to Party through Account Party Role
- **FR-033**: System MUST link Account to Agreement (Policy) through Account Agreement relationship table
- **FR-034**: System MUST store Party contact information through Communication Identity entity with communication_type_code (EMAIL, PHONE, MOBILE)
- **FR-035**: System MUST link Party to Communication Identity through Party Communication relationship with preference indicators
- **FR-036**: System MUST use UUID data type for all entity identifiers following OMG identifier pattern

**Third-Party Vehicle Data Integration Requirements:**

- **FR-037**: System MUST simulate VIN decoder service integration to retrieve vehicle specifications from VIN (year, make, model, body style, engine type, trim level)
- **FR-038**: System MUST simulate vehicle valuation service (e.g., JD Power, Kelley Blue Book) to retrieve estimated market value for rating purposes
- **FR-039**: System MUST simulate vehicle safety rating service (e.g., NHTSA, IIHS) to retrieve safety scores and crash test ratings
- **FR-040**: System MUST provide realistic response times for simulated third-party API calls (500ms-2s at 95th percentile, with loading states and timeout handling)
- **FR-041**: System MUST handle simulated API failure scenarios (timeout, service unavailable, invalid VIN) with appropriate fallback behavior
- **FR-042**: System MUST cache simulated vehicle data responses to demonstrate production caching patterns
- **FR-043**: System MUST validate VIN format (17 characters, alphanumeric excluding I, O, Q) before simulated lookup
- **FR-044**: System MUST enrich Vehicle entity with data from simulated third-party services (market value, safety ratings, specifications)

**Self-Service Portal Requirements:**

- **FR-045**: System MUST provide authenticated portal access for users to view all their policies, quotes, billing, and claims
- **FR-046**: System MUST display billing/payment history showing all payment transactions with date, amount, payment method (last 4 digits only), status, and transaction reference
- **FR-047**: System MUST allow users to file new claims through the portal by submitting incident details (date, time, location, description)
- **FR-048**: System MUST accept claim attachments (photos, documents) up to 10MB per file with common file formats (JPEG, PNG, PDF)
- **FR-049**: System MUST generate a unique claim reference number for each submitted claim
- **FR-050**: System MUST display claim history showing all user claims with status (submitted, under review, approved, denied, closed), claim number, incident date, and estimated claim amount
- **FR-051**: System MUST link claims to the appropriate Policy and Insurable Object (Vehicle) through OMG Claim entity relationships
- **FR-052**: System MUST track claim status transitions (submitted → under review → approved/denied → closed) with timestamps
- **FR-053**: System MUST allow users to view and download policy documents (policy declarations, ID cards, endorsements) from the portal
- **FR-054**: System MUST display policy coverage details with limits, deductibles, and premium breakdown in user-friendly format

**Rating Engine Requirements:**

- **FR-055**: System MUST implement a realistic auto insurance rating engine that calculates premiums based on industry-standard actuarial principles
- **FR-056**: System MUST apply rating factors for vehicle characteristics including year, make, model, body type, engine size, safety features, anti-theft devices, and estimated market value
- **FR-057**: System MUST apply rating factors for driver profile including age, gender, marital status, years of driving experience, and license status
- **FR-058**: System MUST apply rating factors for driving history including accidents (at-fault), violations (speeding, DUI), claims history, and years claim-free
- **FR-059**: System MUST apply geographic rating factors based on ZIP code including accident frequency, theft rates, repair costs, and state minimum coverage requirements
- **FR-060**: System MUST apply coverage-specific rating including liability limits, collision deductible, comprehensive deductible, uninsured motorist, and optional coverages
- **FR-061**: System MUST calculate base premium for each coverage part (liability, collision, comprehensive) independently using coverage-specific rating tables
- **FR-062**: System MUST apply rating discounts including multi-car, good driver, defensive driving course, low mileage, homeowner, and advance quote discounts
- **FR-063**: System MUST apply rating surcharges for high-risk factors including young drivers (<25), recent accidents, violations, lapsed coverage, and high-performance vehicles
- **FR-064**: System MUST calculate final premium by summing all coverage premiums, applying discounts, adding surcharges, and including state taxes and fees
- **FR-065**: System MUST use realistic base rates and rating factors that produce market-competitive premiums (within industry ranges for comparable coverage)
- **FR-066**: System MUST store all rating factors, calculation steps, and intermediate values for transparency and audit purposes
- **FR-067**: System MUST provide itemized premium breakdown showing base premium, each discount applied, each surcharge applied, subtotal, taxes, and total premium
- **FR-068**: System MUST recalculate premium when user changes coverage selections (limits, deductibles) with real-time updates

### Key Entities (OMG P&C Data Model Compliant)

The system implements the following OMG P&C core entities to ensure industry standardization and interoperability:

- **Party**: Represents a person, organization, or group of interest to the enterprise. For auto insurance quotes, this includes the prospective insured (person subtype) with attributes such as name, birth date, gender, and identification. Party serves as the central entity for all person/organization relationships in the system.

- **Communication Identity**: Represents contact methods (email, phone, mobile) associated with a Party. Enables tracking of preferred communication channels and contact information with temporal validity (begin/end dates).

- **Geographic Location**: Represents jurisdictional and physical locations including state, municipality, and address information. Critical for rating, underwriting, and regulatory compliance. Contains Location Address as a related entity.

- **Location Address**: Represents physical addresses with standard components (line 1, line 2, municipality, state, postal code, country). Associated with both Party and Geographic Location entities.

- **Account**: Represents the customer relationship container that holds one or more Agreements. Links Party to their insurance contracts through Account Party Role relationships.

- **Product**: Represents the insurance offering (e.g., "Personal Auto Insurance"). Defines the line of business and licensed product name. Agreements reference Product to indicate what is being sold.

- **Agreement**: A legally binding contract among identified parties. Policy is a subtype of Agreement. Contains agreement type, inception date, and product reference. Serves as the parent entity for Policy.

- **Policy**: A subtype of Agreement representing an insurance contract. Contains policy number, effective date, expiration date, status (QUOTED, BINDING, BOUND, ACTIVE, CANCELLED), and geographic jurisdiction. A quote is represented as a Policy with status='QUOTED', which transitions to BOUND upon payment and binding.

- **Insurable Object**: Represents items that may be included or excluded from insurance coverage. For auto insurance, this is subtyped as Vehicle with attributes including VIN, make, model, year, and driving characteristics.

- **Vehicle**: A subtype of Insurable Object representing automobiles. Contains vehicle identification number (VIN), make name, model name, model year, and other vehicle-specific attributes defined in the OMG standard.

- **Coverage**: Represents an insurance coverage type (e.g., Liability, Collision, Comprehensive). Organized by Coverage Part (e.g., LIABILITY, COLLISION) and Coverage Type. Defines what protection is offered.

- **Policy Coverage Detail**: Links a Policy to specific Coverage provisions for specific Insurable Objects. Contains effective dates, coverage descriptions, and inclusion/exclusion indicators. This is where coverage is applied to specific vehicles.

- **Policy Limit**: Defines maximum amounts the insurer will pay under a coverage. Associated with Policy Coverage Detail. Contains limit type (per person, per accident, property damage), basis code, and limit value.

- **Policy Deductible**: Defines amounts the insured must pay before coverage applies. Associated with Policy Coverage Detail. Contains deductible type (collision, comprehensive), basis code, and deductible value.

- **Policy Amount (Money)**: Represents monetary values associated with policies including premiums, taxes, fees, and surcharges. Contains amount type code, earning periods, insurance type (direct/assumed/ceded), and amount value. Used for rating and billing.

- **Event**: Represents significant occurrences in the system. Policy Event subtype tracks policy lifecycle events (quote creation, binding, endorsements, renewals, cancellations) with event dates, effective dates, and event type codes.

- **Assessment**: Represents risk evaluation and underwriting assessments. Contains assessment descriptions, reasons, begin/end dates. Links to Agreement through Agreement Assessment relationship. Used for quote evaluation and underwriting decisions.

- **Payment**: Extension of Money concept representing payment transactions. Contains payment amount, method data (tokenized), status (pending, completed, failed), transaction ID, and payment date. Links to Policy and Party.

- **User Account**: Extension entity for authentication. Links to Party and contains email, password hash, verification status, and login tracking. Enables portal access for policyholders.

- **Document**: Represents policy documents, ID cards, and declarations. Contains document type, file location, and creation timestamp. Links to Policy for document management.

- **Claim**: OMG core entity representing a request for payment or service under an insurance policy. Contains claim number, incident date, incident location, incident description, claim status (submitted, under review, approved, denied, closed), estimated claim amount, and claim type. Links to Policy and Insurable Object (Vehicle) to identify what is covered and what was damaged. Supports attachment of photos and documents as evidence.

- **Claim Party Role**: Links Party to Claim with specific roles (claimant, injured party, witness, adjuster). Follows OMG Party Role pattern for flexible claim participant tracking.

- **Claim Event**: Subtype of Event tracking claim lifecycle events (submission, status changes, payments, closure) with event dates and timestamps. Provides audit trail for claim processing.

**Rating Engine Entities:**

- **Rating Factor**: Represents a variable used in premium calculation (e.g., driver age, vehicle year, ZIP code risk score). Contains factor name, factor type, factor value, and weight/multiplier applied to base premium.

- **Rating Table**: Contains lookup tables for base rates and factor multipliers organized by coverage type, state, and effective date range. Examples: liability base rates by age group, collision rates by vehicle symbol, comprehensive rates by territory.

- **Discount**: Represents premium reductions applied for favorable characteristics. Contains discount code (MULTI_CAR, GOOD_DRIVER, LOW_MILEAGE), discount percentage, eligibility criteria, and applicable coverage parts.

- **Surcharge**: Represents premium increases applied for risk factors. Contains surcharge code (YOUNG_DRIVER, AT_FAULT_ACCIDENT, VIOLATION), surcharge percentage or flat amount, duration, and applicable coverage parts.

- **Premium Calculation**: Stores the complete premium calculation audit trail including all rating factors evaluated, discounts applied, surcharges applied, coverage subtotals, taxes, fees, and final premium. Links to Policy for transparency and recalculation purposes.

**OMG Relationship Patterns:**

- Party relates to major entities through **Party Role** (INSURED, DRIVER, OWNER, CUSTOMER, PRODUCER, INSURER, CLAIMANT, ADJUSTER), creating flexible many-to-many relationships with role context
- Agreement Party Role links Party to Agreement with role and temporal validity
- Account Party Role links Party to Account with role and temporal validity
- Insurable Object Party Role links Party to Insurable Object (Vehicle) with role and temporal validity
- Claim Party Role links Party to Claim with role (claimant, injured party, witness, adjuster)
- Policy is a subtype of Agreement (is-a relationship), inheriting agreement attributes
- Vehicle is a subtype of Insurable Object (is-a relationship), inheriting insurable object attributes
- Person and Organization are subtypes of Party (is-a relationship)
- Policy Event and Claim Event are subtypes of Event (is-a relationship)

### Terminology Clarifications

To avoid confusion between similar terms used throughout this specification:

- **Account**: OMG entity representing the customer relationship container that holds Agreements (policies). Links Party to their insurance contracts through Account Party Role relationships. (Business concept)

- **User Account**: Authentication entity for portal access. In this demo application, User Accounts are created automatically upon policy binding and linked to Party, but access is via URL-based policy number rather than traditional username/password login. (Technical implementation)

- **Policy Number**: Business identifier displayed to customers (format: POL-XXXXXXXX). This is what customers use to access the portal via URL: `/portal/{policyNumber}`. (User-facing)

- **Policy ID**: UUID primary key in the database for internal entity relationships. Not displayed to customers. (Technical implementation)

- **Quote Reference Number**: Business identifier for quotes (format: QT-XXXXXXXX). Used for quote retrieval and customer service. (User-facing)

- **Portal Access**: URL-based access to self-service portal using policy number. No traditional authentication (username/password) required in demo mode. Production implementation would add authentication while maintaining policy number as primary identifier. (Demo vs Production)

## Success Criteria *(mandatory)*

### Measurable Outcomes

**User Experience Metrics:**

- **SC-001**: Users can complete the quote generation process in under 3 minutes from start to receiving a quote number
- **SC-002**: Users can complete the full purchase flow (quote generation + payment + policy binding) in under 15 minutes
- **SC-003**: 95% of quote calculations are generated and displayed to the user within 5 seconds of form submission
- **SC-004**: Mock payment processing completes within 3 seconds for 99% of transactions (simulating realistic payment gateway timing)
- **SC-005**: User accounts are created and welcome messages are generated/displayed within 1 minute of successful policy binding
- **SC-006**: Portal login and policy display loads within 3 seconds for authenticated users

**Data Integrity Metrics:**

- **SC-007**: 100% of quotes, policies, and user data persist correctly with no data loss in Neon PostgreSQL database
- **SC-008**: System maintains data integrity with correct relationships between all OMG entities (zero orphaned records across Party, Agreement, Policy, Insurable Object, Coverage, and related entities)
- **SC-009**: All Party relationships are properly tracked through Party Role pattern (Agreement Party Role, Account Party Role, Insurable Object Party Role)
- **SC-010**: All Policy Coverage Details correctly link to Policy, Coverage, Insurable Object with proper effective dates and expiration dates

**Business Metrics:**

- **SC-011**: Quote-to-bind conversion rate can be tracked (number of policies with status BOUND vs. policies with status QUOTED)
- **SC-012**: Quote completion rate exceeds 70% (quotes with all required data vs. quotes started)
- **SC-013**: Portal registration rate post-bind reaches 100% (all bound policies result in user account creation)
- **SC-014**: 90% of bindings result in successful user account creation and portal access within 24 hours

**Performance Metrics:**

- **SC-015**: System handles at least 100 concurrent quote calculation requests (simultaneous premium calculations) without performance degradation (response times remain within SC-003 threshold)
- **SC-016**: Database queries for policy retrieval complete within 500 milliseconds for 95% of requests
- **SC-017**: System uptime maintains 99.9% availability

**OMG Compliance Metrics:**

- **SC-018**: 100% of OMG P&C core entities are implemented (Party, Agreement, Policy, Coverage, Policy Coverage Detail, Policy Limit, Policy Deductible, Insurable Object, Geographic Location, Location Address, Money/Policy Amount, Event, Account, Product, Communication)
- **SC-019**: All entity naming follows OMG conventions (business names fully spelled out, standard class words like Identifier, Code, Name, Description, Date, Amount)
- **SC-020**: All Party relationships use OMG Party Role pattern for flexibility and role-based access
- **SC-021**: Policy status transitions follow OMG patterns (QUOTED → BINDING → BOUND → ACTIVE)

**Third-Party Integration Simulation Metrics:**

- **SC-022**: Simulated VIN decoder lookups complete within 1 second for 95% of requests with realistic loading states
- **SC-023**: Vehicle valuation data is enriched on 100% of valid VIN lookups or manual vehicle selections
- **SC-024**: Safety rating data is displayed for 100% of vehicles where data is available in mock dataset
- **SC-025**: Mock API responses demonstrate production integration patterns (proper error handling, retry logic, timeout handling)
- **SC-026**: Vehicle data cache demonstrates production caching patterns (cache hits reduce simulated API call times by 80%)
- **SC-027**: Invalid VIN scenarios display appropriate user-friendly error messages and fallback options

**Self-Service Portal Metrics:**

- **SC-028**: Portal login and dashboard load within 3 seconds for 95% of authenticated users
- **SC-029**: Billing/payment history displays all transactions with complete details (date, amount, method, status) for 100% of users
- **SC-030**: Users can file a claim with all required details (incident date, location, description) and receive a claim reference number within 5 seconds
- **SC-031**: Claim photo/document uploads complete within 10 seconds for files up to 10MB
- **SC-032**: Claim history displays all user claims with current status for 100% of users
- **SC-033**: Policy document downloads (PDF) complete within 5 seconds for 95% of requests
- **SC-034**: Users can successfully access portal features (policies, billing, claims) on first login without additional setup for 90% of new accounts

**Rating Engine Accuracy Metrics:**

- **SC-035**: Premium calculations produce market-realistic rates within industry ranges ($800-$3000/year for standard risk profiles)
- **SC-036**: Rating engine applies all relevant rating factors (vehicle, driver, location, coverage) for 100% of quotes
- **SC-037**: Discount calculations are accurate and cumulative (max 50% cap enforced) for 100% of quotes
- **SC-038**: Surcharge calculations correctly apply risk-based increases for 100% of applicable scenarios
- **SC-039**: Premium recalculation completes within 2 seconds when user changes coverage selections (limits, deductibles)
- **SC-040**: Itemized premium breakdown displays all rating factors, discounts, surcharges, taxes, and fees for 100% of quotes
- **SC-041**: Rating engine validates that liability coverage meets state minimum requirements for 100% of quotes
- **SC-042**: Premium calculation audit trail stores all inputs and intermediate values for regulatory compliance and debugging

### Assumptions

**OMG Data Model Compliance:**

- The system implements OMG Property & Casualty Data Model v1.0 (formal/2014-11-01) core entities with exact naming conventions and relationship patterns
- All required OMG core entities (Party, Agreement, Policy, Coverage, Policy Coverage Detail, Policy Limit, Policy Deductible, Insurable Object, Geographic Location, Location Address, Money, Event, Account, Product, Communication) will be implemented
- Entity naming follows OMG standards: business names fully spelled out in Title Case with standard class words (Identifier, Code, Name, Description, Date, Amount, etc.)
- Party relationships use the OMG Party Role pattern for all major entity associations (Agreement Party Role, Account Party Role, Insurable Object Party Role)
- Policy is implemented as a subtype of Agreement following OMG inheritance patterns
- Vehicle is implemented as a subtype of Insurable Object following OMG inheritance patterns
- Person is implemented as a subtype of Party following OMG inheritance patterns

**Database & Persistence:**

- Neon PostgreSQL is used as the database platform, fully supporting the OMG relational data model
- All OMG entities map to database tables with proper foreign key relationships and referential integrity
- Data persistence ensures zero data loss and proper temporal tracking (begin dates, end dates, effective dates, expiration dates)
- Database supports UUID primary keys for all OMG entities
- Indexes are created for performance on frequently queried OMG relationships

**User Behavior:**

- Users will provide accurate vehicle and driver information for quote generation
- Standard web application performance expectations apply (modern browsers, reasonable internet connection)
- Users understand that quotes are estimates subject to underwriting review

**External Systems:**

- Third-party vehicle data services use **simulated API integrations** for demonstration purposes:
  - **VIN Decoder Service**: Simulates VIN lookup APIs (e.g., NHTSA VIN Decoder, Carfax) to retrieve vehicle specifications
    - Returns make, model, year, body style, engine type, trim level, manufacturer details
    - Validates VIN format (17 characters, check digit validation)
    - Simulates realistic response times (500ms-1s) with loading states
    - Includes error scenarios (invalid VIN, VIN not found, service timeout)
    - Uses pre-populated mock data for common VINs and vehicle combinations
  - **Vehicle Valuation Service**: Simulates market value APIs (e.g., JD Power, Kelley Blue Book, NADA)
    - Returns estimated market value, replacement cost, depreciation data
    - Accounts for year, mileage, condition, location in valuation
    - Simulates realistic pricing data based on vehicle make/model/year
    - Provides production-like valuation ranges (trade-in, private party, retail)
  - **Vehicle Safety Rating Service**: Simulates safety data APIs (e.g., NHTSA, IIHS)
    - Returns overall safety rating, crash test scores, safety features
    - Includes frontal crash, side crash, rollover ratings
    - Lists standard and optional safety equipment
    - Simulates realistic safety data based on vehicle specifications
  - **Integration Patterns**:
    - Mock API responses cached in-memory or database for performance
    - Realistic HTTP response structures (JSON format matching actual APIs)
    - Configurable success/failure scenarios for testing
    - Does NOT make actual external API calls or require API keys
    - Demonstrates production integration patterns (retry logic, timeouts, error handling)
- Email delivery uses a **demo-friendly email service** for demonstration purposes:
  - Email templates and content are production-ready (welcome emails, policy documents, account credentials)
  - Email triggering logic follows production patterns (post-binding, account creation)
  - Emails are displayed in-app or sent to a sandbox environment for review during demos
  - Option 1: Use email preview panel within the application to show email content without delivery
  - Option 2: Use test email service (Resend test mode, Mailpit, MailHog) for local/staging review
  - Option 3: Use in-app notification center to display emails as notifications
  - Does NOT send emails to arbitrary user-provided addresses in production
  - Demonstrates production email integration patterns without actual delivery
- Payment processing uses a **mock payment gateway** that simulates real payment gateway behavior for demo purposes:
  - Simulates realistic payment validation (card number format, expiration date, CVV)
  - Supports both credit card and bank account (ACH) payment method interfaces
  - Mimics production payment gateway responses (success, decline, timeout, validation errors)
  - Includes configurable success/failure scenarios for testing and demonstration
  - Simulates realistic processing delays (1-3 seconds for card processing)
  - Does NOT process real payments or connect to actual payment processors
  - Does NOT store real payment card data (only stores mock payment method tokens for demonstration)
  - Provides production-like user experience without actual financial transactions

**Business Rules:**

- Quotes expire 30 days after creation, following standard industry practice
- Liability coverage is mandatory for all auto insurance policies
- Coverage limits must meet state minimum requirements (state-specific validation to be implemented)
- Policy effective date cannot be in the past
- Quotes must have status='QUOTED' before transitioning to 'BINDING' or 'BOUND'

**Rating Engine & Actuarial Assumptions:**

- Premium calculation uses a **realistic multi-factor rating algorithm** based on industry-standard actuarial principles
- Rating engine implements **multiplicative rating model**: Base Premium × Vehicle Factor × Driver Factor × Location Factor × Coverage Factor × (1 - Total Discounts) × (1 + Total Surcharges)
- **Base rates** are derived from industry loss cost data and expense ratios for realistic pricing
- **Vehicle rating factors** include:
  - ISO vehicle symbols (1-50) based on make/model/year
  - Safety rating impact (IIHS/NHTSA scores reduce collision premium by 5-15%)
  - Anti-theft devices discount (5-10% on comprehensive)
  - Vehicle age depreciation curve (higher for newer vehicles)
  - Market value affects comprehensive/collision base premium
- **Driver rating factors** include:
  - Age bands with actuarial risk curves (highest risk 16-25, lowest 45-65, moderate 65+)
  - Gender-based risk factors (where legally permitted by state)
  - Marital status (married drivers typically 10-15% lower risk)
  - Years of driving experience (new drivers +30-50% surcharge)
  - Credit-based insurance score (where permitted, can affect premium by 20-40%)
- **Driving history factors** include:
  - At-fault accidents: +20-40% per accident for 3 years
  - Moving violations: +10-30% per violation for 3 years
  - DUI/DWI: +50-100% surcharge for 5 years
  - Claim-free years: 5% discount per year (max 25%)
  - Continuous coverage: 5-10% discount (no lapse in past 6 months)
- **Geographic rating factors** include:
  - ZIP code territory rating (1.0 - 2.5x multiplier based on loss experience)
  - Urban vs suburban vs rural classification
  - State-specific mandatory coverage minimums and legal environment
  - Regional weather and natural disaster risk
  - Repair cost index by metro area
- **Coverage-specific rating** includes:
  - Liability: rated by limits selected (split limits or combined single limit)
  - Collision: rated by deductible ($250-$1000), vehicle value, and symbols
  - Comprehensive: rated by deductible, vehicle value, theft risk territory
  - Uninsured/Underinsured Motorist: percentage of liability limits (typically 10-20% of liability premium)
  - Personal Injury Protection (PIP): state-mandated rates where required
  - Medical Payments: flat add-on based on limits
- **Discounts applied** (cumulative):
  - Multi-car: 10-20% (vehicles on same policy)
  - Good driver (no accidents/violations 3+ years): 15-25%
  - Defensive driving course completion: 5-10%
  - Low annual mileage (<7,500 miles/year): 5-15%
  - Homeowner: 5-10%
  - Advance quote (7+ days before effective date): 5%
  - Electronic payment/paperless: 3-5%
  - Maximum total discount cap: 50% of base premium
- **Surcharges applied**:
  - Young driver (<25 years old): +30-100% depending on age
  - Senior driver (>75 years old): +10-30%
  - High-performance vehicle: +20-50%
  - Exotic/luxury vehicle: +25-75%
  - Recent lapse in coverage (>30 days): +15-25%
  - Commercial use of personal vehicle: +20-40%
- **State taxes and fees**:
  - State premium tax: 2-4% of premium (varies by state)
  - Policy fee: $10-25 flat fee
  - DMV/state filing fees: $0-50 (if required)
- **Rating validation**:
  - Premiums are calibrated to produce realistic market rates ($800-3000/year for standard risks)
  - Minimum premium floor: $500/year (all coverages)
  - Maximum premium cap: $10,000/year (prevents unrealistic outliers)
  - Rating tables updated quarterly to reflect market conditions
- **Transparency requirements**:
  - All rating factors, discounts, and surcharges must be itemized on quote
  - User can see impact of changing deductibles/limits in real-time
  - Premium breakdown shows: coverage subtotals + discounts - surcharges + taxes = total
  - Audit trail stores all inputs and calculation steps for regulatory compliance

**Security & Authentication:**

- Password security follows industry standards (bcrypt or Argon2 hashing, minimum complexity requirements)
- User authentication uses JWT-based token authentication with refresh tokens
- Mock payment data is handled securely (simulated tokenization, no real payment card data stored)
- Demo application uses security best practices as if handling real payment data (for production-readiness)
- PII encryption at rest for sensitive Party data
- TLS 1.3 for data in transit
- Role-based access control (RBAC) using Party Role patterns

**Scope Boundaries:**

- The system handles one insurance line (Personal Auto) initially following OMG Subject Area Model; multi-line expansion (homeowners, commercial) is out of scope for MVP but supported by OMG architecture
- Policy mid-term changes (endorsements) are out of scope for initial implementation; users can view policies but not modify coverage mid-term
- **Claims filing is IN SCOPE**: Users can file new claims through the portal with incident details and attachments; the system tracks claim status
- **Claims processing/adjudication is OUT OF SCOPE**: Claim review, approval/denial workflow, payment processing, and claims adjusting are deferred to future phases
- Renewal workflow is out of scope for initial implementation
- Reinsurance is out of scope for initial implementation (though supported by OMG Agreement entity)
- Producer/agent portal is out of scope for initial implementation
- Payment plans and installment billing are out of scope for MVP (pay-in-full only)
- The Assessment Subject Area is simplified for MVP (basic underwriting only, full risk scoring deferred to Phase 2)
- Billing/payment history viewing is IN SCOPE; making additional payments or payment plan management is OUT OF SCOPE

**Integration & Interoperability:**

- The OMG-compliant data model enables future integration with other P&C systems, vendors, and partners
- Common industry vocabulary through OMG standard facilitates communication with third-party services (rating engines, fraud detection, credit scoring)
- Standard geographic jurisdiction tracking through Geographic Location entity enables multi-state expansion
- Event entity provides audit trail capabilities for regulatory compliance
