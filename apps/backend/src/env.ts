import "dotenv/config";
import { envDb } from "@scalara/db";
import { envShared } from "@scalara/shared";
import { z } from "zod";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
    extends: [envDb, envShared],
    server: {
        SITE_URL: z.string().url(),
        PORT: z.coerce.number(),
        NODE_ENV: z.enum(["development", "production"]),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});

export type EnvBackend = typeof env;
