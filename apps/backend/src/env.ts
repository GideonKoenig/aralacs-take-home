import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { envShared } from "@scalara/shared";

export const env = createEnv({
    extends: [envShared],
    server: {
        SITE_URL: z.url(),
        PORT: z.coerce.number(),
        NODE_ENV: z.enum(["development", "production"]),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
