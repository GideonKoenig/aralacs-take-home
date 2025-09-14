import { envDb } from "@scalara/db";
import { createEnv } from "@t3-oss/env-core";

export const envShared = createEnv({
    extends: [envDb],
    server: {},
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});

export type EnvShared = typeof envShared;
