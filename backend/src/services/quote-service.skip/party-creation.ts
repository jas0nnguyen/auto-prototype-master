/**
 * Party Creation Service (T064)
 *
 * This service creates Party and Person entities in the database from quote input.
 *
 * WHAT ARE PARTY AND PERSON?
 * In the OMG insurance model:
 * - PARTY = any entity that can participate in insurance (person, company, group)
 * - PERSON = a specific type of Party representing individual humans
 *
 * It's like saying:
 * - PARTY = "someone" (generic)
 * - PERSON = "John Smith" (specific)
 *
 * This is called a "subtype pattern" - Person inherits from Party.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Party,
  Person,
  CommunicationIdentity,
  PartyCommunication,
  PartyTypeCode,
  CommunicationTypeCode,
  PartyIdentifier,
  CommunicationIdentifier,
} from '../../types/omg-entities';
import { isValidEmail, isValidUSPhoneNumber } from '../../utils/validators';

/**
 * Input data for creating a Party/Person
 *
 * This is the information we collect from the quote flow's DriverInfo page.
 */
export interface CreatePartyInput {
  // === PERSONAL INFORMATION ===
  first_name: string;
  middle_name?: string;
  last_name: string;
  birth_date: Date;
  gender_code?: string;

  // === CONTACT INFORMATION ===
  email: string;
  phone: string;
  mobile?: string;  // Optional separate mobile number

  // === ADDRESS (for Geographic Location) ===
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

/**
 * Result from creating a Party
 *
 * Returns the created entities and their identifiers.
 */
export interface CreatePartyResult {
  /** The Party identifier (UUID) */
  party_identifier: PartyIdentifier;

  /** The created Party entity */
  party: Party;

  /** The created Person entity */
  person: Person;

  /** Communication identities (email, phone) */
  communications: CommunicationIdentity[];

  /** Party-Communication links */
  party_communications: PartyCommunication[];
}

/**
 * Party Creation Service Class
 *
 * This class contains all the logic for creating insurance parties
 * and their related entities in the database.
 */
export class PartyCreationService {
  /**
   * Create a new Party and Person from quote input
   *
   * This is the main method that orchestrates Party creation.
   * It follows these steps:
   * 1. Validate input data
   * 2. Create Party entity
   * 3. Create Person entity (linked to Party)
   * 4. Create Communication entities (email, phone)
   * 5. Link communications to Party
   * 6. (Future) Save all entities to database
   *
   * @param input - The party information from the quote
   * @returns Promise resolving to the created party data
   *
   * PROMISE EXPLAINED:
   * A Promise is like a restaurant receipt that says "your food is being prepared."
   * - Promise<T> = "I promise to eventually give you a value of type T"
   * - You use 'await' to wait for the promise to resolve
   * - If something goes wrong, the promise "rejects" (throws an error)
   */
  async createPartyFromQuoteInput(
    input: CreatePartyInput
  ): Promise<CreatePartyResult> {
    /**
     * STEP 1: VALIDATE INPUT DATA
     *
     * Before creating anything in the database, we check that
     * all the data is valid and complete.
     */
    this.validatePartyInput(input);

    /**
     * STEP 2: CREATE PARTY ENTITY
     *
     * Party is the "base class" that represents any entity
     * that can participate in insurance.
     */
    const party = this.createPartyEntity(input);

    /**
     * STEP 3: CREATE PERSON ENTITY
     *
     * Person is a "subtype" of Party with additional fields
     * specific to individual humans (name, birth date, gender).
     */
    const person = this.createPersonEntity(input, party.party_identifier);

    /**
     * STEP 4: CREATE COMMUNICATION ENTITIES
     *
     * Communication entities represent contact methods (email, phone).
     * We create separate entities for each communication method.
     */
    const communications = this.createCommunicationEntities(input);

    /**
     * STEP 5: LINK COMMUNICATIONS TO PARTY
     *
     * The PartyCommunication entity links a Party to their
     * communication methods. This is the "Party Role" pattern.
     */
    const partyCommunications = this.linkCommunicationsToParty(
      party.party_identifier,
      communications
    );

    /**
     * STEP 6: RETURN RESULT
     *
     * In a real implementation, we would save all these entities
     * to the database here using Drizzle ORM.
     *
     * Example (future implementation):
     * await db.transaction(async (tx) => {
     *   await tx.insert(partyTable).values(party);
     *   await tx.insert(personTable).values(person);
     *   await tx.insert(communicationTable).values(communications);
     *   await tx.insert(partyCommunicationTable).values(partyCommunications);
     * });
     */
    return {
      party_identifier: party.party_identifier,
      party,
      person,
      communications,
      party_communications: partyCommunications,
    };
  }

  /**
   * Validate party input data
   *
   * Checks that all required fields are present and valid.
   * Throws an error if validation fails.
   *
   * @param input - The party input to validate
   * @throws Error if validation fails
   */
  private validatePartyInput(input: CreatePartyInput): void {
    // Check required fields
    if (!input.first_name || !input.last_name) {
      throw new Error('First name and last name are required');
    }

    if (!input.birth_date) {
      throw new Error('Birth date is required');
    }

    if (!input.email) {
      throw new Error('Email is required');
    }

    if (!input.phone) {
      throw new Error('Phone number is required');
    }

    // Validate email format
    if (!isValidEmail(input.email)) {
      throw new Error('Invalid email format');
    }

    // Validate phone format
    if (!isValidUSPhoneNumber(input.phone)) {
      throw new Error('Invalid phone number format');
    }

    // Validate birth date is in the past
    if (input.birth_date >= new Date()) {
      throw new Error('Birth date must be in the past');
    }

    // Check driver is at least 16 years old (legal driving age)
    const age = this.calculateAge(input.birth_date);
    if (age < 16) {
      throw new Error('Driver must be at least 16 years old');
    }
  }

  /**
   * Create Party entity
   *
   * Party is the base entity representing anyone who can participate
   * in insurance (policyholder, beneficiary, claimant, etc.).
   *
   * @param input - The party input data
   * @returns The created Party entity
   */
  private createPartyEntity(input: CreatePartyInput): Party {
    const now = new Date();

    /**
     * Generate a unique identifier using UUID v4
     *
     * UUID = Universally Unique Identifier
     * Example: "550e8400-e29b-41d4-a716-446655440000"
     *
     * UUIDs are:
     * - Globally unique (won't collide with other IDs)
     * - Not sequential (can't guess the next ID)
     * - 128-bit random numbers
     */
    const partyIdentifier = uuidv4();

    /**
     * Construct full legal name
     * Example: "John Michael Smith"
     */
    const fullName = [
      input.first_name,
      input.middle_name,
      input.last_name,
    ]
      .filter(Boolean)  // Remove undefined/null values
      .join(' ');       // Join with spaces

    /**
     * Create the Party entity following OMG model
     *
     * OMG NAMING CONVENTION:
     * - party_identifier (not id, not partyId)
     * - party_type_code (not type, not partyType)
     * - created_at (not createdAt)
     *
     * This follows database column naming conventions (snake_case).
     */
    const party: Party = {
      party_identifier: partyIdentifier,
      party_name: fullName,
      party_type_code: PartyTypeCode.PERSON,  // Enum value
      begin_date: now,      // When this party record becomes valid
      end_date: null,       // null = currently valid (not ended)
      created_at: now,      // Audit: when created
      updated_at: now,      // Audit: when last updated
    };

    return party;
  }

  /**
   * Create Person entity (subtype of Party)
   *
   * Person adds human-specific fields like first/last name,
   * birth date, and gender.
   *
   * SUBTYPE PATTERN:
   * Person doesn't duplicate Party data - it EXTENDS it.
   * - Party table has common fields (party_identifier, party_name)
   * - Person table has specific fields (first_name, birth_date)
   * - They're linked by person_identifier = party_identifier
   *
   * It's like:
   * - Party = "Someone named John Smith"
   * - Person = "John Smith, born May 15, 1990, male"
   *
   * @param input - The party input data
   * @param partyIdentifier - The Party's identifier (links Person to Party)
   * @returns The created Person entity
   */
  private createPersonEntity(
    input: CreatePartyInput,
    partyIdentifier: PartyIdentifier
  ): Person {
    const now = new Date();

    const person: Person = {
      /**
       * person_identifier is a FOREIGN KEY to party_identifier
       *
       * This creates the "is-a" relationship:
       * "This Person IS-A Party with identifier X"
       */
      person_identifier: partyIdentifier,

      // Name fields (broken down for sorting, formatting)
      first_name: input.first_name,
      middle_name: input.middle_name,
      last_name: input.last_name,

      // Full legal name (for documents, contracts)
      full_legal_name: [
        input.first_name,
        input.middle_name,
        input.last_name,
      ]
        .filter(Boolean)
        .join(' '),

      // Demographic information
      birth_date: input.birth_date,
      gender_code: input.gender_code as any, // TODO: Validate against GenderCode enum

      // Audit timestamps
      created_at: now,
      updated_at: now,
    };

    return person;
  }

  /**
   * Create Communication entities (email, phone, mobile)
   *
   * Communication entities represent contact methods.
   * Each communication method gets its own entity.
   *
   * WHY SEPARATE ENTITIES?
   * - Allows multiple emails, phones per person
   * - Tracks when each method was added/removed (temporal tracking)
   * - Can mark preferred communication method
   *
   * @param input - The party input data
   * @returns Array of created Communication entities
   */
  private createCommunicationEntities(
    input: CreatePartyInput
  ): CommunicationIdentity[] {
    const now = new Date();
    const communications: CommunicationIdentity[] = [];

    /**
     * CREATE EMAIL COMMUNICATION
     */
    const emailCommunication: CommunicationIdentity = {
      communication_identifier: uuidv4(),
      communication_type_code: CommunicationTypeCode.EMAIL,
      communication_value: input.email.toLowerCase(), // Normalize to lowercase
      created_at: now,
      updated_at: now,
    };
    communications.push(emailCommunication);

    /**
     * CREATE PHONE COMMUNICATION
     *
     * We normalize the phone number to digits-only format
     * for consistent storage (removes spaces, dashes, parentheses).
     */
    const phoneCommunication: CommunicationIdentity = {
      communication_identifier: uuidv4(),
      communication_type_code: CommunicationTypeCode.PHONE,
      communication_value: this.normalizePhoneNumber(input.phone),
      created_at: now,
      updated_at: now,
    };
    communications.push(phoneCommunication);

    /**
     * CREATE MOBILE COMMUNICATION (if provided)
     */
    if (input.mobile) {
      const mobileCommunication: CommunicationIdentity = {
        communication_identifier: uuidv4(),
        communication_type_code: CommunicationTypeCode.MOBILE,
        communication_value: this.normalizePhoneNumber(input.mobile),
        created_at: now,
        updated_at: now,
      };
      communications.push(mobileCommunication);
    }

    return communications;
  }

  /**
   * Link Communication entities to Party
   *
   * Creates PartyCommunication entities that establish the
   * relationship between a Party and their communication methods.
   *
   * PARTY ROLE PATTERN:
   * Instead of putting email/phone directly on Party, we:
   * 1. Create Communication entities (email, phone)
   * 2. Create PartyCommunication links
   *
   * Benefits:
   * - Multiple parties can share a communication (shared email)
   * - Track when each communication was added/removed
   * - Mark preferred communication method
   *
   * @param partyIdentifier - The Party's identifier
   * @param communications - The Communication entities to link
   * @returns Array of PartyCommunication link entities
   */
  private linkCommunicationsToParty(
    partyIdentifier: PartyIdentifier,
    communications: CommunicationIdentity[]
  ): PartyCommunication[] {
    const now = new Date();

    /**
     * Array.map() EXPLAINED:
     * Takes each item in an array and transforms it.
     *
     * Example:
     * [1, 2, 3].map(x => x * 2)  // Returns [2, 4, 6]
     *
     * Here we transform each Communication into a PartyCommunication.
     */
    return communications.map((comm, index) => ({
      party_communication_identifier: uuidv4(),
      party_identifier: partyIdentifier,
      communication_identifier: comm.communication_identifier,

      /**
       * Mark the first communication (email) as preferred
       *
       * is_preferred is used to determine which contact method
       * to use when sending notifications.
       */
      is_preferred: index === 0,  // First item is preferred

      // Temporal tracking
      begin_date: now,
      end_date: null,  // Currently valid

      // Audit tracking
      created_at: now,
      updated_at: now,
    }));
  }

  /**
   * Calculate age from birth date
   *
   * Returns the person's age in years.
   *
   * @param birthDate - The person's birth date
   * @returns Age in years
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();

    // Calculate years difference
    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust if birthday hasn't occurred this year
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }

  /**
   * Normalize phone number to digits-only format
   *
   * Removes all non-digit characters for consistent storage.
   *
   * Example:
   * "(555) 123-4567" => "5551234567"
   *
   * @param phone - The phone number to normalize
   * @returns Digits-only phone number
   */
  private normalizePhoneNumber(phone: string): string {
    /**
     * REGEX EXPLAINED:
     * /\D/g means "find all non-digit characters"
     * - \D = any non-digit character
     * - /g = global flag (find all matches, not just first)
     *
     * .replace(/\D/g, '') removes all non-digits
     */
    return phone.replace(/\D/g, '');
  }
}

/**
 * ============================================================================
 * LEARNING SUMMARY: PARTY CREATION SERVICE
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. OMG PARTY MODEL
 *    - Party = generic participant in insurance
 *    - Person = specific type of Party (human)
 *    - Uses "subtype pattern" for specialization
 *
 * 2. ENTITY RELATIONSHIPS
 *    - Party HAS-A Person (subtype relationship)
 *    - Party HAS-MANY Communications (one-to-many)
 *    - PartyCommunication links them (junction table)
 *
 * 3. TEMPORAL TRACKING
 *    - begin_date/end_date track validity period
 *    - null end_date = currently valid
 *    - Allows historical queries ("who was the owner on date X?")
 *
 * 4. VALIDATION
 *    - Check required fields exist
 *    - Validate formats (email, phone)
 *    - Enforce business rules (age >= 16)
 *
 * 5. NORMALIZATION
 *    - Phone numbers stored as digits only
 *    - Emails stored in lowercase
 *    - Ensures consistent data format
 *
 * ANALOGIES:
 *
 * - Party/Person Relationship = Animal/Dog
 *   - Animal is generic (can be dog, cat, bird)
 *   - Dog is specific type of Animal
 *   - Dog has all Animal properties + dog-specific properties
 *
 * - PartyCommunication = Contact Book Entry
 *   - Person: "John Smith"
 *   - Links to: john@email.com, 555-1234
 *   - Marks one as "preferred" (⭐)
 *
 * - Temporal Tracking = Employment History
 *   - begin_date = hire date
 *   - end_date = termination date (null if still employed)
 *   - Can answer "who worked here on July 1, 2020?"
 *
 * NEXT STEPS:
 * - Create database tables for Party, Person, Communication, PartyCommunication
 * - Implement actual database inserts using Drizzle ORM
 * - Add transaction support (all-or-nothing saves)
 * - Create query methods (findPartyByEmail, getPartyCommunications)
 */
