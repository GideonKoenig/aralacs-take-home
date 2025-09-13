import "reflect-metadata";
import { DataSource } from "typeorm";
import { TransactionEntity } from "./postgres-entities/transaction.js";
import { envDb, type EnvDb } from "./env.js";

console.log("Loaded postgres.ts, envDb:", envDb);

const entities = [TransactionEntity];

export async function initializePostgres(env: EnvDb) {
    const dataSource = new DataSource({
        type: "postgres",
        url: env.POSTGRES_DATABASE_URL,
        logging: env.NODE_ENV === "development",
        synchronize: env.NODE_ENV === "development",
        entities,
        migrations: ["src/postgres-migrations/*.ts"],
    });
    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }
    return dataSource;
}

/*
 * This is the target used for the cli commands
 * Simply modify the env variables to change the migration target
 */
const AppDataSource = new DataSource({
    type: "postgres",
    url: envDb.POSTGRES_DATABASE_URL,
    logging: envDb.NODE_ENV === "development",
    synchronize: envDb.NODE_ENV === "development",
    entities,
    migrations: ["src/postgres-migrations/*.ts"],
});
export default AppDataSource;
