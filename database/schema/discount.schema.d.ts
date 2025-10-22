export declare const discount: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "discount";
    schema: undefined;
    columns: {
        created_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "discount";
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
            tableName: "discount";
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
        discount_identifier: import("drizzle-orm/pg-core").PgColumn<{
            name: "discount_identifier";
            tableName: "discount";
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
            tableName: "discount";
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
        discount_code: import("drizzle-orm/pg-core").PgColumn<{
            name: "discount_code";
            tableName: "discount";
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
        discount_name: import("drizzle-orm/pg-core").PgColumn<{
            name: "discount_name";
            tableName: "discount";
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
        discount_description: import("drizzle-orm/pg-core").PgColumn<{
            name: "discount_description";
            tableName: "discount";
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
        discount_type: import("drizzle-orm/pg-core").PgColumn<{
            name: "discount_type";
            tableName: "discount";
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
        discount_percentage: import("drizzle-orm/pg-core").PgColumn<{
            name: "discount_percentage";
            tableName: "discount";
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
        discount_amount: import("drizzle-orm/pg-core").PgColumn<{
            name: "discount_amount";
            tableName: "discount";
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
export type Discount = typeof discount.$inferSelect;
export type NewDiscount = typeof discount.$inferInsert;
export declare const StandardDiscounts: {
    readonly GOOD_DRIVER: {
        readonly code: "GOOD_DRIVER";
        readonly percentage: 15;
        readonly description: "Good Driver Discount (15-25%)";
    };
    readonly MULTI_CAR: {
        readonly code: "MULTI_CAR";
        readonly percentage: 10;
        readonly description: "Multi-Car Discount (5-15%)";
    };
    readonly LOW_MILEAGE: {
        readonly code: "LOW_MILEAGE";
        readonly percentage: 10;
        readonly description: "Low Mileage Discount (5-15%)";
    };
    readonly ANTI_THEFT: {
        readonly code: "ANTI_THEFT";
        readonly percentage: 5;
        readonly description: "Anti-Theft Device Discount (5-10%)";
    };
    readonly SAFETY_FEATURES: {
        readonly code: "SAFETY_FEATURES";
        readonly percentage: 5;
        readonly description: "Safety Features Discount (3-7%)";
    };
    readonly DEFENSIVE_DRIVING: {
        readonly code: "DEFENSIVE_DRIVING";
        readonly percentage: 10;
        readonly description: "Defensive Driving Course (5-15%)";
    };
    readonly BUNDLED: {
        readonly code: "BUNDLED";
        readonly percentage: 10;
        readonly description: "Bundled Policies Discount (10-20%)";
    };
};
