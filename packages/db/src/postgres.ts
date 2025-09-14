import "reflect-metadata";
import { DataSource } from "typeorm";
import { envDb, type EnvDb } from "./env.js";
import { entities } from "./postgres-entities/entities.js";

export type PostgresConnection = Awaited<ReturnType<typeof initializePostgres>>;

export async function initializePostgres(env: EnvDb) {
    const dataSource = new DataSource({
        type: "postgres",
        url: env.POSTGRES_DATABASE_URL,
        logging: false,
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
    logging: false,
    synchronize: envDb.NODE_ENV === "development",
    entities,
    migrations: ["src/postgres-migrations/*.ts"],
});
export default AppDataSource;
