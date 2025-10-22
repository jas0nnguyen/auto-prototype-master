"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicationIdentity = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const geographic_location_schema_1 = require("./geographic-location.schema");
const party_schema_1 = require("./party.schema");
const _base_schema_1 = require("./_base.schema");
exports.communicationIdentity = (0, pg_core_1.pgTable)('communication_identity', {
    communication_identifier: (0, pg_core_1.uuid)('communication_identifier').primaryKey().defaultRandom(),
    communication_type_code: (0, pg_core_1.varchar)('communication_type_code', { length: 50 }).notNull(),
    communication_value: (0, pg_core_1.varchar)('communication_value', { length: 255 }).notNull(),
    communication_qualifier_value: (0, pg_core_1.varchar)('communication_qualifier_value', { length: 100 }),
    party_identifier: (0, pg_core_1.uuid)('party_identifier')
        .notNull()
        .references(() => party_schema_1.party.party_identifier),
    geographic_location_identifier: (0, pg_core_1.uuid)('geographic_location_identifier')
        .references(() => geographic_location_schema_1.geographicLocation.geographic_location_identifier),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=communication-identity.schema.js.map