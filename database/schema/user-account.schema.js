"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAccount = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
const policy_schema_1 = require("./policy.schema");
exports.userAccount = (0, pg_core_1.pgTable)('user_account', {
    account_id: (0, pg_core_1.uuid)('account_id').primaryKey().defaultRandom(),
    policy_identifier: (0, pg_core_1.uuid)('policy_identifier')
        .notNull()
        .references(() => policy_schema_1.policy.policy_identifier, { onDelete: 'cascade' }),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    access_token: (0, pg_core_1.uuid)('access_token').notNull().defaultRandom(),
    last_accessed_at: (0, pg_core_1.timestamp)('last_accessed_at'),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=user-account.schema.js.map