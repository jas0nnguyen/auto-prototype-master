"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationAddress = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
exports.locationAddress = (0, pg_core_1.pgTable)('location_address', {
    location_address_identifier: (0, pg_core_1.uuid)('location_address_identifier').primaryKey().defaultRandom(),
    line_1_address: (0, pg_core_1.varchar)('line_1_address', { length: 255 }).notNull(),
    line_2_address: (0, pg_core_1.varchar)('line_2_address', { length: 255 }),
    municipality_name: (0, pg_core_1.varchar)('municipality_name', { length: 100 }).notNull(),
    state_code: (0, pg_core_1.varchar)('state_code', { length: 2 }).notNull(),
    postal_code: (0, pg_core_1.varchar)('postal_code', { length: 20 }).notNull(),
    country_code: (0, pg_core_1.varchar)('country_code', { length: 3 }).default('USA'),
    ..._base_schema_1.temporalTracking,
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=location-address.schema.js.map