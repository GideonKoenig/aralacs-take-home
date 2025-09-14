import { env } from "@/env";
import { tryCatch } from "@/lib/try-catch";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { backendClient } from "@/server/backend-integration";
import { testGremlin } from "@scalara/db/gremlin";

export const helloWorldRouter = createTRPCRouter({
    helloWorld: publicProcedure.query(async () => {
        const path = "/";
        const result = await tryCatch(
            backendClient.GET(path, {
                parseAs: "text",
                headers: { Accept: "text/plain" },
            }),
        );
        if (!result.success) {
            throw new Error(`Backend request failed: ${result.error}`);
        }
        const response = result.data.response;
        if (!response.ok) throw new Error(response.statusText);

        const tmp = await testGremlin(env);

        const body = (result.data as unknown as { data?: string }).data ?? "";
        return `${body}\nGremlin: ${tmp}`;
    }),
});
