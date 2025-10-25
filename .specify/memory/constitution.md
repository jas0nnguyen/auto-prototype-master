<!--
SYNC IMPACT REPORT
==================
Version Change: 1.1.0 → 1.1.0 (VALIDATION PASS - No Changes)
Type: PATCH (Constitution validation only - no amendments)
Rationale: Validated constitution completeness after Feature 002 (Toggle Progressive Flow) specification. All principles remain applicable. No changes required.

Modified Principles: None

Added Sections: None

Removed Sections: None

Template Consistency Status:
✅ plan-template.md - Constitution Check section references this file (verified)
✅ spec-template.md - User Stories structure aligns with Principle IV (verified)
✅ tasks-template.md - Task organization by user story matches Principle IV (verified)
✅ commands/*.md - Directory empty (no command templates to validate)

Follow-up TODOs:
- None - All placeholders filled, all principles applicable to new features

Validation Notes:
- Feature 002 (Toggle Progressive Flow) fully aligns with existing principles
- Design System First (I): New UI components will use Canary Design System
- OMG Standards (II): Data model extensions maintain OMG compliance
- Production Patterns (III): Enhanced rating, prefill, and add-ons follow production-ready patterns
- User Story-Driven (IV): Feature spec has 5 prioritized user stories (P1-P3)
- Type Safety (V): TypeScript interfaces required for all new entities
- Data Persistence (VI): New entities (vehicle_coverage, mock_prior_policies) persist in Neon

Generated: 2025-01-24
-->

<!--
SYNC IMPACT REPORT (Historical - v1.1.0)
==================
Version Change: 1.0.0 → 1.1.0
Type: MINOR (Demo exception added to Principle III)
Rationale: Allow URL-based policy access for demo applications while maintaining NON-NEGOTIABLE production patterns

Modified Principles:
- [UPDATED] III. Production-Ready Patterns (NON-NEGOTIABLE) - Added demo exception for authentication

Template Consistency Status:
✅ plan-template.md - No changes required (already supports demo mode)
✅ spec-template.md - No changes required
✅ tasks-template.md - No changes required

Follow-up TODOs:
- Document production migration path for authentication in quickstart.md

Generated: 2025-10-18
-->

<!--
SYNC IMPACT REPORT (Historical - v1.0.0)
==================
Version Change: [Initial] → 1.0.0
Type: MINOR (New constitution initialization)
Rationale: First formal constitution for the Auto Insurance Prototype project

Modified Principles:
- [NEW] I. Design System First
- [NEW] II. OMG Standards Compliance
- [NEW] III. Production-Ready Patterns (NON-NEGOTIABLE)
- [NEW] IV. User Story-Driven Development
- [NEW] V. Type Safety
- [NEW] VI. Data Persistence

Added Sections:
- Core Principles (6 principles)
- Development Standards
- Quality Gates
- Governance

Removed Sections: None (initial version)

Template Consistency Status:
✅ plan-template.md - Constitution Check section references this file (verified)
✅ spec-template.md - User Stories structure aligns with Principle IV (verified)
✅ tasks-template.md - Task organization by user story matches Principle IV (verified)
⚠️  No command files found in .specify/templates/commands/ (expected location per SpecKit structure)

Follow-up TODOs:
- None - All placeholders filled with concrete values
- Future: Add testing principles when test framework is established
- Future: Add deployment/observability principles when infrastructure is defined

Generated: 2025-10-17
-->

# Auto Insurance Prototype Constitution

## Core Principles

### I. Design System First

All UI components MUST use the Canary Design System without custom CSS exceptions.

**Rules:**
- Import components from `@sureapp/canary-design-system` exclusively
- Use component props for styling variations (size, variant, color schemes)
- Global CSS limited to layout and design system integration only
- Custom CSS requires explicit justification and architecture approval
- Design system tokens MUST be used for colors, spacing, typography

**Rationale:** The Canary Design System provides a production-ready, accessible, and consistent UI framework. Custom CSS creates maintenance burden, accessibility risks, and design inconsistency. The design system is the foundation of rapid prototyping while maintaining professional quality.

### II. OMG Standards Compliance

All insurance domain entities MUST conform to OMG Property & Casualty Data Model v1.0.

**Rules:**
- Entity naming, attributes, and relationships follow OMG P&C standard
- Non-standard extensions documented with OMG mapping justification
- Quote, Policy, Coverage, Claim entities use OMG-defined structures
- Rating engine calculations aligned with OMG methodology guidance
- Data model changes require OMG compliance verification

**Rationale:** OMG P&C Data Model ensures industry interoperability, regulatory alignment, and semantic clarity. This standard enables integration with third-party insurance systems and demonstrates enterprise-grade data architecture practices.

### III. Production-Ready Patterns (NON-NEGOTIABLE)

Even as a prototype, all implemented features MUST follow production-ready patterns for security, error handling, and user experience.

**Rules:**
- Authentication and authorization implemented with industry-standard patterns (exception: demo applications may use URL-based access with explicit justification and security disclaimers)
- Sensitive data (payment info, PII) handled with encryption and masking
- Error messages user-friendly with technical details logged separately
- Loading states, validation feedback, and edge cases handled gracefully
- Database transactions ensure data consistency (quotes, policies, payments)
- Simulated integrations mirror real-world API behavior and error modes
- Demo applications MUST document production migration path for waived patterns

**Rationale:** This prototype serves as a reference implementation and demonstration of best practices. Cutting corners on security or UX patterns would undermine its credibility and educational value. Production-ready patterns from the start prevent technical debt.

### IV. User Story-Driven Development

Features MUST be organized by independently testable user stories with clear priorities (P1, P2, P3...).

**Rules:**
- Each user story deliverable as standalone MVP increment
- User stories prioritized by business value (P1 = highest)
- Acceptance scenarios written in Given-When-Then format
- Tasks organized by user story in tasks.md for parallel execution
- Each story independently testable without dependencies on lower-priority stories
- Foundational infrastructure identified and completed before story work begins

**Rationale:** User story-driven development enables incremental delivery, parallel team execution, and clear validation criteria. Prioritization ensures the most valuable features ship first, and independence prevents blocking dependencies.

### V. Type Safety

TypeScript MUST be used throughout with strict type checking enabled.

**Rules:**
- No `any` types except for explicitly justified third-party integrations
- Interfaces defined for all domain entities (Quote, Policy, User, Claim, etc.)
- API contracts typed with request/response interfaces
- Component props strictly typed with TypeScript interfaces
- Type errors MUST be resolved before committing code

**Rationale:** TypeScript catches bugs at compile time, improves code documentation through type signatures, and enables confident refactoring. Strict typing is essential for maintainability in React applications.

### VI. Data Persistence

All business-critical data MUST persist in Neon database with clear state transitions.

**Rules:**
- Quotes persist with states: draft, active, converted, expired
- Policies persist with states: pending, active, cancelled, expired
- Users created upon policy binding with secure credential management
- Payment transactions logged with full audit trail (date, amount, status, method)
- Claims persist with states: submitted, under_review, approved, denied, closed
- State transitions validated and logged for compliance

**Rationale:** Data persistence is essential for business continuity, compliance, and user experience. State management enables accurate reporting, audit trails, and recovery from failures. The Neon database provides scalable, reliable storage.

## Development Standards

### Simulated Integrations

External integrations (payment processing, VIN decoder, vehicle valuation, email delivery) MUST be simulated with realistic behavior:

- Mock payment gateway returns realistic responses (success, declined, validation errors)
- VIN decoder simulation provides vehicle details with edge case handling (invalid VIN, not found)
- Vehicle valuation returns estimates with fallback logic for missing data
- Email previews displayed in-app instead of actual delivery
- All simulations include realistic latency and error scenarios
- Documentation clearly indicates simulated vs. real integrations

### Code Organization

- Frontend: React components in `src/`, organized by feature/domain
- Backend: NestJS services in `backend/src/`, organized by domain and layer (services, api, entities)
- Shared types: Centralized TypeScript interfaces for domain entities
- Database schema: Migration-based approach with Drizzle ORM for version control
- Configuration: Environment-based config for dev/staging/production

### Documentation

- Feature specs MUST include user stories with priorities and acceptance criteria
- Implementation plans MUST define project structure and constitution compliance
- Tasks MUST be organized by user story with clear dependencies
- README MUST provide quickstart and deployment instructions
- Edge cases documented in spec.md for defensive implementation

## Quality Gates

### Pre-Implementation

- [ ] Feature spec approved with prioritized user stories
- [ ] Implementation plan defines structure and constitution compliance
- [ ] Foundational infrastructure tasks identified (blocking prerequisites)
- [ ] Constitution violations justified in complexity tracking table

### During Implementation

- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Canary Design System components used exclusively
- [ ] OMG data model compliance verified for insurance entities
- [ ] Error handling and loading states implemented
- [ ] Database state transitions validated

### Pre-Commit

- [ ] Code formatted and linted
- [ ] TypeScript strict checks pass
- [ ] No sensitive data hardcoded (credentials, API keys)
- [ ] User story acceptance criteria met
- [ ] Edge cases from spec.md handled

## Governance

### Amendment Process

1. Proposed changes documented with rationale
2. Impact analysis on existing features and templates
3. Version bump determined (MAJOR/MINOR/PATCH)
4. Templates updated for consistency (plan, spec, tasks)
5. Constitution updated with sync impact report
6. Changes communicated to development team

### Versioning Policy

- **MAJOR**: Backward-incompatible principle removals or redefinitions
- **MINOR**: New principles added or material guidance expansions
- **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance Review

- All pull requests MUST verify constitution compliance
- Template updates MUST propagate to dependent artifacts
- Complexity MUST be justified in implementation plan
- Constitution supersedes all other practices and conventions

### Runtime Guidance

For development workflow and implementation details, developers should:
1. Review feature spec for user stories and acceptance criteria
2. Consult implementation plan for structure and technical context
3. Follow tasks.md for execution order and dependencies
4. Validate against constitution principles throughout development

**Version**: 1.1.0 | **Ratified**: 2025-10-17 | **Last Amended**: 2025-10-18
