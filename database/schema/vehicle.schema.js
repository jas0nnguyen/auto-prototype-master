"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicle = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const insurable_object_schema_1 = require("./insurable-object.schema");
const _base_schema_1 = require("./_base.schema");
exports.vehicle = (0, pg_core_1.pgTable)('vehicle', {
    vehicle_identifier: (0, pg_core_1.uuid)('vehicle_identifier')
        .primaryKey()
        .references(() => insurable_object_schema_1.insurableObject.insurable_object_identifier, { onDelete: 'cascade' }),
    vin: (0, pg_core_1.varchar)('vin', { length: 17 }).unique(),
    license_plate_number: (0, pg_core_1.varchar)('license_plate_number', { length: 20 }),
    license_plate_state_code: (0, pg_core_1.varchar)('license_plate_state_code', { length: 2 }),
    year: (0, pg_core_1.integer)('year').notNull(),
    make: (0, pg_core_1.varchar)('make', { length: 100 }).notNull(),
    model: (0, pg_core_1.varchar)('model', { length: 100 }).notNull(),
    body_style: (0, pg_core_1.varchar)('body_style', { length: 50 }),
    vehicle_type_code: (0, pg_core_1.varchar)('vehicle_type_code', { length: 50 }),
    engine_type: (0, pg_core_1.varchar)('engine_type', { length: 50 }),
    engine_displacement: (0, pg_core_1.decimal)('engine_displacement', { precision: 5, scale: 1 }),
    fuel_type: (0, pg_core_1.varchar)('fuel_type', { length: 50 }),
    transmission_type: (0, pg_core_1.varchar)('transmission_type', { length: 50 }),
    purchase_date: (0, pg_core_1.date)('purchase_date'),
    purchase_price: (0, pg_core_1.decimal)('purchase_price', { precision: 10, scale: 2 }),
    current_value: (0, pg_core_1.decimal)('current_value', { precision: 10, scale: 2 }),
    odometer_reading: (0, pg_core_1.integer)('odometer_reading'),
    annual_mileage: (0, pg_core_1.integer)('annual_mileage'),
    primary_use: (0, pg_core_1.varchar)('primary_use', { length: 50 }),
    ownership_type: (0, pg_core_1.varchar)('ownership_type', { length: 50 }),
    anti_theft_device: (0, pg_core_1.varchar)('anti_theft_device', { length: 100 }),
    safety_features: (0, pg_core_1.varchar)('safety_features', { length: 500 }),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=vehicle.schema.js.map