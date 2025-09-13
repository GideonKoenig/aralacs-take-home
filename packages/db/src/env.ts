import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const envDb = createEnv({
    server: {
        POSTGRES_DATABASE_URL: z.url(),
        GREMLIN_DATABASE_URL: z.url(),
        NODE_ENV: z.enum(["development", "production"]),
    },
    runtimeEnv: {
        POSTGRES_DATABASE_URL: process.env.POSTGRES_DATABASE_URL,
        GREMLIN_DATABASE_URL: process.env.GREMLIN_DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
    },
    emptyStringAsUndefined: true,
});

export type EnvDb = typeof envDb;
