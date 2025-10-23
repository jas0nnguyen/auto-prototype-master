"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardCoverageParts = exports.coveragePart = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
exports.coveragePart = (0, pg_core_1.pgTable)('coverage_part', {
    coverage_part_identifier: (0, pg_core_1.uuid)('coverage_part_identifier').primaryKey().defaultRandom(),
    coverage_part_code: (0, pg_core_1.varchar)('coverage_part_code', { length: 50 }).notNull().unique(),
    coverage_part_name: (0, pg_core_1.varchar)('coverage_part_name', { length: 255 }).notNull(),
    coverage_part_description: (0, pg_core_1.text)('coverage_part_description'),
    coverage_category: (0, pg_core_1.varchar)('coverage_category', { length: 50 }),
    is_required: (0, pg_core_1.varchar)('is_required', { length: 10 }).default('false'),
    ..._base_schema_1.auditTimestamps,
});
exports.StandardCoverageParts = {
    BI: 'BODILY_INJURY',
    PD: 'PROPERTY_DAMAGE',
    COLL: 'COLLISION',
    COMP: 'COMPREHENSIVE',
    UM_BI: 'UNINSURED_MOTORIST_BI',
    UM_PD: 'UNINSURED_MOTORIST_PD',
    MEDICAL: 'MEDICAL_PAYMENTS',
    PIP: 'PERSONAL_INJURY_PROTECTION',
    RENTAL: 'RENTAL_REIMBURSEMENT',
    ROADSIDE: 'ROADSIDE_ASSISTANCE',
};
//# sourceMappingURL=coverage-part.schema.js.map