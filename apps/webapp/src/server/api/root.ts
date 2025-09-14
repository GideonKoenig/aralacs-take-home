import { helloWorldRouter } from "@/server/api/routers/hello-world";
import { transactionsRouter } from "@/server/api/routers/transactions";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
    helloWorld: helloWorldRouter,
    transactions: transactionsRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
