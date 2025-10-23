"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coverage = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const coverage_part_schema_1 = require("./coverage-part.schema");
const product_schema_1 = require("./product.schema");
const _base_schema_1 = require("./_base.schema");
exports.coverage = (0, pg_core_1.pgTable)('coverage', {
    coverage_identifier: (0, pg_core_1.uuid)('coverage_identifier').primaryKey().defaultRandom(),
    coverage_code: (0, pg_core_1.varchar)('coverage_code', { length: 50 }).notNull(),
    coverage_name: (0, pg_core_1.varchar)('coverage_name', { length: 255 }).notNull(),
    coverage_description: (0, pg_core_1.text)('coverage_description'),
    coverage_part_identifier: (0, pg_core_1.uuid)('coverage_part_identifier')
        .references(() => coverage_part_schema_1.coveragePart.coverage_part_identifier)
        .notNull(),
    product_identifier: (0, pg_core_1.uuid)('product_identifier')
        .references(() => product_schema_1.product.product_identifier)
        .notNull(),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=coverage.schema.js.map