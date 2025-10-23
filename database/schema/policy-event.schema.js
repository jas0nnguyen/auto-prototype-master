"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyEvent = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const event_schema_1 = require("./event.schema");
const policy_schema_1 = require("./policy.schema");
exports.policyEvent = (0, pg_core_1.pgTable)('policy_event', {
    policy_event_id: (0, pg_core_1.uuid)('policy_event_id')
        .primaryKey()
        .defaultRandom(),
    event_id: (0, pg_core_1.uuid)('event_id')
        .notNull()
        .references(() => event_schema_1.event.event_id, { onDelete: 'cascade' }),
    policy_id: (0, pg_core_1.uuid)('policy_id')
        .notNull()
        .references(() => policy_schema_1.policy.policy_identifier, { onDelete: 'cascade' }),
    previous_status: (0, pg_core_1.varchar)('previous_status', { length: 20 }),
    new_status: (0, pg_core_1.varchar)('new_status', { length: 20 }),
    change_reason: (0, pg_core_1.varchar)('change_reason', { length: 255 }),
});
//# sourceMappingURL=policy-event.schema.js.map