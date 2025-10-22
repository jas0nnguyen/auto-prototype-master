"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insurableObjectPartyRole = exports.accountPartyRole = exports.agreementPartyRole = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const party_schema_1 = require("./party.schema");
const agreement_schema_1 = require("./agreement.schema");
const account_schema_1 = require("./account.schema");
const insurable_object_schema_1 = require("./insurable-object.schema");
const _base_schema_1 = require("./_base.schema");
exports.agreementPartyRole = (0, pg_core_1.pgTable)('agreement_party_role', {
    agreement_party_role_identifier: (0, pg_core_1.uuid)('agreement_party_role_identifier').primaryKey().defaultRandom(),
    agreement_identifier: (0, pg_core_1.uuid)('agreement_identifier')
        .references(() => agreement_schema_1.agreement.agreement_identifier, { onDelete: 'cascade' })
        .notNull(),
    party_identifier: (0, pg_core_1.uuid)('party_identifier')
        .references(() => party_schema_1.party.party_identifier, { onDelete: 'cascade' })
        .notNull(),
    party_role_code: (0, pg_core_1.varchar)('party_role_code', { length: 50 }).notNull(),
    ..._base_schema_1.temporalTracking,
    ..._base_schema_1.auditTimestamps,
});
exports.accountPartyRole = (0, pg_core_1.pgTable)('account_party_role', {
    account_party_role_identifier: (0, pg_core_1.uuid)('account_party_role_identifier').primaryKey().defaultRandom(),
    account_identifier: (0, pg_core_1.uuid)('account_identifier')
        .references(() => account_schema_1.account.account_identifier, { onDelete: 'cascade' })
        .notNull(),
    party_identifier: (0, pg_core_1.uuid)('party_identifier')
        .references(() => party_schema_1.party.party_identifier, { onDelete: 'cascade' })
        .notNull(),
    party_role_code: (0, pg_core_1.varchar)('party_role_code', { length: 50 }).notNull(),
    ..._base_schema_1.temporalTracking,
    ..._base_schema_1.auditTimestamps,
});
exports.insurableObjectPartyRole = (0, pg_core_1.pgTable)('insurable_object_party_role', {
    insurable_object_party_role_identifier: (0, pg_core_1.uuid)('insurable_object_party_role_identifier').primaryKey().defaultRandom(),
    insurable_object_identifier: (0, pg_core_1.uuid)('insurable_object_identifier')
        .references(() => insurable_object_schema_1.insurableObject.insurable_object_identifier, { onDelete: 'cascade' })
        .notNull(),
    party_identifier: (0, pg_core_1.uuid)('party_identifier')
        .references(() => party_schema_1.party.party_identifier, { onDelete: 'cascade' })
        .notNull(),
    party_role_code: (0, pg_core_1.varchar)('party_role_code', { length: 50 }).notNull(),
    ..._base_schema_1.temporalTracking,
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=party-roles.schema.js.map