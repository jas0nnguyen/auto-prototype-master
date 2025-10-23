"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessment = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const party_schema_1 = require("./party.schema");
const _base_schema_1 = require("./_base.schema");
exports.assessment = (0, pg_core_1.pgTable)('assessment', {
    assessment_identifier: (0, pg_core_1.uuid)('assessment_identifier').primaryKey().defaultRandom(),
    damage_description: (0, pg_core_1.text)('damage_description'),
    estimated_amount: (0, pg_core_1.decimal)('estimated_amount', { precision: 12, scale: 2 }),
    assessment_date: (0, pg_core_1.date)('assessment_date').notNull(),
    assessment_type: (0, pg_core_1.varchar)('assessment_type', { length: 50 }),
    assessor_party_id: (0, pg_core_1.uuid)('assessor_party_id')
        .references(() => party_schema_1.party.party_identifier),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=assessment.schema.js.map