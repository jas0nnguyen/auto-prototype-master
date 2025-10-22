"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.document = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
const policy_schema_1 = require("./policy.schema");
exports.document = (0, pg_core_1.pgTable)('document', {
    document_id: (0, pg_core_1.uuid)('document_id').primaryKey().defaultRandom(),
    policy_id: (0, pg_core_1.uuid)('policy_id').references(() => policy_schema_1.policy.policy_identifier, { onDelete: 'cascade' }),
    claim_id: (0, pg_core_1.uuid)('claim_id'),
    document_number: (0, pg_core_1.varchar)('document_number', { length: 20 }).notNull().unique(),
    document_type: (0, pg_core_1.varchar)('document_type', { length: 50 }).notNull(),
    document_name: (0, pg_core_1.varchar)('document_name', { length: 255 }).notNull(),
    storage_url: (0, pg_core_1.varchar)('storage_url', { length: 500 }).notNull(),
    file_size: (0, pg_core_1.integer)('file_size'),
    mime_type: (0, pg_core_1.varchar)('mime_type', { length: 100 }),
    description: (0, pg_core_1.varchar)('description', { length: 500 }),
    generated_at: (0, pg_core_1.timestamp)('generated_at').notNull().defaultNow(),
    expires_at: (0, pg_core_1.timestamp)('expires_at'),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=document.schema.js.map