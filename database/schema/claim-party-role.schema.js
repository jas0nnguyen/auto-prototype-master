"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimPartyRoleRelations = exports.claimPartyRole = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const _base_schema_1 = require("./_base.schema");
const claim_schema_1 = require("./claim.schema");
const party_schema_1 = require("./party.schema");
exports.claimPartyRole = (0, pg_core_1.pgTable)('claim_party_role', {
    claim_party_role_id: (0, pg_core_1.uuid)('claim_party_role_id').primaryKey().defaultRandom(),
    claim_id: (0, pg_core_1.uuid)('claim_id')
        .notNull()
        .references(() => claim_schema_1.claim.claim_id, { onDelete: 'cascade' }),
    party_identifier: (0, pg_core_1.uuid)('party_identifier')
        .notNull()
        .references(() => party_schema_1.party.party_identifier, { onDelete: 'restrict' }),
    role_type_code: (0, pg_core_1.varchar)('role_type_code', { length: 30 }).notNull(),
    ..._base_schema_1.auditTimestamps,
});
exports.claimPartyRoleRelations = (0, drizzle_orm_1.relations)(exports.claimPartyRole, ({ one }) => ({
    claim: one(claim_schema_1.claim, {
        fields: [exports.claimPartyRole.claim_id],
        references: [claim_schema_1.claim.claim_id],
    }),
    party: one(party_schema_1.party, {
        fields: [exports.claimPartyRole.party_identifier],
        references: [party_schema_1.party.party_identifier],
    }),
}));
//# sourceMappingURL=claim-party-role.schema.js.map