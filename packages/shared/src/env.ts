import { envDb } from "@scalara/db";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const envShared = createEnv({
    extends: [envDb],
    server: {
        SHARED_NUMBER: z.coerce.number(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});

export type EnvShared = typeof envShared;
