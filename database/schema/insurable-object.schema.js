"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insurableObject = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
exports.insurableObject = (0, pg_core_1.pgTable)('insurable_object', {
    insurable_object_identifier: (0, pg_core_1.uuid)('insurable_object_identifier').primaryKey().defaultRandom(),
    insurable_object_type_code: (0, pg_core_1.varchar)('insurable_object_type_code', { length: 50 }).notNull(),
    object_name: (0, pg_core_1.varchar)('object_name', { length: 255 }),
    object_description: (0, pg_core_1.varchar)('object_description', { length: 500 }),
    ..._base_schema_1.temporalTracking,
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=insurable-object.schema.js.map