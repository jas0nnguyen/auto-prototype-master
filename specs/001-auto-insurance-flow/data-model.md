# Data Model Specification: Auto Insurance Purchase Flow
**OMG Property & Casualty Data Model v1.0 Compliance**

---

## 1. Overview

### 1.1 Introduction to OMG P&C Data Model

This auto insurance purchase platform is built on the **OMG Property & Casualty Data Model v1.0** (formal/2014-11-01), a comprehensive industry standard for insurance data management. The OMG P&C Data Model provides a proven, enterprise-grade foundation that addresses the data management needs of the Property & Casualty insurance community using Model Driven Architecture (MDA) principles.

### 1.2 Why OMG Standards Matter

**Industry Interoperability**: The OMG standard enables seamless integration with other P&C insurance systems, vendors, and partners by providing a common vocabulary and data structure across the industry.

**Best Practices**: Based on decades of insurance industry experience, the OMG model encodes proven patterns for handling complex insurance relationships, temporal data, and regulatory requirements.

**Future-Proof Architecture**: The standard's extensible design supports expansion to other insurance lines (homeowners, commercial), reinsurance, and advanced features while maintaining backward compatibility.

**Regulatory Compliance**: Standard geographic jurisdiction tracking, party identity management, and audit trails through Event entities ensure regulatory compliance across multiple states.

### 1.3 Entity Count

This implementation includes **27 core entities** organized across multiple subject areas:
- **5** Core Party Entities
- **3** Account & Product Entities
- **14** Policy & Coverage Entities
- **2** Insurable Object Entities
- **1** Coverage Entity (with supporting reference tables)
- **5** Rating Engine Entities
- **3** Claims Entities
- **2** Payment & Documents Entities

---

## 2. Entity Catalog

### 2.1 CORE PARTY ENTITIES

#### 2.1.1 Party

**Description**: Represents a person, organization, or group of interest to the enterprise. Party serves as the central entity for all person/organization relationships in the system, including prospective insureds, policyholders, drivers, and other stakeholders.

**Primary Key**: `party_identifier` (UUID)

**Key Attributes**:
- `party_identifier` (UUID) - Unique identifier following OMG pattern
- `party_name` (VARCHAR 255) - Full name of the party
- `party_type_code` (VARCHAR 50) - Type classification: PERSON, ORGANIZATION, GROUPING
- `begin_date` (TIMESTAMP) - Temporal validity start
- `end_date` (TIMESTAMP) - Temporal validity end (nullable)
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Supertype for Person and Organization (subtype pattern)
- Links to Communication Identity through Party Communication
- Links to Agreement through Agreement Party Role
- Links to Account through Account Party Role
- Links to Insurable Object through Insurable Object Party Role
- Links to Claim through Claim Party Role
- Links to User Account (one-to-one)
- Links to Payment (one-to-many)

**Validation Rules**:
- `party_identifier` must be unique UUID
- `party_name` is required
- `party_type_code` must be one of: PERSON, ORGANIZATION, GROUPING
- `begin_date` must not be in the future
- `end_date` must be after `begin_date` when present

**State Transitions**: Not applicable (Party is a master entity with temporal validity)

---

#### 2.1.2 Person

**Description**: Subtype of Party representing individual persons. For auto insurance quotes, this includes the prospective insured with attributes such as name components, birth date, gender, and identification. Person inherits all Party attributes.

**Primary Key**: `person_identifier` (UUID, references party.party_identifier)

**Key Attributes**:
- `person_identifier` (UUID) - Foreign key to Party (is-a relationship)
- `prefix_name` (VARCHAR 20) - Title (Mr., Mrs., Dr., etc.)
- `first_name` (VARCHAR 100) - Legal first name (required)
- `middle_name` (VARCHAR 100) - Middle name or initial
- `last_name` (VARCHAR 100) - Legal last name (required)
- `suffix_name` (VARCHAR 20) - Suffix (Jr., Sr., III, etc.)
- `full_legal_name` (VARCHAR 255) - Complete legal name
- `nickname` (VARCHAR 100) - Preferred name
- `birth_date` (DATE) - Date of birth
- `birth_place_name` (VARCHAR 255) - Place of birth
- `gender_code` (VARCHAR 20) - Gender classification
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Subtype of Party (is-a relationship via foreign key)
- Inherits all Party relationships

**Validation Rules**:
- `person_identifier` must exist in Party table
- `first_name` and `last_name` are required
- `birth_date` must be in the past
- `birth_date` must indicate person is at least 16 years old for auto insurance (driver age requirement)
- `gender_code` must be valid code (where used for rating, subject to state regulations)

**State Transitions**: Not applicable

---

#### 2.1.3 Communication Identity

**Description**: Represents contact methods (email, phone, mobile, fax) associated with a Party. Enables tracking of preferred communication channels and contact information with temporal validity through Party Communication relationship.

**Primary Key**: `communication_identifier` (UUID)

**Key Attributes**:
- `communication_identifier` (UUID) - Unique identifier
- `communication_type_code` (VARCHAR 50) - Type: EMAIL, PHONE, MOBILE, FAX
- `communication_value` (VARCHAR 255) - Contact value (email address, phone number)
- `communication_qualifier_value` (VARCHAR 100) - Additional qualifier (extension, etc.)
- `geographic_location_identifier` (UUID) - Associated geographic location (nullable)
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Links to Party through Party Communication (many-to-many with temporal validity)
- Links to Geographic Location (optional, for phone area codes)

**Validation Rules**:
- `communication_type_code` must be one of: EMAIL, PHONE, MOBILE, FAX
- `communication_value` format must match type (email regex, phone format, etc.)
- Email addresses must be valid format and unique for User Account creation
- Phone numbers must be valid format (10 digits for US)

**State Transitions**: Not applicable

---

#### 2.1.4 Geographic Location

**Description**: Represents jurisdictional and physical locations including state, municipality, and address information. Critical for rating, underwriting, and regulatory compliance. Contains hierarchical location relationships and links to Location Address.

**Primary Key**: `geographic_location_identifier` (UUID)

**Key Attributes**:
- `geographic_location_identifier` (UUID) - Unique identifier
- `geographic_location_type_code` (VARCHAR 50) - Type classification
- `location_code` (VARCHAR 50) - Standard location code
- `location_name` (VARCHAR 255) - Location name
- `location_number` (VARCHAR 50) - Location number/identifier
- `state_code` (VARCHAR 2) - State code (foreign key)
- `parent_geographic_location_identifier` (UUID) - Hierarchical parent location
- `location_address_identifier` (UUID) - Associated address
- `physical_location_identifier` (UUID) - Physical location reference
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Links to State (many-to-one)
- Self-referential hierarchy through parent_geographic_location_identifier
- Links to Location Address (one-to-one)
- Referenced by Policy for jurisdiction
- Referenced by Insurable Object for location
- Referenced by Policy Amount for geographic rating

**Validation Rules**:
- `state_code` must exist in State reference table
- Hierarchical structure must not create circular references
- For auto insurance, primary location must be within licensed states

**State Transitions**: Not applicable

---

#### 2.1.5 Location Address

**Description**: Represents physical addresses with standard components (line 1, line 2, municipality, state, postal code, country). Associated with both Party and Geographic Location entities following OMG pattern for address management with temporal validity.

**Primary Key**: `location_address_identifier` (UUID)

**Key Attributes**:
- `location_address_identifier` (UUID) - Unique identifier
- `line_1_address` (VARCHAR 255) - Street address line 1 (required)
- `line_2_address` (VARCHAR 255) - Street address line 2 (apartment, suite, etc.)
- `municipality_name` (VARCHAR 100) - City/town name (required)
- `state_code` (VARCHAR 2) - State code (required)
- `postal_code` (VARCHAR 20) - ZIP/postal code (required)
- `country_code` (VARCHAR 3) - Country code (default: USA)
- `begin_date` (TIMESTAMP) - Temporal validity start
- `end_date` (TIMESTAMP) - Temporal validity end (nullable)
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Links to State via state_code
- Referenced by Geographic Location
- Used for Party garaging location
- Used for rating and underwriting

**Validation Rules**:
- `line_1_address` is required (no PO boxes for garaging address)
- `municipality_name` is required
- `state_code` must exist in State reference table
- `postal_code` must be valid 5-digit or 9-digit ZIP code format
- `country_code` must be valid ISO 3166-1 alpha-3 code
- Garaging address must be physical location (no PO boxes)

**State Transitions**: Not applicable (uses temporal validity through begin_date/end_date)

---

### 2.2 ACCOUNT & PRODUCT ENTITIES

#### 2.2.1 Account

**Description**: Represents the customer relationship container that holds one or more Agreements (Policies). Links Party to their insurance contracts through Account Party Role relationships. The Account entity enables multi-policy management and cross-policy operations.

**Primary Key**: `account_identifier` (UUID)

**Key Attributes**:
- `account_identifier` (UUID) - Unique identifier
- `account_type_code` (VARCHAR 50) - Type: INSURED_ACCOUNT, PRODUCER_ACCOUNT, etc.
- `account_name` (VARCHAR 255) - Display name for the account
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Links to Party through Account Party Role (many-to-many with roles)
- Links to Agreement through Account Agreement (many-to-many)
- Links to multiple Policies through Agreement relationship

**Validation Rules**:
- `account_type_code` must be valid code from reference data
- Account must have at least one Party with role CUSTOMER
- Account name typically derived from primary Party name

**State Transitions**: Not applicable

---

#### 2.2.2 Product

**Description**: Represents the insurance offering (e.g., "Personal Auto Insurance"). Defines the line of business and licensed product name. Agreements reference Product to indicate what insurance product is being sold.

**Primary Key**: `product_identifier` (UUID)

**Key Attributes**:
- `product_identifier` (UUID) - Unique identifier
- `line_of_business_identifier` (UUID) - Line of business reference
- `licensed_product_name` (VARCHAR 255) - Official product name (required)
- `product_description` (TEXT) - Detailed product description
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Referenced by Agreement (many-to-one)
- Links to Coverage definitions through product configuration
- Links to Rating Table for product-specific rating

**Validation Rules**:
- `licensed_product_name` is required and must be unique
- Product must be licensed/approved in states where policies are issued
- Line of business must be PERSONAL_AUTO for this implementation

**State Transitions**: Not applicable

---

#### 2.2.3 User Account

**Description**: Extension entity for authentication and portal access. Links to Party and contains email, password hash, verification status, and login tracking. Enables portal access for policyholders to manage their insurance.

**Primary Key**: `user_account_identifier` (UUID)

**Key Attributes**:
- `user_account_identifier` (UUID) - Unique identifier
- `party_identifier` (UUID) - Foreign key to Party (required, unique)
- `email` (VARCHAR 255) - Login email (required, unique)
- `password_hash` (VARCHAR 255) - Bcrypt/Argon2 password hash (required)
- `email_verified` (BOOLEAN) - Email verification status (default: false)
- `last_login` (TIMESTAMP) - Last successful login timestamp
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Links to Party (one-to-one, required)
- Party links to Policies through Agreement Party Role

**Validation Rules**:
- `email` must be valid email format and unique across all User Accounts
- `password_hash` must be bcrypt or Argon2 hash (never store plain text)
- `party_identifier` must exist and must be unique (one user account per party)
- Email must match a Communication Identity linked to the Party
- User Account is automatically created upon successful policy binding

**State Transitions**:
- Created → Email Verified (when user confirms email)
- Active → Suspended (for security/compliance issues)
- Suspended → Active (when issue resolved)

---

### 2.3 POLICY & COVERAGE ENTITIES

#### 2.3.1 Agreement

**Description**: A legally binding contract among identified parties. Policy is a subtype of Agreement. Contains agreement type, inception date, and product reference. Serves as the parent entity for Policy and enables reinsurance and other agreement types.

**Primary Key**: `agreement_identifier` (UUID)

**Key Attributes**:
- `agreement_identifier` (UUID) - Unique identifier
- `agreement_type_code` (VARCHAR 50) - Type: POLICY, REINSURANCE, etc. (required)
- `agreement_name` (VARCHAR 255) - Agreement name/description
- `agreement_original_inception_date` (DATE) - Original inception date
- `product_identifier` (UUID) - Product reference (foreign key)
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Supertype for Policy (one-to-one through shared primary key)
- Links to Product (many-to-one)
- Links to Party through Agreement Party Role (many-to-many with roles and temporal validity)
- Links to Account through Account Agreement (many-to-many)
- Links to Assessment through Agreement Assessment

**Validation Rules**:
- `agreement_type_code` must be valid code (POLICY for insurance policies)
- `product_identifier` must exist in Product table
- `agreement_original_inception_date` must not be in the future
- Agreement must have at least one Party with role INSURED

**State Transitions**: Not applicable (state transitions tracked in Policy subtype)

---

#### 2.3.2 Policy

**Description**: A subtype of Agreement representing an insurance contract. Contains policy number, effective date, expiration date, status (QUOTED, BINDING, BOUND, ACTIVE, CANCELLED), and geographic jurisdiction. A quote is represented as a Policy with status='QUOTED', which transitions to BOUND upon payment and binding.

**Primary Key**: `policy_identifier` (UUID, references agreement.agreement_identifier)

**Key Attributes**:
- `policy_identifier` (UUID) - Foreign key to Agreement (is-a relationship)
- `policy_number` (VARCHAR 50) - Unique policy/quote number (required, unique)
- `effective_date` (DATE) - Policy effective date (required)
- `expiration_date` (DATE) - Policy expiration date (required)
- `status_code` (VARCHAR 50) - Current status (required)
- `geographic_location_identifier` (UUID) - Jurisdiction location
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Subtype of Agreement (is-a relationship via foreign key)
- Links to Geographic Location for jurisdiction
- Links to Policy Coverage Detail (one-to-many)
- Links to Policy Amount (one-to-many)
- Links to Policy Event (one-to-many)
- Links to Payment (one-to-many)
- Links to Document (one-to-many)
- Links to Claim (one-to-many)

**Validation Rules**:
- `policy_identifier` must exist in Agreement table
- `policy_number` must be unique across all policies
- `effective_date` must not be more than 60 days in the past (for new business)
- `expiration_date` must be after `effective_date`
- Policy term must be 6 or 12 months for auto insurance
- `status_code` must be valid: QUOTED, BINDING, BOUND, ACTIVE, CANCELLED, EXPIRED
- Status transitions must follow valid flow (see State Transitions)
- Quoted policies expire after 30 days if not bound

**State Transitions**:
```
QUOTED → BINDING → BOUND → ACTIVE
                              ↓
                          CANCELLED
                              ↓
                          EXPIRED
```
- **QUOTED**: Quote generated, awaiting customer decision (expires in 30 days)
- **BINDING**: Customer submitted payment, transaction processing
- **BOUND**: Payment successful, policy purchased, awaiting effective date
- **ACTIVE**: Policy effective date reached, coverage in force
- **CANCELLED**: Policy terminated before expiration
- **EXPIRED**: Policy reached expiration date

---

#### 2.3.3 Policy Coverage Detail

**Description**: Links a Policy to specific Coverage provisions for specific Insurable Objects (Vehicles). Contains effective dates, coverage descriptions, and inclusion/exclusion indicators. This is the central entity where coverage is applied to specific vehicles with specific limits and deductibles.

**Primary Key**: `policy_coverage_detail_identifier` (UUID)

**Key Attributes**:
- `policy_coverage_detail_identifier` (UUID) - Unique identifier
- `effective_date` (DATE) - Coverage effective date (required)
- `policy_identifier` (UUID) - Policy reference (required)
- `coverage_part_code` (VARCHAR 50) - Coverage part reference (required)
- `coverage_identifier` (UUID) - Coverage reference (required)
- `insurable_object_identifier` (UUID) - Vehicle reference (required)
- `expiration_date` (DATE) - Coverage expiration date
- `coverage_inclusion_exclusion_code` (VARCHAR 50) - Inclusion/exclusion indicator
- `coverage_description` (TEXT) - Coverage description
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Links to Policy (many-to-one)
- Links to Coverage Part (many-to-one)
- Links to Coverage (many-to-one)
- Links to Insurable Object/Vehicle (many-to-one)
- Links to Policy Limit (one-to-many)
- Links to Policy Deductible (one-to-many)
- Links to Policy Amount (one-to-many, for coverage-specific premium)

**Validation Rules**:
- `effective_date` must be within Policy effective/expiration dates
- `expiration_date` must be after `effective_date` when present
- `expiration_date` must not exceed Policy expiration date
- Coverage Part and Coverage must be compatible
- Insurable Object must be linked to the Policy through Party relationships
- Liability coverage is mandatory for all policies
- Collision and Comprehensive coverage require deductibles

**State Transitions**: Follows Policy lifecycle with mid-term endorsement support (out of scope for MVP)

---

#### 2.3.4 Policy Limit

**Description**: Defines maximum amounts the insurer will pay under a coverage. Associated with Policy Coverage Detail. Contains limit type (per person, per accident, property damage), basis code, and limit value following OMG pattern for coverage limits.

**Primary Key**: `policy_limit_identifier` (UUID)

**Key Attributes**:
- `policy_limit_identifier` (UUID) - Unique identifier
- `policy_coverage_detail_identifier` (UUID) - Coverage detail reference (required)
- `effective_date` (DATE) - Limit effective date (required)
- `limit_type_code` (VARCHAR 50) - Limit type (required)
- `limit_basis_code` (VARCHAR 50) - Limit basis (per occurrence, aggregate, etc.)
- `limit_value` (DECIMAL 15,2) - Limit amount (required)
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Links to Policy Coverage Detail (many-to-one)
- Inherits Policy relationship through Coverage Detail

**Validation Rules**:
- `limit_type_code` must be valid: PER_PERSON, PER_ACCIDENT, PROPERTY_DAMAGE, AGGREGATE, etc.
- `limit_value` must be positive
- Liability limits must meet state minimum requirements
  - Typical minimums: 25/50/25 (25k per person, 50k per accident, 25k property damage)
- Split limits or Combined Single Limit (CSL) patterns supported
- Physical damage limits cannot exceed vehicle value

**State Transitions**: Not applicable (immutable once set, changes create new records)

---

#### 2.3.5 Policy Deductible

**Description**: Defines amounts the insured must pay before coverage applies. Associated with Policy Coverage Detail. Contains deductible type (collision, comprehensive), basis code, and deductible value following OMG pattern for coverage deductibles.

**Primary Key**: `policy_deductible_identifier` (UUID)

**Key Attributes**:
- `policy_deductible_identifier` (UUID) - Unique identifier
- `policy_coverage_detail_identifier` (UUID) - Coverage detail reference (required)
- `effective_date` (DATE) - Deductible effective date (required)
- `deductible_type_code` (VARCHAR 50) - Deductible type (required)
- `deductible_basis_code` (VARCHAR 50) - Deductible basis
- `deductible_value` (DECIMAL 15,2) - Deductible amount (required)
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Links to Policy Coverage Detail (many-to-one)
- Inherits Policy relationship through Coverage Detail

**Validation Rules**:
- `deductible_type_code` must be valid: COLLISION, COMPREHENSIVE, etc.
- `deductible_value` must be positive
- Standard deductible values: 250, 500, 1000 (user selectable)
- Collision and Comprehensive coverage require deductibles
- Higher deductibles result in lower premiums (inverse relationship)

**State Transitions**: Not applicable (immutable once set, changes create new records)

---

#### 2.3.6 Policy Amount (Money)

**Description**: Represents monetary values associated with policies including premiums, taxes, fees, and surcharges. Contains amount type code, earning periods, insurance type (direct/assumed/ceded), and amount value. Used for rating, billing, and financial reporting following OMG Money pattern.

**Primary Key**: `policy_amount_identifier` (UUID)

**Key Attributes**:
- `policy_amount_identifier` (UUID) - Unique identifier
- `policy_identifier` (UUID) - Policy reference (required)
- `policy_coverage_detail_identifier` (UUID) - Coverage detail reference (nullable)
- `insurable_object_identifier` (UUID) - Vehicle reference (nullable)
- `geographic_location_identifier` (UUID) - Location reference (nullable)
- `effective_date` (DATE) - Amount effective date (required)
- `earning_begin_date` (DATE) - Earning period start
- `earning_end_date` (DATE) - Earning period end
- `insurance_type_code` (VARCHAR 50) - Insurance type (required)
- `amount_type_code` (VARCHAR 50) - Amount classification (required)
- `policy_amount` (DECIMAL 15,2) - Monetary amount (required)
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Links to Policy (many-to-one)
- Links to Policy Coverage Detail (many-to-one, optional for policy-level amounts)
- Links to Insurable Object (many-to-one, optional for vehicle-specific amounts)
- Links to Geographic Location (many-to-one, optional for location-based amounts)

**Validation Rules**:
- `insurance_type_code` must be valid: DIRECT, ASSUMED, CEDED (use DIRECT for primary insurance)
- `amount_type_code` must be valid: PREMIUM, TAX, FEE, SURCHARGE, DISCOUNT
- `policy_amount` can be positive (charges) or negative (credits/discounts)
- Total premium must be positive (sum of all PREMIUM amounts)
- State taxes typically 2-4% of premium
- Policy fees typically $10-$25 flat fee

**State Transitions**: Not applicable (amounts are immutable, recalculation creates new records)

---

#### 2.3.7 Event

**Description**: Represents significant occurrences in the system. Base entity for Policy Event and Claim Event subtypes. Tracks policy lifecycle events and claim lifecycle events with event dates, effective dates, and event type codes following OMG Event pattern.

**Primary Key**: `event_identifier` (UUID)

**Key Attributes**:
- `event_identifier` (UUID) - Unique identifier
- `created_at` (TIMESTAMP) - Record creation timestamp

**Relationships**:
- Supertype for Policy Event (one-to-one)
- Supertype for Claim Event (one-to-one)
- Provides audit trail for all significant system events

**Validation Rules**:
- Event must have corresponding subtype record (Policy Event or Claim Event)
- Events are immutable once created (audit trail integrity)

**State Transitions**: Not applicable (events are point-in-time occurrences)

---

#### 2.3.8 Policy Event

**Description**: Subtype of Event tracking policy lifecycle events (quote creation, binding, endorsements, renewals, cancellations) with event dates, effective dates, and event type codes. Provides complete audit trail for policy changes.

**Primary Key**: `event_identifier` (UUID, references event.event_identifier)

**Key Attributes**:
- `event_identifier` (UUID) - Foreign key to Event (is-a relationship)
- `event_date` (DATE) - Date event occurred (required)
- `effective_date` (DATE) - Date event takes effect (required)
- `event_type_code` (VARCHAR 50) - Event classification (required)
- `event_sub_type_code` (VARCHAR 50) - Event sub-classification
- `policy_identifier` (UUID) - Policy reference (required)
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Subtype of Event (is-a relationship)
- Links to Policy (many-to-one)

**Validation Rules**:
- `event_identifier` must exist in Event table
- `event_type_code` must be valid: NEW_BUSINESS, QUOTE, BINDING, ENDORSEMENT, RENEWAL, CANCEL, REINSTATE
- `event_date` must not be in the future
- `effective_date` should align with policy effective dates for most events
- Events must be created in chronological order by effective_date

**State Transitions**: Not applicable (events are immutable records)

**Event Types for Quote-to-Policy Flow**:
- **QUOTE**: Quote generated (status = QUOTED)
- **BINDING**: Payment submitted (status = BINDING)
- **NEW_BUSINESS**: Policy bound (status = BOUND)
- **ACTIVATION**: Policy activated (status = ACTIVE, on effective_date)

---

#### 2.3.9 Assessment

**Description**: Represents risk evaluation and underwriting assessments. Contains assessment descriptions, reasons, begin/end dates. Links to Agreement through Agreement Assessment relationship. Used for quote evaluation and underwriting decisions.

**Primary Key**: `assessment_identifier` (UUID)

**Key Attributes**:
- `assessment_identifier` (UUID) - Unique identifier
- `begin_date` (TIMESTAMP) - Assessment validity start (required)
- `end_date` (TIMESTAMP) - Assessment validity end
- `assessment_description` (TEXT) - Assessment description
- `assessment_reason_description` (TEXT) - Reason for assessment
- `created_at` (TIMESTAMP) - Record creation timestamp

**Relationships**:
- Links to Agreement through Agreement Assessment (many-to-many)
- Links to Assessment Result (one-to-many)

**Validation Rules**:
- `begin_date` is required
- `end_date` must be after `begin_date` when present
- Assessment should be created during quote generation
- Assessment results track risk scoring and underwriting decisions

**State Transitions**: Not applicable (assessments have temporal validity)

---

#### 2.3.10 Coverage Part

**Description**: Reference entity organizing coverages by major coverage categories for auto insurance (LIABILITY, COLLISION, COMPREHENSIVE, PIP, UM, UIM) following OMG coverage structure. Coverage parts represent the major divisions of coverage in an insurance policy.

**Primary Key**: `coverage_part_code` (VARCHAR 50)

**Key Attributes**:
- `coverage_part_code` (VARCHAR 50) - Unique code identifier
- `coverage_part_name` (VARCHAR 255) - Display name (required)

**Relationships**:
- Referenced by Coverage (one-to-many)
- Referenced by Policy Coverage Detail (many-to-one)
- Referenced by Policy Coverage Part (links to Policy)

**Validation Rules**:
- Code must be unique and immutable
- Pre-populated reference data

**Standard Coverage Parts for Auto Insurance**:
- **LIABILITY**: Third-party liability coverage (bodily injury and property damage)
- **COLLISION**: Coverage for vehicle damage from collisions
- **COMPREHENSIVE**: Coverage for vehicle damage from non-collision events (theft, vandalism, weather)
- **PIP**: Personal Injury Protection (no-fault medical coverage, required in some states)
- **UM**: Uninsured Motorist coverage
- **UIM**: Underinsured Motorist coverage

**State Transitions**: Not applicable (reference data)

---

#### 2.3.11 Coverage Type

**Description**: Reference entity defining specific types of coverage offerings. Links to Coverage entity and provides categorization for coverage definitions.

**Primary Key**: `coverage_type_identifier` (UUID)

**Key Attributes**:
- `coverage_type_identifier` (UUID) - Unique identifier
- `coverage_type_name` (VARCHAR 255) - Coverage type name (required)
- `coverage_type_description` (TEXT) - Detailed description

**Relationships**:
- Referenced by Coverage (one-to-many)

**Validation Rules**:
- Coverage type name must be unique
- Pre-populated reference data aligned with industry standards

**State Transitions**: Not applicable (reference data)

---

#### 2.3.12 Coverage Group

**Description**: Reference entity for grouping related coverages for product configuration and management purposes.

**Primary Key**: `coverage_group_identifier` (UUID)

**Key Attributes**:
- `coverage_group_identifier` (UUID) - Unique identifier
- `coverage_group_name` (VARCHAR 255) - Group name (required)
- `coverage_group_description` (TEXT) - Detailed description

**Relationships**:
- Referenced by Coverage (one-to-many)

**Validation Rules**:
- Coverage group name must be unique
- Optional grouping for product management

**State Transitions**: Not applicable (reference data)

---

#### 2.3.13 Coverage

**Description**: Represents an insurance coverage type (e.g., Liability, Collision, Comprehensive). Organized by Coverage Part (e.g., LIABILITY, COLLISION) and Coverage Type. Defines what protection is offered in the insurance product.

**Primary Key**: `coverage_identifier` (UUID)

**Key Attributes**:
- `coverage_identifier` (UUID) - Unique identifier
- `coverage_part_code` (VARCHAR 50) - Coverage part reference (required)
- `coverage_type_identifier` (UUID) - Coverage type reference (required)
- `coverage_name` (VARCHAR 255) - Coverage name (required)
- `coverage_description` (TEXT) - Detailed description
- `coverage_group_identifier` (UUID) - Coverage group reference
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Links to Coverage Part (many-to-one)
- Links to Coverage Type (many-to-one)
- Links to Coverage Group (many-to-one, optional)
- Referenced by Policy Coverage Detail (one-to-many)

**Validation Rules**:
- Coverage name must be unique within Coverage Part
- Coverage must be compatible with Coverage Part classification
- Liability coverage is mandatory for all auto policies
- Physical damage coverages (Collision, Comprehensive) are optional

**State Transitions**: Not applicable (master data)

---

#### 2.3.14 Document

**Description**: Represents policy documents, ID cards, and declarations. Contains document type, file location, and creation timestamp. Links to Policy for document management and enables user portal access to policy documentation.

**Primary Key**: `document_identifier` (UUID)

**Key Attributes**:
- `document_identifier` (UUID) - Unique identifier
- `policy_identifier` (UUID) - Policy reference (required)
- `document_type` (VARCHAR 50) - Document classification (required)
- `file_url` (VARCHAR 500) - File storage location (required)
- `created_at` (TIMESTAMP) - Record creation timestamp

**Relationships**:
- Links to Policy (many-to-one)

**Validation Rules**:
- `document_type` must be valid: POLICY_DOC, ID_CARD, DECLARATION, ENDORSEMENT
- `file_url` must be valid URL or file path
- Documents generated automatically upon policy binding
- ID cards generated for each vehicle on the policy

**Document Types**:
- **POLICY_DOC**: Full policy documentation PDF
- **ID_CARD**: Insurance ID card (per vehicle)
- **DECLARATION**: Policy declarations page
- **ENDORSEMENT**: Policy amendments (future)

**State Transitions**: Not applicable (documents are immutable once created)

---

### 2.4 INSURABLE OBJECT ENTITIES

#### 2.4.1 Insurable Object

**Description**: Represents items that may be included or excluded from insurance coverage. For auto insurance, this is subtyped as Vehicle. Base entity contains common attributes for all insurable objects including geographic location reference.

**Primary Key**: `insurable_object_identifier` (UUID)

**Key Attributes**:
- `insurable_object_identifier` (UUID) - Unique identifier
- `insurable_object_type_code` (VARCHAR 50) - Type classification (required)
- `geographic_location_identifier` (UUID) - Location reference
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Supertype for Vehicle (one-to-one through shared primary key)
- Links to Geographic Location (many-to-one)
- Links to Party through Insurable Object Party Role (many-to-many with roles)
- Referenced by Policy Coverage Detail (one-to-many)
- Referenced by Policy Amount (one-to-many)
- Referenced by Claim (one-to-many)

**Validation Rules**:
- `insurable_object_type_code` must be valid: VEHICLE, STRUCTURE, etc. (use VEHICLE for auto insurance)
- Must have corresponding subtype record (Vehicle)
- Must be linked to Party with role OWNER

**State Transitions**: Not applicable

---

#### 2.4.2 Vehicle

**Description**: A subtype of Insurable Object representing automobiles. Contains vehicle identification number (VIN), make, model, year, and other vehicle-specific attributes defined in the OMG standard. Enriched with data from simulated third-party vehicle information services.

**Primary Key**: `insurable_object_identifier` (UUID, references insurable_object.insurable_object_identifier)

**Key Attributes**:
- `insurable_object_identifier` (UUID) - Foreign key to Insurable Object (is-a relationship)
- `vehicle_identification_number` (VARCHAR 17) - VIN (required, unique)
- `vehicle_make_name` (VARCHAR 100) - Manufacturer name (required)
- `vehicle_model_name` (VARCHAR 100) - Model name (required)
- `vehicle_model_year` (INTEGER) - Model year (required)
- `vehicle_driving_wheel_quantity` (INTEGER) - Number of wheels
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Subtype of Insurable Object (is-a relationship via foreign key)
- Inherits all Insurable Object relationships

**Validation Rules**:
- `insurable_object_identifier` must exist in Insurable Object table
- `vehicle_identification_number` must be unique and exactly 17 characters
- VIN format must be alphanumeric excluding I, O, Q
- VIN check digit validation (ISO 3779 standard)
- `vehicle_model_year` must be between 1900 and current year + 1
- Vehicle cannot be older than 30 years for new business (configurable)
- Vehicle must be enriched with data from simulated VIN decoder service (market value, safety ratings)

**VIN Decoder Enrichment** (Simulated):
- Year, make, model, body style, engine type, trim level
- Market value estimate (from simulated valuation service)
- Safety ratings (NHTSA, IIHS scores from simulated service)
- Anti-theft device presence
- Safety features inventory

**State Transitions**: Not applicable

---

### 2.5 RATING ENGINE ENTITIES

#### 2.5.1 Rating Factor

**Description**: Represents a variable used in premium calculation (e.g., driver age, vehicle year, ZIP code risk score). Contains factor name, factor type, factor value, and weight/multiplier applied to base premium during rating calculation.

**Primary Key**: `rating_factor_identifier` (UUID - implied)

**Key Attributes**:
- `rating_factor_identifier` (UUID) - Unique identifier
- `policy_identifier` (UUID) - Policy reference
- `factor_name` (VARCHAR 100) - Factor name (e.g., "Driver Age", "Vehicle Year")
- `factor_type` (VARCHAR 50) - Classification: VEHICLE, DRIVER, LOCATION, COVERAGE
- `factor_value` (VARCHAR 100) - Factor value (e.g., "25", "2020", "Urban")
- `weight_multiplier` (DECIMAL 10,4) - Multiplier applied to premium
- `created_at` (TIMESTAMP) - Record creation timestamp

**Relationships**:
- Links to Policy (many-to-one)
- Links to Premium Calculation (many-to-one)

**Validation Rules**:
- Factor name must match defined rating factors
- Weight multiplier must be positive (typically 0.5 to 3.0)
- Factor values must be within valid ranges

**Factor Categories**:
- **Vehicle Factors**: Year, make, model, safety rating, anti-theft, market value, ISO symbol
- **Driver Factors**: Age, gender, marital status, years licensed, credit score
- **Location Factors**: ZIP code territory, urban/suburban/rural, state, theft rate
- **Coverage Factors**: Liability limits, deductible amounts, coverage selections

**State Transitions**: Not applicable (rating factors are calculation inputs)

---

#### 2.5.2 Rating Table

**Description**: Contains lookup tables for base rates and factor multipliers organized by coverage type, state, and effective date range. Examples: liability base rates by age group, collision rates by vehicle symbol, comprehensive rates by territory.

**Primary Key**: `rating_table_identifier` (UUID - implied)

**Key Attributes**:
- `rating_table_identifier` (UUID) - Unique identifier
- `table_name` (VARCHAR 100) - Table name
- `coverage_part_code` (VARCHAR 50) - Coverage part reference
- `state_code` (VARCHAR 2) - State code
- `effective_date` (DATE) - Table effective date
- `expiration_date` (DATE) - Table expiration date
- `table_data` (JSONB) - Lookup table data structure
- `created_at` (TIMESTAMP) - Record creation timestamp

**Relationships**:
- Referenced by rating calculation logic
- Links to Coverage Part (many-to-one)
- Links to State (many-to-one)

**Validation Rules**:
- Rating tables must have non-overlapping effective date ranges for same coverage/state
- Table data must conform to expected structure
- Base rates must be positive
- Effective date must be before expiration date

**Example Rating Tables**:
- Base rates by coverage and age group
- Vehicle symbol multipliers by make/model
- Territory factors by ZIP code
- Deductible factors by coverage type

**State Transitions**: Not applicable (reference data with temporal validity)

---

#### 2.5.3 Discount

**Description**: Represents premium reductions applied for favorable characteristics. Contains discount code (MULTI_CAR, GOOD_DRIVER, LOW_MILEAGE), discount percentage, eligibility criteria, and applicable coverage parts.

**Primary Key**: `discount_identifier` (UUID - implied)

**Key Attributes**:
- `discount_identifier` (UUID) - Unique identifier
- `policy_identifier` (UUID) - Policy reference
- `discount_code` (VARCHAR 50) - Discount type code
- `discount_name` (VARCHAR 100) - Discount display name
- `discount_percentage` (DECIMAL 5,2) - Percentage discount (0-100)
- `discount_amount` (DECIMAL 10,2) - Dollar amount discount
- `eligibility_criteria` (TEXT) - Eligibility description
- `coverage_part_code` (VARCHAR 50) - Applicable coverage part
- `created_at` (TIMESTAMP) - Record creation timestamp

**Relationships**:
- Links to Policy (many-to-one)
- Links to Premium Calculation (many-to-one)
- Links to Coverage Part (many-to-one, for coverage-specific discounts)

**Validation Rules**:
- Discount percentage must be between 0 and 100
- Either percentage or amount is used, not both
- Total discounts capped at 50% of base premium
- Discount eligibility must be verified

**Standard Discounts** (per spec FR-062):
- **MULTI_CAR**: 10-20% for multiple vehicles on same policy
- **GOOD_DRIVER**: 15-25% for no accidents/violations 3+ years
- **DEFENSIVE_DRIVING**: 5-10% for course completion
- **LOW_MILEAGE**: 5-15% for <7,500 miles/year
- **HOMEOWNER**: 5-10% for homeownership
- **ADVANCE_QUOTE**: 5% for quote 7+ days before effective date
- **PAPERLESS**: 3-5% for electronic documents and payment

**State Transitions**: Not applicable (discounts applied during rating calculation)

---

#### 2.5.4 Surcharge

**Description**: Represents premium increases applied for risk factors. Contains surcharge code (YOUNG_DRIVER, AT_FAULT_ACCIDENT, VIOLATION), surcharge percentage or flat amount, duration, and applicable coverage parts.

**Primary Key**: `surcharge_identifier` (UUID - implied)

**Key Attributes**:
- `surcharge_identifier` (UUID) - Unique identifier
- `policy_identifier` (UUID) - Policy reference
- `surcharge_code` (VARCHAR 50) - Surcharge type code
- `surcharge_name` (VARCHAR 100) - Surcharge display name
- `surcharge_percentage` (DECIMAL 5,2) - Percentage increase
- `surcharge_amount` (DECIMAL 10,2) - Dollar amount increase
- `duration_years` (INTEGER) - Surcharge duration (years on record)
- `coverage_part_code` (VARCHAR 50) - Applicable coverage part
- `created_at` (TIMESTAMP) - Record creation timestamp

**Relationships**:
- Links to Policy (many-to-one)
- Links to Premium Calculation (many-to-one)
- Links to Coverage Part (many-to-one, for coverage-specific surcharges)

**Validation Rules**:
- Surcharge percentage must be positive
- Either percentage or amount is used, not both
- Duration must be reasonable (typically 3-5 years)
- Surcharge must have documented basis

**Standard Surcharges** (per spec FR-063):
- **YOUNG_DRIVER**: +30-100% for drivers under 25
- **SENIOR_DRIVER**: +10-30% for drivers over 75
- **AT_FAULT_ACCIDENT**: +20-40% per accident for 3 years
- **MOVING_VIOLATION**: +10-30% per violation for 3 years
- **DUI**: +50-100% for 5 years
- **LAPSED_COVERAGE**: +15-25% for coverage gap >30 days
- **HIGH_PERFORMANCE**: +20-50% for sports/performance vehicles
- **EXOTIC_LUXURY**: +25-75% for exotic/luxury vehicles

**State Transitions**: Not applicable (surcharges applied during rating calculation)

---

#### 2.5.5 Premium Calculation

**Description**: Stores the complete premium calculation audit trail including all rating factors evaluated, discounts applied, surcharges applied, coverage subtotals, taxes, and total premium. Links to Policy for transparency and recalculation purposes.

**Primary Key**: `premium_calculation_identifier` (UUID - implied)

**Key Attributes**:
- `premium_calculation_identifier` (UUID) - Unique identifier
- `policy_identifier` (UUID) - Policy reference (required)
- `calculation_date` (TIMESTAMP) - When calculation performed (required)
- `base_premium` (DECIMAL 10,2) - Base premium before adjustments
- `total_discounts` (DECIMAL 10,2) - Total discount amount
- `total_surcharges` (DECIMAL 10,2) - Total surcharge amount
- `subtotal_premium` (DECIMAL 10,2) - Premium after discounts/surcharges
- `total_taxes` (DECIMAL 10,2) - State taxes and fees
- `total_premium` (DECIMAL 10,2) - Final premium amount (required)
- `calculation_details` (JSONB) - Full calculation breakdown
- `created_at` (TIMESTAMP) - Record creation timestamp

**Relationships**:
- Links to Policy (many-to-one)
- Links to Rating Factor (one-to-many)
- Links to Discount (one-to-many)
- Links to Surcharge (one-to-many)

**Validation Rules**:
- Total premium must equal: base + surcharges - discounts + taxes
- All monetary values must be non-negative except discounts
- Calculation details must include itemized breakdown
- Calculation must be reproducible from stored factors

**Calculation Formula** (per spec):
```
Base Premium (by coverage)
× Vehicle Factor
× Driver Factor
× Location Factor
× Coverage Factor
= Adjusted Premium

Adjusted Premium
× (1 - Total Discount %)
× (1 + Total Surcharge %)
+ Taxes + Fees
= Total Premium
```

**Transparency Requirements** (per spec FR-067):
- Itemized premium breakdown showing all components
- Each discount and surcharge identified with amount
- Coverage-specific subtotals
- State taxes and fees separately identified
- User can see impact of changing coverage selections in real-time

**State Transitions**: Not applicable (calculation is immutable, recalculation creates new record)

---

### 2.6 CLAIMS ENTITIES

#### 2.6.1 Claim

**Description**: OMG core entity representing a request for payment or service under an insurance policy. Contains claim number, incident date, incident location, incident description, claim status (submitted, under review, approved, denied, closed), estimated claim amount, and claim type. Links to Policy and Insurable Object (Vehicle).

**Primary Key**: `claim_identifier` (UUID - implied)

**Key Attributes**:
- `claim_identifier` (UUID) - Unique identifier
- `claim_number` (VARCHAR 50) - Unique claim reference number (required)
- `policy_identifier` (UUID) - Policy reference (required)
- `insurable_object_identifier` (UUID) - Vehicle reference (required)
- `incident_date` (DATE) - Date of loss/incident (required)
- `incident_time` (TIME) - Time of loss/incident
- `incident_location` (VARCHAR 255) - Where incident occurred (required)
- `incident_description` (TEXT) - Description of what happened (required)
- `claim_type_code` (VARCHAR 50) - Type: COLLISION, COMPREHENSIVE, LIABILITY, etc.
- `claim_status_code` (VARCHAR 50) - Current status (required)
- `estimated_claim_amount` (DECIMAL 15,2) - Estimated loss amount
- `reported_date` (DATE) - Date claim reported
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Links to Policy (many-to-one)
- Links to Insurable Object/Vehicle (many-to-one)
- Links to Party through Claim Party Role (many-to-many with roles)
- Links to Claim Event (one-to-many)
- Links to Claim Attachment (one-to-many, for photos/documents)

**Validation Rules**:
- `claim_number` must be unique across all claims
- `incident_date` must be within policy effective/expiration dates
- `incident_date` must not be in the future
- `incident_location` is required
- `incident_description` must be at least 20 characters
- Claim type must match coverage on policy
- Vehicle must be covered under the policy
- Claims can only be filed by policyholder or authorized users

**State Transitions**:
```
SUBMITTED → UNDER_REVIEW → APPROVED/DENIED → CLOSED
```
- **SUBMITTED**: Claim filed by user through portal
- **UNDER_REVIEW**: Claim being evaluated (out of scope for MVP)
- **APPROVED**: Claim approved for payment (out of scope for MVP)
- **DENIED**: Claim denied (out of scope for MVP)
- **CLOSED**: Claim finalized (out of scope for MVP)

**Note**: Per spec, claims filing is IN SCOPE (users can submit claims through portal), but claims processing/adjudication is OUT OF SCOPE for MVP.

---

#### 2.6.2 Claim Party Role

**Description**: Links Party to Claim with specific roles (claimant, injured party, witness, adjuster). Follows OMG Party Role pattern for flexible claim participant tracking with temporal validity.

**Primary Key**: Composite (claim_identifier, party_role_code, party_identifier)

**Key Attributes**:
- `claim_identifier` (UUID) - Claim reference (required)
- `party_role_code` (VARCHAR 50) - Role code (required)
- `party_identifier` (UUID) - Party reference (required)
- `effective_date` (DATE) - Role effective date (required)
- `expiration_date` (DATE) - Role expiration date

**Relationships**:
- Links to Claim (many-to-one)
- Links to Party Role reference table (many-to-one)
- Links to Party (many-to-one)

**Validation Rules**:
- Role code must be valid claim-related role
- Party must exist
- Effective date must not be in the future
- Expiration date must be after effective date when present

**Claim Roles**:
- **CLAIMANT**: Person filing the claim
- **POLICYHOLDER**: Policy owner (may differ from claimant)
- **INJURED_PARTY**: Person injured in incident
- **WITNESS**: Witness to the incident
- **ADJUSTER**: Claims adjuster (out of scope for MVP)
- **OTHER_DRIVER**: Other driver involved

**State Transitions**: Not applicable (uses temporal validity)

---

#### 2.6.3 Claim Event

**Description**: Subtype of Event tracking claim lifecycle events (submission, status changes, payments, closure) with event dates and timestamps. Provides audit trail for claim processing following OMG Event pattern.

**Primary Key**: `event_identifier` (UUID, references event.event_identifier)

**Key Attributes**:
- `event_identifier` (UUID) - Foreign key to Event (is-a relationship)
- `event_date` (DATE) - Date event occurred (required)
- `event_type_code` (VARCHAR 50) - Event classification (required)
- `event_sub_type_code` (VARCHAR 50) - Event sub-classification
- `claim_identifier` (UUID) - Claim reference (required)
- `event_description` (TEXT) - Event description
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Subtype of Event (is-a relationship)
- Links to Claim (many-to-one)

**Validation Rules**:
- `event_identifier` must exist in Event table
- `event_type_code` must be valid claim event type
- `event_date` must not be in the future
- Events must be created in chronological order

**Claim Event Types**:
- **CLAIM_SUBMITTED**: Initial claim submission through portal
- **STATUS_CHANGE**: Claim status updated
- **DOCUMENT_UPLOADED**: Photo or document added
- **CLAIM_ASSIGNED**: Assigned to adjuster (future)
- **PAYMENT_ISSUED**: Claim payment made (future)
- **CLAIM_CLOSED**: Claim finalized (future)

**State Transitions**: Not applicable (events are immutable records)

---

### 2.7 PAYMENT & DOCUMENTS ENTITIES

#### 2.7.1 Payment

**Description**: Extension of Money concept representing payment transactions. Contains payment amount, method data (tokenized), status (pending, completed, failed), transaction ID, and payment date. Links to Policy and Party for billing and transaction tracking.

**Primary Key**: `payment_identifier` (UUID)

**Key Attributes**:
- `payment_identifier` (UUID) - Unique identifier
- `policy_identifier` (UUID) - Policy reference (required)
- `party_identifier` (UUID) - Payer reference (required)
- `amount` (DECIMAL 15,2) - Payment amount (required)
- `payment_method_data` (JSONB) - Tokenized payment info (required)
- `status` (VARCHAR 50) - Payment status (required)
- `transaction_id` (VARCHAR 100) - External transaction reference
- `payment_date` (TIMESTAMP) - When payment processed
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record modification timestamp

**Relationships**:
- Links to Policy (many-to-one)
- Links to Party (many-to-one)

**Validation Rules**:
- `amount` must be positive
- `status` must be valid: PENDING, COMPLETED, FAILED, REFUNDED
- `payment_method_data` must be encrypted/tokenized (never store raw payment card data)
- Payment amount should match policy premium for binding
- Successful payment (COMPLETED) required before policy can transition to BOUND status

**Payment Method Data Structure** (tokenized, stored in JSONB):
```json
{
  "payment_type": "CREDIT_CARD | BANK_ACCOUNT",
  "token": "tok_mock_...",
  "last_four": "4242",
  "card_type": "Visa | Mastercard | ...",
  "expiry_month": 12,
  "expiry_year": 2025
}
```

**State Transitions**:
```
PENDING → COMPLETED | FAILED
COMPLETED → REFUNDED (future)
```
- **PENDING**: Payment submitted, processing
- **COMPLETED**: Payment successful
- **FAILED**: Payment declined or error
- **REFUNDED**: Payment reversed (future functionality)

**Note**: Per spec, payment processing uses mock payment gateway that simulates realistic validation and responses without actual financial transactions.

---

## 3. Entity Categories

### 3.1 Core Party Entities

These entities manage persons, organizations, and their contact information following OMG Party Subject Area:

1. **Party** - Central entity for all persons/organizations
2. **Person** - Subtype of Party for individuals
3. **Communication Identity** - Contact methods (email, phone, mobile)
4. **Geographic Location** - Jurisdictional and physical locations
5. **Location Address** - Physical addresses with standard components

**Key Pattern**: Party Role pattern connects Party to all major entities (Agreement, Account, Insurable Object, Claim) with role context and temporal validity.

---

### 3.2 Account & Product Entities

These entities manage customer relationships and product offerings:

1. **Account** - Customer relationship container
2. **Product** - Insurance product offerings
3. **User Account** - Authentication and portal access extension

**Key Pattern**: Account links Party to multiple Policies through Account Party Role and Account Agreement relationships.

---

### 3.3 Policy Entities

These entities form the core insurance policy structure following OMG Agreement and Policy Subject Areas:

1. **Agreement** - Base contract entity (supertype)
2. **Policy** - Insurance policy (subtype of Agreement)
3. **Policy Coverage Detail** - Links policy to coverage for specific vehicles
4. **Policy Limit** - Maximum coverage amounts
5. **Policy Deductible** - Amounts insured pays before coverage applies
6. **Policy Amount** - Premiums, taxes, fees, surcharges
7. **Event** - Base event entity (supertype)
8. **Policy Event** - Policy lifecycle events (subtype)
9. **Assessment** - Underwriting and risk assessments
10. **Coverage Part** - Coverage category reference (LIABILITY, COLLISION, etc.)
11. **Coverage Type** - Coverage type classifications
12. **Coverage Group** - Coverage groupings
13. **Coverage** - Specific coverage offerings
14. **Document** - Policy documents and ID cards

**Key Pattern**: Policy is a subtype of Agreement. Coverage is not directly linked to Policy; instead, Policy Coverage Detail acts as the association entity that links Policy, Coverage, and Insurable Object (Vehicle) with specific limits and deductibles.

---

### 3.4 Insurable Object Entities

These entities represent items being insured:

1. **Insurable Object** - Base entity for insurable items (supertype)
2. **Vehicle** - Automobiles (subtype of Insurable Object)

**Key Pattern**: Vehicle is a subtype of Insurable Object following OMG inheritance pattern. Insurable Object Party Role links vehicles to parties with roles like OWNER and DRIVER.

---

### 3.5 Rating Engine Entities

These entities support premium calculation and pricing:

1. **Rating Factor** - Variables used in premium calculation
2. **Rating Table** - Lookup tables for base rates and multipliers
3. **Discount** - Premium reductions for favorable characteristics
4. **Surcharge** - Premium increases for risk factors
5. **Premium Calculation** - Complete calculation audit trail

**Key Pattern**: Premium Calculation stores full audit trail of all factors, discounts, and surcharges applied to ensure transparency and reproducibility per regulatory requirements.

---

### 3.6 Claims Entities

These entities support claims filing and tracking:

1. **Claim** - Claims requests under policies
2. **Claim Party Role** - Links parties to claims with roles
3. **Claim Event** - Claim lifecycle events (subtype of Event)

**Key Pattern**: Claims follow OMG Party Role pattern for flexible participant tracking. Claim Event provides audit trail for claim status changes.

**Scope Note**: Claims filing is IN SCOPE for MVP (users can submit claims through portal), but claims processing/adjudication is OUT OF SCOPE.

---

### 3.7 Payment & Documents

These entities support payment processing and document management:

1. **Payment** - Payment transactions
2. **Document** - Policy documents (included in Policy Entities above)

**Key Pattern**: Payment extends OMG Money concept. Payment method data is tokenized for security (mock payment gateway for demo).

---

## 4. Relationship Diagram

### 4.1 Core Entity Relationships (ASCII)

```
                                   ┌──────────────┐
                                   │    Party     │
                                   │  (Person)    │
                                   └──────┬───────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
          ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐
          │Communication     │  │Location Address │  │  User Account    │
          │   Identity       │  │                 │  │  (Authentication)│
          └──────────────────┘  └─────────────────┘  └──────────────────┘


                    ┌─────────────────────────────────────────┐
                    │          Party Role Pattern             │
                    │  (INSURED, DRIVER, OWNER, CUSTOMER)     │
                    └──────────┬──────────────┬───────────────┘
                               │              │
                ┌──────────────▼──────┐      │
                │     Account         │      │
                │                     │      │
                └──────────┬──────────┘      │
                           │                 │
                           │  ┌──────────────▼──────────┐
                           │  │      Agreement          │
                           │  │                         │
                           │  └──────────┬──────────────┘
                           │             │
                           │             │ (is-a)
                           │             │
                           │  ┌──────────▼──────────┐
                           └─→│       Policy        │◀────────┐
                              │  (QUOTED→BOUND→     │         │
                              │   ACTIVE)           │         │
                              └──────────┬──────────┘         │
                                         │                    │
                        ┌────────────────┼────────────┐       │
                        │                │            │       │
                        ▼                ▼            ▼       │
              ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
              │Policy Coverage│  │Policy Amount │  │Policy Event  │
              │    Detail     │  │ (Premium)    │  │              │
              └───────┬───────┘  └──────────────┘  └──────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
    ┌────────┐  ┌─────────┐  ┌──────────────┐
    │Coverage│  │ Policy  │  │   Policy     │
    │        │  │ Limit   │  │ Deductible   │
    └────────┘  └─────────┘  └──────────────┘
                      │
                      ▼
              ┌──────────────┐
              │  Insurable   │
              │   Object     │
              └──────┬───────┘
                     │
                     │ (is-a)
                     │
              ┌──────▼───────┐
              │   Vehicle    │
              │  (VIN, Make, │
              │  Model, Year)│
              └──────────────┘
                     │
                     ▼
              ┌──────────────┐
              │    Claim     │
              │(Filing Only) │
              └──────────────┘


         Rating Engine Flow:

    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │Rating Factor │────→│Rating Table  │────→│ Discount     │
    │              │     │              │     │              │
    └──────────────┘     └──────────────┘     └──────────────┘
                                                       │
                                                       ▼
                                               ┌──────────────┐
                                               │ Surcharge    │
                                               │              │
                                               └──────┬───────┘
                                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │  Premium     │
                                               │ Calculation  │
                                               └──────┬───────┘
                                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │Policy Amount │
                                               │              │
                                               └──────────────┘
```

### 4.2 Key Relationship Patterns

#### Party Role Pattern

The OMG Party Role pattern creates flexible many-to-many relationships with role context:

```
Party ←→ [Party Role] ←→ Agreement
Party ←→ [Party Role] ←→ Account
Party ←→ [Party Role] ←→ Insurable Object
Party ←→ [Party Role] ←→ Claim
```

**Roles Used**:
- **INSURED**: Primary named insured on the policy
- **DRIVER**: Authorized driver of the vehicle
- **OWNER**: Legal owner of the insurable object
- **CUSTOMER**: Customer of the insurance company
- **PRODUCER**: Insurance agent or broker
- **INSURER**: Insurance company providing coverage
- **CLAIMANT**: Person filing a claim
- **INJURED_PARTY**: Person injured in an incident

#### Subtype Relationships

OMG uses inheritance patterns through foreign keys:

```
Party (supertype)
  ├─→ Person (subtype)
  └─→ Organization (subtype)

Agreement (supertype)
  └─→ Policy (subtype)

Insurable Object (supertype)
  └─→ Vehicle (subtype)

Event (supertype)
  ├─→ Policy Event (subtype)
  └─→ Claim Event (subtype)
```

#### Policy → Coverage → Vehicle Chain

Coverage is not directly linked to Policy. Instead:

```
Policy
  └─→ Policy Coverage Detail
        ├─→ Coverage (what is covered)
        ├─→ Insurable Object/Vehicle (what vehicle)
        ├─→ Policy Limit (how much coverage)
        └─→ Policy Deductible (deductible amount)
```

This pattern allows:
- Same coverage to apply to multiple vehicles with different limits
- Multiple coverages on the same vehicle
- Vehicle-specific deductibles
- Temporal tracking of coverage changes

---

## 5. OMG Compliance Notes

### 5.1 UUID Primary Keys

All OMG entities use UUID (Universally Unique Identifier) as primary keys rather than sequential integers:

- **Why**: Enables distributed system integration, prevents ID collision across systems, supports data migration/merging
- **Implementation**: PostgreSQL `UUID` data type
- **Generation**: UUID v4 (random) recommended
- **Example**: `550e8400-e29b-41d4-a716-446655440000`

### 5.2 Temporal Tracking Fields

OMG pattern includes temporal validity tracking across multiple dimensions:

**Begin/End Dates** (for relationship validity):
- `begin_date` - When relationship becomes valid
- `end_date` - When relationship ends (nullable for current relationships)
- Used in: Party Communication, Account Party Role, Agreement Party Role, Insurable Object Party Role, Location Address

**Effective/Expiration Dates** (for coverage validity):
- `effective_date` - When coverage/policy takes effect
- `expiration_date` - When coverage/policy expires
- Used in: Policy, Policy Coverage Detail, Policy Limit, Policy Deductible, Policy Amount, Rating Table

**Created/Updated Timestamps** (for audit trail):
- `created_at` - Record creation timestamp
- `updated_at` - Last modification timestamp
- Used in: All entities

**Why This Matters**:
- Supports historical reporting ("What was the policy on date X?")
- Enables mid-term endorsements (future)
- Tracks relationship changes over time
- Provides complete audit trail for regulatory compliance

### 5.3 Party Role Pattern Usage

The Party Role pattern is the cornerstone of OMG flexibility:

**Pattern Structure**:
```
Entity 1 ←→ [Entity1_Entity2_Role] ←→ Entity 2
         └→ party_role_code
         └→ begin_date, end_date
```

**Examples**:
1. **Agreement Party Role**: Links Party to Agreement with roles like INSURED, PRODUCER, INSURER
2. **Account Party Role**: Links Party to Account with roles like CUSTOMER, AGENT
3. **Insurable Object Party Role**: Links Party to Vehicle with roles like OWNER, DRIVER
4. **Claim Party Role**: Links Party to Claim with roles like CLAIMANT, INJURED_PARTY, WITNESS

**Benefits**:
- One person can have multiple roles (policyholder can also be driver and owner)
- Roles can change over time (temporal validity)
- New roles can be added without schema changes
- Supports complex multi-party scenarios

### 5.4 Subtype Relationships

OMG uses table-per-subtype inheritance pattern:

**Implementation**:
1. Supertype table contains common attributes (e.g., `party` table)
2. Subtype table uses same primary key as foreign key to supertype (e.g., `person.person_identifier` references `party.party_identifier`)
3. Subtype inherits all supertype attributes plus adds specific attributes

**Examples**:

**Party → Person/Organization**:
```sql
-- Supertype
CREATE TABLE party (
    party_identifier UUID PRIMARY KEY,
    party_name VARCHAR(255),
    party_type_code VARCHAR(50)
);

-- Subtype
CREATE TABLE person (
    person_identifier UUID PRIMARY KEY REFERENCES party(party_identifier),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date DATE
);
```

**Agreement → Policy**:
```sql
-- Supertype
CREATE TABLE agreement (
    agreement_identifier UUID PRIMARY KEY,
    agreement_type_code VARCHAR(50),
    product_identifier UUID
);

-- Subtype
CREATE TABLE policy (
    policy_identifier UUID PRIMARY KEY REFERENCES agreement(agreement_identifier),
    policy_number VARCHAR(50),
    status_code VARCHAR(50)
);
```

**Benefits**:
- Supports polymorphism (query all parties regardless of type)
- Enforces referential integrity
- Enables type-specific attributes
- Follows object-oriented design principles

### 5.5 Naming Conventions

OMG mandates specific naming conventions for attributes using **standard class words**:

**Standard Class Words**:
- **Identifier**: Unique ID (e.g., `party_identifier`, `policy_identifier`)
- **Code**: Classification code from reference data (e.g., `status_code`, `coverage_part_code`)
- **Name**: Human-readable name (e.g., `party_name`, `coverage_name`)
- **Description**: Detailed description (e.g., `coverage_description`, `event_description`)
- **Date**: Date value (e.g., `birth_date`, `effective_date`, `expiration_date`)
- **Amount**: Monetary value (e.g., `policy_amount`, `limit_value`)
- **Number**: Sequence or count (e.g., `policy_number`, `preference_sequence_number`)
- **Type**: Type classification (e.g., `party_type_code`, `coverage_type`)
- **Value**: Measured or calculated value (e.g., `limit_value`, `deductible_value`)

**Formatting Rules**:
- Business names fully spelled out in English (no abbreviations except standard acronyms)
- Words separated by underscores in database (snake_case)
- No delimiters in entity names in documentation (TitleCase)
- Consistent use of class words as suffixes

**Examples**:
- ✅ `party_identifier` (not `party_id`)
- ✅ `birth_date` (not `dob` or `birthday`)
- ✅ `vehicle_identification_number` (not `vin`)
- ✅ `policy_amount` (not `premium`)
- ✅ `status_code` (not `status`)

**Why This Matters**:
- Improves cross-system interoperability
- Makes data model self-documenting
- Reduces ambiguity in attribute meaning
- Aligns with industry standards

---

## 6. Validation Rules Summary

### 6.1 Party Entity Rules

**Party**:
- `party_identifier` must be unique UUID
- `party_name` is required
- `party_type_code` must be one of: PERSON, ORGANIZATION, GROUPING
- `begin_date` must not be in the future
- `end_date` must be after `begin_date` when present

**Person**:
- `person_identifier` must exist in Party table
- `first_name` and `last_name` are required
- `birth_date` must be in the past
- Driver must be at least 16 years old for auto insurance
- `gender_code` must be valid code (where used for rating, subject to state regulations)

**Communication Identity**:
- `communication_type_code` must be one of: EMAIL, PHONE, MOBILE, FAX
- `communication_value` format must match type (email regex, phone format)
- Email addresses must be valid format and unique for User Account creation
- Phone numbers must be valid format (10 digits for US)

**Geographic Location**:
- `state_code` must exist in State reference table
- Hierarchical structure must not create circular references
- Primary location must be within licensed states for auto insurance

**Location Address**:
- `line_1_address` is required (no PO boxes for garaging address)
- `municipality_name` is required
- `state_code` must exist in State reference table
- `postal_code` must be valid 5-digit or 9-digit ZIP code format
- `country_code` must be valid ISO 3166-1 alpha-3 code
- Garaging address must be physical location (no PO boxes)

### 6.2 Account & Product Entity Rules

**Account**:
- `account_type_code` must be valid code from reference data
- Account must have at least one Party with role CUSTOMER
- Account name typically derived from primary Party name

**Product**:
- `licensed_product_name` is required and must be unique
- Product must be licensed/approved in states where policies are issued
- Line of business must be PERSONAL_AUTO for this implementation

**User Account**:
- `email` must be valid email format and unique across all User Accounts
- `password_hash` must be bcrypt or Argon2 hash (never store plain text)
- `party_identifier` must exist and must be unique (one user account per party)
- Email must match a Communication Identity linked to the Party
- User Account is automatically created upon successful policy binding

### 6.3 Policy Entity Rules

**Agreement**:
- `agreement_type_code` must be valid code (POLICY for insurance policies)
- `product_identifier` must exist in Product table
- `agreement_original_inception_date` must not be in the future
- Agreement must have at least one Party with role INSURED

**Policy** (FR-017, FR-018, FR-019):
- `policy_identifier` must exist in Agreement table
- `policy_number` must be unique across all policies
- `effective_date` must not be more than 60 days in the past (for new business)
- `expiration_date` must be after `effective_date`
- Policy term must be 6 or 12 months for auto insurance
- `status_code` must be valid: QUOTED, BINDING, BOUND, ACTIVE, CANCELLED, EXPIRED
- Status transitions must follow valid flow: QUOTED → BINDING → BOUND → ACTIVE
- Quoted policies expire after 30 days if not bound (FR-004, FR-019)

**Policy Coverage Detail** (FR-030):
- `effective_date` must be within Policy effective/expiration dates
- `expiration_date` must be after `effective_date` when present
- `expiration_date` must not exceed Policy expiration date
- Coverage Part and Coverage must be compatible
- Insurable Object must be linked to the Policy through Party relationships
- Liability coverage is mandatory for all policies
- Collision and Comprehensive coverage require deductibles

**Policy Limit**:
- `limit_type_code` must be valid: PER_PERSON, PER_ACCIDENT, PROPERTY_DAMAGE, AGGREGATE
- `limit_value` must be positive
- Liability limits must meet state minimum requirements (typically 25/50/25)
- Split limits or Combined Single Limit (CSL) patterns supported
- Physical damage limits cannot exceed vehicle value

**Policy Deductible**:
- `deductible_type_code` must be valid: COLLISION, COMPREHENSIVE
- `deductible_value` must be positive
- Standard deductible values: 250, 500, 1000 (user selectable)
- Collision and Comprehensive coverage require deductibles
- Higher deductibles result in lower premiums (inverse relationship)

**Policy Amount**:
- `insurance_type_code` must be valid: DIRECT, ASSUMED, CEDED (use DIRECT)
- `amount_type_code` must be valid: PREMIUM, TAX, FEE, SURCHARGE, DISCOUNT
- `policy_amount` can be positive (charges) or negative (credits/discounts)
- Total premium must be positive (sum of all PREMIUM amounts)
- State taxes typically 2-4% of premium
- Policy fees typically $10-$25 flat fee

### 6.4 Insurable Object Entity Rules

**Insurable Object**:
- `insurable_object_type_code` must be valid: VEHICLE (for auto insurance)
- Must have corresponding subtype record (Vehicle)
- Must be linked to Party with role OWNER

**Vehicle** (FR-001, FR-043):
- `insurable_object_identifier` must exist in Insurable Object table
- `vehicle_identification_number` must be unique and exactly 17 characters
- VIN format must be alphanumeric excluding I, O, Q (FR-043)
- VIN check digit validation (ISO 3779 standard)
- `vehicle_model_year` must be between 1900 and current year + 1
- Vehicle cannot be older than 30 years for new business (configurable)
- Vehicle must be enriched with data from simulated VIN decoder service (FR-037, FR-044)

### 6.5 Rating Engine Rules

**Rating Factor**:
- Factor name must match defined rating factors
- Weight multiplier must be positive (typically 0.5 to 3.0)
- Factor values must be within valid ranges

**Rating Table**:
- Rating tables must have non-overlapping effective date ranges for same coverage/state
- Table data must conform to expected structure
- Base rates must be positive
- Effective date must be before expiration date

**Discount** (FR-062):
- Discount percentage must be between 0 and 100
- Either percentage or amount is used, not both
- Total discounts capped at 50% of base premium
- Discount eligibility must be verified

**Surcharge** (FR-063):
- Surcharge percentage must be positive
- Either percentage or amount is used, not both
- Duration must be reasonable (typically 3-5 years)
- Surcharge must have documented basis

**Premium Calculation** (FR-065, FR-067, FR-068):
- Total premium must equal: base + surcharges - discounts + taxes
- All monetary values must be non-negative except discounts
- Calculation details must include itemized breakdown
- Calculation must be reproducible from stored factors
- Premiums must be market-realistic ($800-$3000/year for standard risks)
- Minimum premium floor: $500/year
- Maximum premium cap: $10,000/year

### 6.6 Claims Entity Rules

**Claim** (FR-047, FR-048, FR-049):
- `claim_number` must be unique across all claims
- `incident_date` must be within policy effective/expiration dates
- `incident_date` must not be in the future
- `incident_location` is required
- `incident_description` must be at least 20 characters
- Claim type must match coverage on policy
- Vehicle must be covered under the policy
- Claims can only be filed by policyholder or authorized users
- Claim attachments up to 10MB per file (JPEG, PNG, PDF)

**Claim Party Role**:
- Role code must be valid claim-related role
- Party must exist
- Effective date must not be in the future
- Expiration date must be after effective date when present

**Claim Event**:
- `event_identifier` must exist in Event table
- `event_type_code` must be valid claim event type
- `event_date` must not be in the future
- Events must be created in chronological order

### 6.7 Payment Entity Rules

**Payment** (FR-008):
- `amount` must be positive
- `status` must be valid: PENDING, COMPLETED, FAILED, REFUNDED
- `payment_method_data` must be encrypted/tokenized (never store raw payment card data)
- Payment amount should match policy premium for binding
- Successful payment (COMPLETED) required before policy can transition to BOUND status
- Payment processing simulated with realistic mock gateway behavior

---

## 7. Implementation Notes

### 7.1 Database Technology

**Neon PostgreSQL**: Serverless PostgreSQL fully supports OMG relational model with:
- Native UUID support
- JSONB for flexible data structures (payment tokens, calculation details)
- Foreign key constraints for referential integrity
- Temporal queries for historical reporting
- Advanced indexing for performance

### 7.2 Data Persistence Strategy

**All entities persist** following these patterns:

**Immutable Entities** (create only, no updates):
- Event, Policy Event, Claim Event - audit trail integrity
- Payment (status changes create new records)
- Premium Calculation - calculation audit trail

**Mutable Entities** (updates allowed):
- Party, Person - contact info changes
- Policy - status transitions
- Claim - status updates (filing only in MVP)
- User Account - login tracking, verification

**Temporal Entities** (use begin/end dates):
- Relationships through Party Role tables
- Location Address validity periods
- Coverage effective/expiration dates

### 7.3 OMG Extensions

The following are extensions to the OMG core model for this implementation:

**User Account**: Authentication extension linking to Party for portal access

**Payment**: Extension of Money concept for payment processing

**Rating Entities**: Rating Factor, Rating Table, Discount, Surcharge, Premium Calculation for rating engine transparency

**Document**: Document management extension for policy documents

**Claim Attachments**: Extension for supporting photo/document uploads (referenced but not in DDL)

These extensions follow OMG principles and integrate seamlessly with core entities.

---

## 8. References

- **OMG Property & Casualty Data Model v1.0** (formal/2014-11-01)
- **OMG Specification**: https://www.omg.org/spec/PC/1.0/PDF
- **Feature Specification**: `/specs/001-auto-insurance-flow/spec.md`
- **Product Requirements**: `/Product Requirements`
- **ACORD Standards**: https://www.acord.org/
- **ISO Insurance Standards**

---

**Document Version**: 1.0
**Created**: 2025-10-17
**Standard Reference**: OMG P&C Data Model v1.0 (formal/2014-11-01)
**Compliance**: 100% OMG Core Entity Implementation (27 entities)
**Feature**: Auto Insurance Purchase Flow (001-auto-insurance-flow)
