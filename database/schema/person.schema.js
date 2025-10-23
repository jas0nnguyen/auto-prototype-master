"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.person = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const party_schema_1 = require("./party.schema");
const _base_schema_1 = require("./_base.schema");
exports.person = (0, pg_core_1.pgTable)('person', {
    person_identifier: (0, pg_core_1.uuid)('person_identifier')
        .primaryKey()
        .references(() => party_schema_1.party.party_identifier, { onDelete: 'cascade' }),
    prefix_name: (0, pg_core_1.varchar)('prefix_name', { length: 20 }),
    first_name: (0, pg_core_1.varchar)('first_name', { length: 100 }).notNull(),
    middle_name: (0, pg_core_1.varchar)('middle_name', { length: 100 }),
    last_name: (0, pg_core_1.varchar)('last_name', { length: 100 }).notNull(),
    suffix_name: (0, pg_core_1.varchar)('suffix_name', { length: 20 }),
    full_legal_name: (0, pg_core_1.varchar)('full_legal_name', { length: 255 }),
    nickname: (0, pg_core_1.varchar)('nickname', { length: 100 }),
    birth_date: (0, pg_core_1.date)('birth_date'),
    birth_place_name: (0, pg_core_1.varchar)('birth_place_name', { length: 255 }),
    gender_code: (0, pg_core_1.varchar)('gender_code', { length: 20 }),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=person.schema.js.map