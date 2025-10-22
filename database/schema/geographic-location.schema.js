"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geographicLocationRelations = exports.geographicLocation = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
exports.geographicLocation = (0, pg_core_1.pgTable)('geographic_location', {
    geographic_location_identifier: (0, pg_core_1.uuid)('geographic_location_identifier').primaryKey().defaultRandom(),
    geographic_location_type_code: (0, pg_core_1.varchar)('geographic_location_type_code', { length: 50 }),
    location_code: (0, pg_core_1.varchar)('location_code', { length: 50 }),
    location_name: (0, pg_core_1.varchar)('location_name', { length: 255 }),
    location_number: (0, pg_core_1.varchar)('location_number', { length: 50 }),
    state_code: (0, pg_core_1.varchar)('state_code', { length: 2 }),
    parent_geographic_location_identifier: (0, pg_core_1.uuid)('parent_geographic_location_identifier'),
    location_address_identifier: (0, pg_core_1.uuid)('location_address_identifier'),
    physical_location_identifier: (0, pg_core_1.uuid)('physical_location_identifier'),
    ..._base_schema_1.auditTimestamps,
});
exports.geographicLocationRelations = {
    parent: exports.geographicLocation.parent_geographic_location_identifier,
};
//# sourceMappingURL=geographic-location.schema.js.map