"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
exports.event = (0, pg_core_1.pgTable)('event', {
    event_id: (0, pg_core_1.uuid)('event_id').primaryKey().defaultRandom(),
    event_type: (0, pg_core_1.varchar)('event_type', { length: 50 }).notNull(),
    event_subtype: (0, pg_core_1.varchar)('event_subtype', { length: 50 }),
    event_date: (0, pg_core_1.timestamp)('event_date').notNull().defaultNow(),
    event_data: (0, pg_core_1.jsonb)('event_data'),
    event_description: (0, pg_core_1.varchar)('event_description', { length: 500 }),
    actor_id: (0, pg_core_1.uuid)('actor_id'),
    actor_type: (0, pg_core_1.varchar)('actor_type', { length: 50 }),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=event.schema.js.map