"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.account = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
exports.account = (0, pg_core_1.pgTable)('account', {
    account_identifier: (0, pg_core_1.uuid)('account_identifier').primaryKey().defaultRandom(),
    account_type_code: (0, pg_core_1.varchar)('account_type_code', { length: 50 }).notNull(),
    account_name: (0, pg_core_1.varchar)('account_name', { length: 255 }).notNull(),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=account.schema.js.map