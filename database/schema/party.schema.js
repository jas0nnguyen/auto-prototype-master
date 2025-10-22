"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.party = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
exports.party = (0, pg_core_1.pgTable)('party', {
    party_identifier: (0, pg_core_1.uuid)('party_identifier').primaryKey().defaultRandom(),
    party_name: (0, pg_core_1.varchar)('party_name', { length: 255 }).notNull(),
    party_type_code: (0, pg_core_1.varchar)('party_type_code', { length: 50 }).notNull(),
    ..._base_schema_1.temporalTracking,
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=party.schema.js.map