import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { gm, pg } from "@/server/db";
import {
    generateDailyTransactions,
    clearAllTransactions,
} from "@scalara/shared/generate-transactions";
import z from "zod";

export const transactionsRouter = createTRPCRouter({
    generate: publicProcedure
        .input(z.object({ count: z.number().int().positive() }))
        .mutation(async ({ input }) => {
            const result = await generateDailyTransactions(gm, pg, input.count);
            if (!result.success) throw new Error(result.error);
            return;
        }),

    clear: publicProcedure.mutation(async () => {
        const result = await clearAllTransactions(pg);
        if (!result.success) throw new Error(result.error.message);
        return;
    }),
});
