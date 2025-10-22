"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountAgreement = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const account_schema_1 = require("./account.schema");
const agreement_schema_1 = require("./agreement.schema");
const _base_schema_1 = require("./_base.schema");
exports.accountAgreement = (0, pg_core_1.pgTable)('account_agreement', {
    account_agreement_identifier: (0, pg_core_1.uuid)('account_agreement_identifier').primaryKey().defaultRandom(),
    account_identifier: (0, pg_core_1.uuid)('account_identifier')
        .references(() => account_schema_1.account.account_identifier, { onDelete: 'cascade' })
        .notNull(),
    agreement_identifier: (0, pg_core_1.uuid)('agreement_identifier')
        .references(() => agreement_schema_1.agreement.agreement_identifier, { onDelete: 'cascade' })
        .notNull(),
    relationship_type: (0, pg_core_1.varchar)('relationship_type', { length: 50 }),
    ..._base_schema_1.temporalTracking,
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=account-agreement.schema.js.map