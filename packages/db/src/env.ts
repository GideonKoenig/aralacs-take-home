import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const envDb = createEnv({
    server: {
        POSTGRES_DATABASE_URL: z.url(),
        GREMLIN_DATABASE_URL: z.url(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});

export type EnvDb = typeof envDb;
