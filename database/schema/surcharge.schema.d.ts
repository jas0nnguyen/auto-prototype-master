export declare const surcharge: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "surcharge";
    schema: undefined;
    columns: {
        created_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "surcharge";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        updated_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "surcharge";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        surcharge_identifier: import("drizzle-orm/pg-core").PgColumn<{
            name: "surcharge_identifier";
            tableName: "surcharge";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        policy_identifier: import("drizzle-orm/pg-core").PgColumn<{
            name: "policy_identifier";
            tableName: "surcharge";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        surcharge_code: import("drizzle-orm/pg-core").PgColumn<{
            name: "surcharge_code";
            tableName: "surcharge";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: 50;
        }>;
        surcharge_name: import("drizzle-orm/pg-core").PgColumn<{
            name: "surcharge_name";
            tableName: "surcharge";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: 255;
        }>;
        surcharge_description: import("drizzle-orm/pg-core").PgColumn<{
            name: "surcharge_description";
            tableName: "surcharge";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        surcharge_type: import("drizzle-orm/pg-core").PgColumn<{
            name: "surcharge_type";
            tableName: "surcharge";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: 50;
        }>;
        surcharge_percentage: import("drizzle-orm/pg-core").PgColumn<{
            name: "surcharge_percentage";
            tableName: "surcharge";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        surcharge_amount: import("drizzle-orm/pg-core").PgColumn<{
            name: "surcharge_amount";
            tableName: "surcharge";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export type Surcharge = typeof surcharge.$inferSelect;
export type NewSurcharge = typeof surcharge.$inferInsert;
export declare const StandardSurcharges: {
    readonly YOUNG_DRIVER: {
        readonly code: "YOUNG_DRIVER";
        readonly percentage: 50;
        readonly description: "Young Driver Surcharge (+30-100%)";
    };
    readonly DUI: {
        readonly code: "DUI";
        readonly percentage: 75;
        readonly description: "DUI/DWI Conviction (+50-100%)";
    };
    readonly HIGH_PERFORMANCE: {
        readonly code: "HIGH_PERFORMANCE";
        readonly percentage: 40;
        readonly description: "High-Performance Vehicle (+25-75%)";
    };
    readonly ACCIDENT_FAULT: {
        readonly code: "ACCIDENT_FAULT";
        readonly percentage: 20;
        readonly description: "At-Fault Accident (+15-40%)";
    };
    readonly SPEEDING_TICKET: {
        readonly code: "SPEEDING_TICKET";
        readonly percentage: 15;
        readonly description: "Speeding Violation (+10-25%)";
    };
    readonly LAPSED_COVERAGE: {
        readonly code: "LAPSED_COVERAGE";
        readonly percentage: 10;
        readonly description: "Lapsed Coverage (+5-20%)";
    };
    readonly HIGH_RISK_ZIP: {
        readonly code: "HIGH_RISK_ZIP";
        readonly percentage: 15;
        readonly description: "High-Risk Location (+10-30%)";
    };
    readonly CREDIT_SCORE: {
        readonly code: "CREDIT_SCORE";
        readonly percentage: 25;
        readonly description: "Poor Credit Score (+15-50%)";
    };
};
