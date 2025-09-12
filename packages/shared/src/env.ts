import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const envShared = createEnv({
    server: {
        SHARED_NUMBER: z.coerce.number(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});

export type EnvShared = typeof envShared;
