import { helloWorldRouter } from "@/server/api/routers/hello-world";
import { transactionsRouter } from "@/server/api/routers/transactions";
import { processRouter } from "@/server/api/routers/process";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
    helloWorld: helloWorldRouter,
    transactions: transactionsRouter,
    process: processRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
