import { driver } from "gremlin";
import type { EnvDb } from "./env.js";

export interface GremlinInitOptions {
    url: string;
    authenticator?: InstanceType<typeof driver.auth.PlainTextSaslAuthenticator>;
    traversalSource?: string;
    mimeType?: string;
    pingTimeoutMs?: number;
}

export async function initializeGremlin(env: EnvDb) {
    const client = new driver.Client(env.GREMLIN_DATABASE_URL, {
        traversalSource: "g",
        authenticator: undefined,
        mimeType: "application/vnd.gremlin-v3.0+json",
        pingTimeout: 10000,
    });

    await client.open();
    return client;
}
