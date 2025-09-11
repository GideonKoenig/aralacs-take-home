import 'dotenv/config';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
    server: {
        SITE_URL: z.url(),
        PORT: z.coerce.number(),
        NODE_ENV: z.enum(['development', 'production']),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
