# Product Requirements Document: Auto Insurance Purchase Flow
## Based on OMG Property & Casualty Data Model v1.0

---

## 1. Overview

### 1.1 Product Summary

A complete auto insurance purchase platform based on the OMG Property & Casualty Data Model standard, which addresses the data management needs of the P&C insurance community using Model Driven Architecture principles. This platform enables users to generate quotes, bind policies, and manage their insurance through a self-service portal with full conformance to industry standards.

### 1.2 Objectives

- Implement OMG P&C standard-compliant data model for auto insurance
- Streamline the insurance purchase process from quote to active policy
- Enable self-service policy management for customers
- Maintain comprehensive data persistence using industry-standard entities and relationships

### 1.3 Success Metrics

- Quote completion rate: >70%
- Quote-to-bind conversion rate: >25%
- Portal registration rate post-bind: 100%
- Average time from quote start to policy bind: <15 minutes
- System uptime: 99.9%
- 100% compliance with OMG P&C core entities

---

## 2. OMG P&C Data Model Compliance

### 2.1 Required Core Entities

For conformance with the OMG standard, the following conceptual major data entities must be implemented exactly as represented in the specification:

**Required Entities:**
- Account
- Activity
- Agreement
- Claim
- Communication
- Coverage
- Event
- Geographic Location
- Insurable Object
- Location Address
- Money
- Party
- Policy
- Policy Coverage Detail
- Policy Deductible
- Policy Limit
- Product

### 2.2 Subject Area Model Implementation

The implementation will follow the OMG P&C logical data model across these subject areas:

1. **Party Subject Area** - Persons, organizations, and groups
2. **Account and Agreement Subject Area** - Customer accounts and agreements
3. **Policy Subject Area** - Insurance policies and coverage
4. **Assessment Subject Area** - Risk and underwriting assessments
5. **Product Coverage Reference** - Product definitions and coverage options

---

## 3. Database Schema (Neon PostgreSQL)

### 3.1 Core OMG Entities

```sql
-- ===================================
-- PARTY SUBJECT AREA
-- ===================================

-- Party (OMG Core Entity)
CREATE TABLE party (
    party_identifier UUID PRIMARY KEY,
    party_name VARCHAR(255) NOT NULL,
    party_type_code VARCHAR(50) NOT NULL, -- PERSON, ORGANIZATION, GROUPING
    begin_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Person (Subtype of Party)
CREATE TABLE person (
    person_identifier UUID PRIMARY KEY REFERENCES party(party_identifier),
    prefix_name VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    suffix_name VARCHAR(20),
    full_legal_name VARCHAR(255),
    nickname VARCHAR(100),
    birth_date DATE,
    birth_place_name VARCHAR(255),
    gender_code VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Organization (Subtype of Party)
CREATE TABLE organization (
    organization_identifier UUID PRIMARY KEY REFERENCES party(party_identifier),
    organization_type_code VARCHAR(50),
    organization_name VARCHAR(255) NOT NULL,
    alternate_name VARCHAR(255),
    acronym_name VARCHAR(50),
    industry_type_code VARCHAR(50),
    industry_code VARCHAR(50),
    dun_and_bradstreet_identifier VARCHAR(50),
    organization_description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Party Role (OMG Pattern)
CREATE TABLE party_role (
    party_role_code VARCHAR(50) PRIMARY KEY,
    party_role_name VARCHAR(100) NOT NULL,
    party_role_description TEXT
);

-- Communication Identity (OMG Core Entity)
CREATE TABLE communication_identity (
    communication_identifier UUID PRIMARY KEY,
    communication_type_code VARCHAR(50) NOT NULL, -- EMAIL, PHONE, MOBILE, FAX
    communication_value VARCHAR(255) NOT NULL,
    communication_qualifier_value VARCHAR(100),
    geographic_location_identifier UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Party Communication
CREATE TABLE party_communication (
    party_identifier UUID REFERENCES party(party_identifier),
    communication_identifier UUID REFERENCES communication_identity(communication_identifier),
    party_locality_code VARCHAR(50), -- HOME, WORK, MOBILE
    begin_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    preference_sequence_number INTEGER,
    preference_day_and_time_group_code VARCHAR(50),
    party_routing_description TEXT,
    PRIMARY KEY (party_identifier, communication_identifier, begin_date)
);

-- ===================================
-- GEOGRAPHIC LOCATION (OMG Core Entity)
-- ===================================

CREATE TABLE state (
    state_code VARCHAR(2) PRIMARY KEY,
    state_name VARCHAR(100) NOT NULL
);

CREATE TABLE geographic_location (
    geographic_location_identifier UUID PRIMARY KEY,
    geographic_location_type_code VARCHAR(50) NOT NULL,
    location_code VARCHAR(50),
    location_name VARCHAR(255),
    location_number VARCHAR(50),
    state_code VARCHAR(2) REFERENCES state(state_code),
    parent_geographic_location_identifier UUID REFERENCES geographic_location(geographic_location_identifier),
    location_address_identifier UUID,
    physical_location_identifier UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Location Address (OMG Core Entity)
CREATE TABLE location_address (
    location_address_identifier UUID PRIMARY KEY,
    line_1_address VARCHAR(255) NOT NULL,
    line_2_address VARCHAR(255),
    municipality_name VARCHAR(100) NOT NULL,
    state_code VARCHAR(2) REFERENCES state(state_code),
    postal_code VARCHAR(20) NOT NULL,
    country_code VARCHAR(3) NOT NULL DEFAULT 'USA',
    begin_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- ACCOUNT AND AGREEMENT SUBJECT AREA
-- ===================================

-- Account (OMG Core Entity)
CREATE TABLE account (
    account_identifier UUID PRIMARY KEY,
    account_type_code VARCHAR(50) NOT NULL, -- INSURED_ACCOUNT
    account_name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Account Party Role
CREATE TABLE account_party_role (
    account_identifier UUID REFERENCES account(account_identifier),
    party_role_code VARCHAR(50) REFERENCES party_role(party_role_code),
    party_identifier UUID REFERENCES party(party_identifier),
    begin_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    PRIMARY KEY (account_identifier, party_role_code, party_identifier)
);

-- Product (OMG Core Entity)
CREATE TABLE product (
    product_identifier UUID PRIMARY KEY,
    line_of_business_identifier UUID,
    licensed_product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Agreement (OMG Core Entity)
CREATE TABLE agreement (
    agreement_identifier UUID PRIMARY KEY,
    agreement_type_code VARCHAR(50) NOT NULL, -- POLICY, REINSURANCE, etc.
    agreement_name VARCHAR(255),
    agreement_original_inception_date DATE,
    product_identifier UUID REFERENCES product(product_identifier),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Agreement Party Role
CREATE TABLE agreement_party_role (
    agreement_identifier UUID REFERENCES agreement(agreement_identifier),
    party_role_code VARCHAR(50) REFERENCES party_role(party_role_code),
    effective_date DATE NOT NULL,
    party_identifier UUID REFERENCES party(party_identifier),
    expiration_date DATE,
    PRIMARY KEY (agreement_identifier, party_role_code, effective_date, party_identifier)
);

-- Account Agreement
CREATE TABLE account_agreement (
    account_identifier UUID REFERENCES account(account_identifier),
    agreement_identifier UUID REFERENCES agreement(agreement_identifier),
    PRIMARY KEY (account_identifier, agreement_identifier)
);

-- ===================================
-- POLICY SUBJECT AREA
-- ===================================

-- Policy (OMG Core Entity - Subtype of Agreement)
CREATE TABLE policy (
    policy_identifier UUID PRIMARY KEY REFERENCES agreement(agreement_identifier),
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    status_code VARCHAR(50) NOT NULL, -- QUOTED, BINDING, BOUND, ACTIVE, CANCELLED
    geographic_location_identifier UUID REFERENCES geographic_location(geographic_location_identifier),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Coverage Part
CREATE TABLE coverage_part (
    coverage_part_code VARCHAR(50) PRIMARY KEY,
    coverage_part_name VARCHAR(255) NOT NULL
);

-- Coverage Type
CREATE TABLE coverage_type (
    coverage_type_identifier UUID PRIMARY KEY,
    coverage_type_name VARCHAR(255) NOT NULL,
    coverage_type_description TEXT
);

-- Coverage Group
CREATE TABLE coverage_group (
    coverage_group_identifier UUID PRIMARY KEY,
    coverage_group_name VARCHAR(255) NOT NULL,
    coverage_group_description TEXT
);

-- Coverage (OMG Core Entity)
CREATE TABLE coverage (
    coverage_identifier UUID PRIMARY KEY,
    coverage_part_code VARCHAR(50) REFERENCES coverage_part(coverage_part_code),
    coverage_type_identifier UUID REFERENCES coverage_type(coverage_type_identifier),
    coverage_name VARCHAR(255) NOT NULL,
    coverage_description TEXT,
    coverage_group_identifier UUID REFERENCES coverage_group(coverage_group_identifier),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Policy Coverage Part
CREATE TABLE policy_coverage_part (
    coverage_part_code VARCHAR(50) REFERENCES coverage_part(coverage_part_code),
    policy_identifier UUID REFERENCES policy(policy_identifier),
    PRIMARY KEY (coverage_part_code, policy_identifier)
);

-- Insurable Object (OMG Core Entity)
CREATE TABLE insurable_object (
    insurable_object_identifier UUID PRIMARY KEY,
    insurable_object_type_code VARCHAR(50) NOT NULL, -- VEHICLE, STRUCTURE, etc.
    geographic_location_identifier UUID REFERENCES geographic_location(geographic_location_identifier),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle (Subtype of Insurable Object)
CREATE TABLE vehicle (
    insurable_object_identifier UUID PRIMARY KEY REFERENCES insurable_object(insurable_object_identifier),
    vehicle_model_year INTEGER NOT NULL,
    vehicle_model_name VARCHAR(100) NOT NULL,
    vehicle_driving_wheel_quantity INTEGER,
    vehicle_make_name VARCHAR(100) NOT NULL,
    vehicle_identification_number VARCHAR(17) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insurable Object Party Role
CREATE TABLE insurable_object_party_role (
    insurable_object_identifier UUID REFERENCES insurable_object(insurable_object_identifier),
    party_role_code VARCHAR(50) REFERENCES party_role(party_role_code),
    effective_date DATE NOT NULL,
    party_identifier UUID REFERENCES party(party_identifier),
    expiration_date DATE,
    PRIMARY KEY (insurable_object_identifier, party_role_code, effective_date, party_identifier)
);

-- Policy Coverage Detail (OMG Core Entity)
CREATE TABLE policy_coverage_detail (
    policy_coverage_detail_identifier UUID PRIMARY KEY,
    effective_date DATE NOT NULL,
    policy_identifier UUID REFERENCES policy(policy_identifier),
    coverage_part_code VARCHAR(50) REFERENCES coverage_part(coverage_part_code),
    coverage_identifier UUID REFERENCES coverage(coverage_identifier),
    insurable_object_identifier UUID REFERENCES insurable_object(insurable_object_identifier),
    expiration_date DATE,
    coverage_inclusion_exclusion_code VARCHAR(50),
    coverage_description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Policy Limit (OMG Core Entity)
CREATE TABLE policy_limit (
    policy_limit_identifier UUID PRIMARY KEY,
    policy_coverage_detail_identifier UUID REFERENCES policy_coverage_detail(policy_coverage_detail_identifier),
    effective_date DATE NOT NULL,
    limit_type_code VARCHAR(50) NOT NULL, -- PER_PERSON, PER_ACCIDENT, PROPERTY_DAMAGE
    limit_basis_code VARCHAR(50),
    limit_value DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Policy Deductible (OMG Core Entity)
CREATE TABLE policy_deductible (
    policy_deductible_identifier UUID PRIMARY KEY,
    policy_coverage_detail_identifier UUID REFERENCES policy_coverage_detail(policy_coverage_detail_identifier),
    effective_date DATE NOT NULL,
    deductible_type_code VARCHAR(50) NOT NULL, -- COLLISION, COMPREHENSIVE
    deductible_basis_code VARCHAR(50),
    deductible_value DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Policy Amount (Money - OMG Core Entity)
CREATE TABLE policy_amount (
    policy_amount_identifier UUID PRIMARY KEY,
    policy_identifier UUID REFERENCES policy(policy_identifier),
    policy_coverage_detail_identifier UUID REFERENCES policy_coverage_detail(policy_coverage_detail_identifier),
    insurable_object_identifier UUID REFERENCES insurable_object(insurable_object_identifier),
    geographic_location_identifier UUID REFERENCES geographic_location(geographic_location_identifier),
    effective_date DATE NOT NULL,
    earning_begin_date DATE,
    earning_end_date DATE,
    insurance_type_code VARCHAR(50) NOT NULL, -- DIRECT, ASSUMED, CEDED
    amount_type_code VARCHAR(50) NOT NULL, -- PREMIUM, TAX, FEE, SURCHARGE
    policy_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Event (OMG Core Entity)
CREATE TABLE event (
    event_identifier UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Policy Event (OMG Pattern)
CREATE TABLE policy_event (
    event_identifier UUID PRIMARY KEY REFERENCES event(event_identifier),
    event_date DATE NOT NULL,
    effective_date DATE NOT NULL,
    event_type_code VARCHAR(50) NOT NULL, -- NEW_BUSINESS, ENDORSEMENT, RENEWAL, CANCEL
    event_sub_type_code VARCHAR(50),
    policy_identifier UUID REFERENCES policy(policy_identifier),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- PAYMENT (Extension of Money Concept)
-- ===================================

CREATE TABLE payment (
    payment_identifier UUID PRIMARY KEY,
    policy_identifier UUID REFERENCES policy(policy_identifier),
    party_identifier UUID REFERENCES party(party_identifier),
    amount DECIMAL(15,2) NOT NULL,
    payment_method_data JSONB NOT NULL, -- Tokenized payment info
    status VARCHAR(50) NOT NULL, -- PENDING, COMPLETED, FAILED, REFUNDED
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- DOCUMENTS
-- ===================================

CREATE TABLE document (
    document_identifier UUID PRIMARY KEY,
    policy_identifier UUID REFERENCES policy(policy_identifier),
    document_type VARCHAR(50) NOT NULL, -- POLICY_DOC, ID_CARD, DECLARATION
    file_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- USER AUTHENTICATION (Extension)
-- ===================================

CREATE TABLE user_account (
    user_account_identifier UUID PRIMARY KEY,
    party_identifier UUID REFERENCES party(party_identifier) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- ASSESSMENT SUBJECT AREA (for Quotes)
-- ===================================

CREATE TABLE assessment (
    assessment_identifier UUID PRIMARY KEY,
    begin_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    assessment_description TEXT,
    assessment_reason_description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessment_result (
    assessment_result_identifier UUID PRIMARY KEY,
    assessment_identifier UUID REFERENCES assessment(assessment_identifier),
    assessment_result_type_code VARCHAR(50) NOT NULL, -- UNDERWRITING_ASSESSMENT, RISK_SCORE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agreement_assessment (
    agreement_identifier UUID REFERENCES agreement(agreement_identifier),
    assessment_identifier UUID REFERENCES assessment(assessment_identifier),
    PRIMARY KEY (agreement_identifier, assessment_identifier)
);
```

### 3.2 Reference Data Tables

```sql
-- ===================================
-- REFERENCE DATA (Code Tables)
-- ===================================

CREATE TABLE insurance_rating_classification_code (
    classification_code VARCHAR(50) PRIMARY KEY,
    classification_name VARCHAR(255) NOT NULL,
    classification_description TEXT
);

-- Pre-populate Party Roles
INSERT INTO party_role (party_role_code, party_role_name, party_role_description) VALUES
('INSURED', 'Insured', 'Primary named insured on the policy'),
('DRIVER', 'Driver', 'Authorized driver of the vehicle'),
('OWNER', 'Owner', 'Legal owner of the insurable object'),
('CUSTOMER', 'Customer', 'Customer of the insurance company'),
('PRODUCER', 'Producer', 'Insurance agent or broker'),
('INSURER', 'Insurer', 'Insurance company providing coverage');

-- Pre-populate Coverage Parts for Auto Insurance
INSERT INTO coverage_part (coverage_part_code, coverage_part_name) VALUES
('LIABILITY', 'Liability Coverage'),
('COLLISION', 'Collision Coverage'),
('COMPREHENSIVE', 'Comprehensive Coverage'),
('PIP', 'Personal Injury Protection'),
('UM', 'Uninsured Motorist'),
('UIM', 'Underinsured Motorist');
```

---

## 4. User Journey & Data Flow

### 4.1 Quote Creation Stage

**User Actions:**

1. User enters vehicle information (VIN, year, make, model)
2. User provides driver information (name, DOB, address)
3. User selects coverage options
4. System displays instant quote

**OMG Data Model Implementation:**

1. Create Party (Person) entity
2. Create Location Address entity
3. Create Insurable Object (Vehicle) entity
4. Create Agreement entity with type_code = 'POLICY'
5. Create Policy entity with status = 'QUOTED'
6. Create Policy Coverage Detail entities
7. Create Policy Limit entities
8. Create Policy Deductible entities
9. Create Policy Amount entities (premiums)
10. Create Assessment for underwriting
11. Create Policy Event with event_type = 'QUOTE'

**Database Operations:**

```sql
-- Create the quote as a Policy in QUOTED status
BEGIN TRANSACTION;

-- 1. Create Party
INSERT INTO party (party_identifier, party_name, party_type_code)
VALUES ($party_id, $full_name, 'PERSON');

-- 2. Create Person
INSERT INTO person (person_identifier, first_name, last_name, birth_date)
VALUES ($party_id, $first_name, $last_name, $birth_date);

-- 3. Create Address
INSERT INTO location_address (location_address_identifier, line_1_address, municipality_name, state_code, postal_code)
VALUES ($address_id, $street, $city, $state, $zip);

-- 4. Create Vehicle
INSERT INTO insurable_object (insurable_object_identifier, insurable_object_type_code)
VALUES ($vehicle_id, 'VEHICLE');

INSERT INTO vehicle (insurable_object_identifier, vehicle_identification_number, vehicle_make_name, vehicle_model_name, vehicle_model_year)
VALUES ($vehicle_id, $vin, $make, $model, $year);

-- 5. Create Agreement
INSERT INTO agreement (agreement_identifier, agreement_type_code, product_identifier)
VALUES ($agreement_id, 'POLICY', $product_id);

-- 6. Create Policy
INSERT INTO policy (policy_identifier, policy_number, effective_date, expiration_date, status_code)
VALUES ($agreement_id, $quote_number, $effective_date, $expiration_date, 'QUOTED');

-- 7. Create Coverage Details, Limits, Deductibles, Amounts
-- (Multiple INSERTs for each coverage selected)

-- 8. Create Party Roles
INSERT INTO agreement_party_role (agreement_identifier, party_role_code, party_identifier, effective_date)
VALUES ($agreement_id, 'INSURED', $party_id, $effective_date);

COMMIT;
```

### 4.2 Policy Binding Stage

**User Actions:**

1. User reviews quote
2. User enters payment information
3. User accepts terms
4. User clicks "Bind Policy"

**OMG Data Model Implementation:**

1. Update Policy status: QUOTED → BINDING → BOUND
2. Create Payment entity
3. Create Policy Event with event_type = 'BINDING'
4. Create User Account linked to Party
5. Generate policy documents
6. Create Document entities
7. Update Policy status to ACTIVE on effective date

**State Transitions (Following OMG Pattern):**

```
QUOTED → BINDING → BOUND → ACTIVE
```

### 4.3 Self-Service Portal

**Data Access Patterns:**

```sql
-- Get all policies for a user
SELECT p.*, pol.policy_number, pol.status_code, pol.effective_date, pol.expiration_date
FROM user_account ua
JOIN party pt ON ua.party_identifier = pt.party_identifier
JOIN agreement_party_role apr ON pt.party_identifier = apr.party_identifier
JOIN agreement a ON apr.agreement_identifier = a.agreement_identifier
JOIN policy pol ON a.agreement_identifier = pol.policy_identifier
WHERE ua.user_account_identifier = $user_id;

-- Get coverage details
SELECT pcd.*, c.coverage_name, pl.limit_value, pd.deductible_value
FROM policy_coverage_detail pcd
JOIN coverage c ON pcd.coverage_identifier = c.coverage_identifier
LEFT JOIN policy_limit pl ON pcd.policy_coverage_detail_identifier = pl.policy_coverage_detail_identifier
LEFT JOIN policy_deductible pd ON pcd.policy_coverage_detail_identifier = pd.policy_coverage_detail_identifier
WHERE pcd.policy_identifier = $policy_id;
```

---

## 5. API Endpoints (OMG-Aligned)

### 5.1 Quote Management

```
POST   /api/quotes              - Create Quote (Policy with status QUOTED)
GET    /api/quotes/:id          - Retrieve Quote
PUT    /api/quotes/:id          - Update Quote
POST   /api/quotes/:id/calculate - Recalculate Premium (update Policy Amounts)
```

### 5.2 Policy Binding

```
POST   /api/quotes/:id/bind     - Bind Policy (transition to BOUND status)
POST   /api/payments            - Process Payment
GET    /api/policies/:id        - Get Policy Details
```

### 5.3 Party & Account Management

```
POST   /api/parties             - Create Party
GET    /api/parties/:id         - Get Party
POST   /api/accounts            - Create Account
GET    /api/accounts/:id        - Get Account
```

### 5.4 User Portal

```
POST   /api/auth/register       - Create User Account (linked to Party)
POST   /api/auth/login          - User Login
GET    /api/users/me/policies   - Get User's Policies
GET    /api/documents/:id       - Download Document
```

---

## 6. OMG Compliance Requirements

### 6.1 Mandatory Core Entities

All implementations MUST include these exact entities:

- ✅ Account
- ✅ Activity (via Event)
- ✅ Agreement
- ✅ Communication
- ✅ Coverage
- ✅ Event
- ✅ Geographic Location
- ✅ Insurable Object
- ✅ Location Address
- ✅ Money (via Policy Amount)
- ✅ Party
- ✅ Policy
- ✅ Policy Coverage Detail
- ✅ Policy Deductible
- ✅ Policy Limit
- ✅ Product

### 6.2 Naming Conventions

Following OMG standards: business names are fully spelled out English names with no delimiters in Title Case, and attributes end in standard class words like Identifier, Code, Name, Description, Date, Amount, etc.

### 6.3 Relationship Patterns

All relationships follow OMG patterns where Party relates to major entities through Party Role, creating flexible many-to-many relationships with role context.

---

## 7. Benefits of OMG Compliance

### 7.1 Industry Standardization

- Interoperability with other P&C systems
- Easier integration with vendors and partners
- Common vocabulary across the industry

### 7.2 Future-Proof Architecture

- Extensible to other lines of business (homeowners, commercial)
- Standard patterns for claims processing
- Reinsurance support built-in

### 7.3 Regulatory Compliance

- Standard geographic jurisdiction tracking
- Proper party identity management
- Audit trail through Event entities

---

## 8. Implementation Phases

### 8.1 Phase 1: MVP (8 weeks)

- Core OMG entities (Party, Agreement, Policy, Coverage)
- Quote creation and pricing
- Payment processing (pay-in-full only)
- Policy binding
- Basic user account creation
- Email notifications

### 8.2 Phase 2 (6 weeks)

- Full Assessment implementation (underwriting)
- Payment plans (installment billing)
- Enhanced party relationships
- Multi-vehicle support
- Self-service portal enhancements

### 8.3 Phase 3 (8 weeks)

- Claim Subject Area implementation
- Policy endorsements (mid-term changes)
- Renewal workflow
- Account management
- Agent/producer portal

---

## 9. Technical Stack

### 9.1 Backend

- **Database**: Neon (Serverless PostgreSQL) - fully supports OMG relational model
- **Framework**: Node.js/TypeScript with Express or NestJS
- **ORM**: Prisma or TypeORM with OMG entity mappings
- **Validation**: Zod schemas matching OMG domain definitions

### 9.2 Frontend

- **Framework**: Next.js 14+ (React)
- **State**: React Query for server state
- **Forms**: React Hook Form
- **Styling**: Tailwind CSS

---

## 10. Entity Relationship Overview

### 10.1 Core Relationships

```
Party (Person/Organization)
  ↓ (via Party Role)
  ├─→ Account (Customer relationship)
  ├─→ Agreement (Insured, Producer roles)
  ├─→ Insurable Object (Owner, Driver roles)
  └─→ Communication Identity (Contact methods)

Agreement
  ├─→ Policy (is-a relationship)
  └─→ Product (defines offering)

Policy
  ├─→ Policy Coverage Detail
  │     ├─→ Coverage
  │     ├─→ Policy Limit
  │     ├─→ Policy Deductible
  │     └─→ Insurable Object
  ├─→ Policy Amount (Premium/Tax/Fee)
  └─→ Policy Event (Quote/Bind/Renew)

Insurable Object
  └─→ Vehicle (is-a relationship)

Geographic Location
  ├─→ Location Address
  └─→ Policy (jurisdiction)
```

---

## 11. Data Model Diagrams

### 11.1 Quote to Policy Flow

```
┌─────────────┐
│    Party    │
│  (Person)   │
└──────┬──────┘
       │
       ├──────────────┐
       ↓              ↓
┌──────────────┐  ┌─────────────┐
│   Address    │  │Communication│
└──────────────┘  └─────────────┘

┌──────────────┐
│   Vehicle    │
│ (Insurable   │
│   Object)    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  Agreement   │
│              │
└──────┬───────┘
       │
       ↓
┌──────────────┐      ┌──────────────┐
│    Policy    │─────→│Policy Coverage│
│ (QUOTED)     │      │    Detail     │
└──────┬───────┘      └───────┬───────┘
       │                      │
       ↓                      ├─→ Coverage
┌──────────────┐              ├─→ Limit
│Policy Amount │              └─→ Deductible
│  (Premium)   │
└──────────────┘

       ↓ (Bind)

┌──────────────┐
│    Policy    │
│  (BOUND)     │
└──────┬───────┘
       │
       ├─→ Payment
       ├─→ Document
       └─→ User Account
```

---

## 12. Key Business Rules

### 12.1 Quote Rules

- Quotes expire after 30 days (can be configured)
- Quote status must be QUOTED before binding
- All required coverages must have limits defined
- Premium must be calculated before quote completion

### 12.2 Binding Rules

- Payment must be successful before policy transitions to BOUND
- Policy effective date cannot be in the past
- All party information must be complete
- Vehicle must have valid VIN

### 12.3 Coverage Rules

- Liability coverage is mandatory
- Collision and Comprehensive require deductibles
- Limits must meet state minimum requirements
- Coverage cannot exceed vehicle value (for physical damage)

---

## 13. Security & Compliance

### 13.1 Data Protection

- PII encryption at rest
- TLS 1.3 for data in transit
- PCI DSS compliance for payment data (tokenization)
- GDPR-ready party data management

### 13.2 Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Multi-factor authentication (MFA) support
- Session management with refresh tokens

### 13.3 Audit Trail

- All policy events logged via Event entity
- Party changes tracked with begin/end dates
- Payment transactions fully auditable
- Document access logging

---

## 14. Testing Strategy

### 14.1 Unit Tests

- Entity validation rules
- Business logic (pricing, underwriting)
- OMG compliance checks

### 14.2 Integration Tests

- API endpoint functionality
- Database transaction integrity
- Payment gateway integration
- Document generation

### 14.3 E2E Tests

- Complete quote-to-bind flow
- User registration and login
- Policy management operations
- Portal functionality

---

## 15. Monitoring & Observability

### 15.1 Metrics

- Quote completion rate
- Bind conversion rate
- API response times
- Database query performance
- Payment success rate

### 15.2 Logging

- Structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Correlation IDs for request tracing
- Sensitive data redaction

### 15.3 Alerting

- Failed payment transactions
- System errors and exceptions
- Performance degradation
- Security incidents

---

## 16. Deployment Architecture

### 16.1 Infrastructure

- **Database**: Neon Serverless PostgreSQL
- **Application**: Vercel or AWS (containerized)
- **Storage**: AWS S3 (documents)
- **CDN**: CloudFlare (static assets)

### 16.2 Environments

- Development (local)
- Staging (pre-production)
- Production (live)

### 16.3 CI/CD Pipeline

- GitHub Actions or GitLab CI
- Automated testing on PR
- Database migrations
- Blue-green deployment

---

## 17. Success Criteria

The product launch will be considered successful when:

- ✅ Users can complete quote-to-bind flow in <15 minutes
- ✅ 90% of bindings result in successful user account creation
- ✅ All policy data correctly persists in Neon database
- ✅ Portal adoption rate >80% within 24 hours of binding
- ✅ Zero critical security vulnerabilities
- ✅ Payment processing success rate >95%
- ✅ Customer satisfaction score >4.0/5.0
- ✅ 100% OMG P&C core entity compliance

---

## 18. Timeline Estimate

**Total Duration: 22 weeks**

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Database Design & Setup | 2 weeks | OMG schema implementation, migrations |
| Party & Account APIs | 2 weeks | Party, communication, address management |
| Product & Coverage Setup | 2 weeks | Coverage definitions, rating engine |
| Quote Flow | 3 weeks | Quote creation, calculation, storage |
| Payment Integration | 2 weeks | Stripe integration, transaction handling |
| Policy Binding | 2 weeks | Bind workflow, document generation |
| User Account & Auth | 2 weeks | Authentication, authorization, JWT |
| Self-Service Portal | 3 weeks | Dashboard, policy view, documents |
| Testing & QA | 3 weeks | Unit, integration, E2E testing |
| Deployment & Launch | 1 week | Production deployment, monitoring |

---

## 19. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| OMG complexity delays development | High | Medium | Phased implementation, focus on core entities first |
| Payment gateway failures | High | Low | Retry logic, fallback options, comprehensive error handling |
| Data migration issues | Medium | Medium | Extensive testing, rollback procedures |
| Regulatory non-compliance | Critical | Low | Legal review, state-specific validation |
| Performance issues with complex queries | Medium | Medium | Query optimization, caching, indexes |

---

## 20. Conclusion

This PRD implements a complete auto insurance purchase flow while maintaining full compliance with the OMG Property & Casualty Data Model v1.0 standard. By following industry-standard patterns for Party, Agreement, Policy, Coverage, and other core entities, the system will be:

1. **Interoperable** with other P&C systems
2. **Extensible** to other insurance products
3. **Maintainable** using industry-recognized patterns
4. **Compliant** with insurance industry best practices

The OMG standard provides a proven, enterprise-grade foundation that will scale with business needs while avoiding common data modeling pitfalls.

---

## Appendix A: Glossary

**Agreement**: A legally binding contract among identified parties

**Insurable Object**: An item which may be included or excluded from insurance coverage

**Party**: A person, organization, or group of interest to the enterprise

**Policy**: A type of agreement that defines insurance coverage terms

**Policy Coverage Detail**: Specific coverage provisions for a policy

**Premium**: The amount paid for insurance coverage

**Underwriting**: The process of evaluating risk and determining coverage eligibility

---

## Appendix B: References

- OMG Property & Casualty Data Model v1.0 (formal/2014-11-01)
- OMG Specification: https://www.omg.org/spec/PC/1.0/PDF
- ACORD Standards: https://www.acord.org/
- ISO Insurance Standards

---

**Document Version**: 1.0 (OMG-Compliant)  
**Last Updated**: October 17, 2025  
**Standard Reference**: OMG P&C Data Model v1.0 (formal/2014-11-01)  
**Owner**: Product Team  
**Stakeholders**: Engineering, Legal, Compliance, Operations