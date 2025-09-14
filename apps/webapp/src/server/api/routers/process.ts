import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { backendClient } from "@/server/backend-integration";
import z from "zod";

export const processRouter = createTRPCRouter({
    preProcess: publicProcedure
        .input(z.enum(["1", "2", "3"]))
        .mutation(async ({ input }) => {
            const result = await backendClient.POST("/process", {
                body: { processId: input },
            });

            if (!result.response.ok)
                throw new Error(result.response.statusText);
            return;
        }),
});
