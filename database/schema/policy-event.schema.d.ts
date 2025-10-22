export declare const policyEvent: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "policy_event";
    schema: undefined;
    columns: {
        policy_event_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "policy_event_id";
            tableName: "policy_event";
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
        event_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "event_id";
            tableName: "policy_event";
            dataType: "string";
            columnType: "PgUUID";
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
        policy_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "policy_id";
            tableName: "policy_event";
            dataType: "string";
            columnType: "PgUUID";
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
        previous_status: import("drizzle-orm/pg-core").PgColumn<{
            name: "previous_status";
            tableName: "policy_event";
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
            length: 20;
        }>;
        new_status: import("drizzle-orm/pg-core").PgColumn<{
            name: "new_status";
            tableName: "policy_event";
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
            length: 20;
        }>;
        change_reason: import("drizzle-orm/pg-core").PgColumn<{
            name: "change_reason";
            tableName: "policy_event";
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
            length: 255;
        }>;
    };
    dialect: "pg";
}>;
export type PolicyEvent = typeof policyEvent.$inferSelect;
export type NewPolicyEvent = typeof policyEvent.$inferInsert;
