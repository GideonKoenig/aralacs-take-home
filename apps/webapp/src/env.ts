import { createEnv } from "@t3-oss/env-nextjs";
import { envShared } from "@scalara/shared";
import { envDb } from "@scalara/db";
import { z } from "zod";

export const env = createEnv({
    extends: [envShared, envDb],
    server: {
        NODE_ENV: z.enum(["development", "test", "production"]),
        BACKEND_URL: z.string().url(),
    },
    client: {},
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        BACKEND_URL: process.env.BACKEND_URL,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});
