"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimEventRelations = exports.claimEvent = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const claim_schema_1 = require("./claim.schema");
exports.claimEvent = (0, pg_core_1.pgTable)('claim_event', {
    event_id: (0, pg_core_1.uuid)('event_id').primaryKey().defaultRandom(),
    claim_id: (0, pg_core_1.uuid)('claim_id')
        .notNull()
        .references(() => claim_schema_1.claim.claim_id, { onDelete: 'cascade' }),
    event_type: (0, pg_core_1.varchar)('event_type', { length: 50 }).notNull(),
    event_date: (0, pg_core_1.timestamp)('event_date').notNull().defaultNow(),
    description: (0, pg_core_1.text)('description'),
    metadata: (0, pg_core_1.text)('metadata'),
    triggered_by: (0, pg_core_1.varchar)('triggered_by', { length: 100 }),
    created_at: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.claimEventRelations = (0, drizzle_orm_1.relations)(exports.claimEvent, ({ one }) => ({
    claim: one(claim_schema_1.claim, {
        fields: [exports.claimEvent.claim_id],
        references: [claim_schema_1.claim.claim_id],
    }),
}));
//# sourceMappingURL=claim-event.schema.js.map