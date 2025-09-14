import { env } from "@/env";
import { initializeGremlin, initializePostgres } from "@scalara/db";

type GremlinConnection = Awaited<ReturnType<typeof initializeGremlin>>;
type PostgresConnection = Awaited<ReturnType<typeof initializePostgres>>;

const globalForDb = globalThis as unknown as {
    __pg: PostgresConnection | undefined;
    __gremlin: GremlinConnection | undefined;
};

async function getPostgres() {
    if (globalForDb.__pg?.isInitialized) return globalForDb.__pg;
    const ds = await initializePostgres(env);
    if (env.NODE_ENV !== "production") globalForDb.__pg = ds;
    return ds;
}

async function getGremlin() {
    if (globalForDb.__gremlin) return globalForDb.__gremlin;
    const conn = await initializeGremlin(env);
    if (env.NODE_ENV !== "production") globalForDb.__gremlin = conn;
    return conn;
}

export const pg = await getPostgres();
export const gm = await getGremlin();
