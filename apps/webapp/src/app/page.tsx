"use client";
import { api } from "@/trpc/react";
import { useState } from "react";

export default function Home() {
    const utils = api.useUtils();
    const transactionCountQuery = api.transactions.count.useQuery();
    const [count, setCount] = useState<number>(10_000);
    const generate = api.transactions.generate.useMutation({
        onSuccess: () => {
            void utils.transactions.count.invalidate();
        },
    });
    const wipe = api.transactions.clear.useMutation({
        onSuccess: () => {
            void utils.transactions.count.invalidate();
        },
    });
    const preProcess = api.process.preProcess.useMutation({
        onSuccess: () => utils.invalidate(),
    });
    return (
        <main className="space-y-4 p-4 whitespace-pre">
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={count}
                    min={1}
                    step={100}
                    onChange={(e) => {
                        setCount(Number(e.target.value));
                    }}
                    className="rounded border px-2 py-1"
                />
                <button
                    onClick={() => {
                        generate.mutate({ count });
                    }}
                    disabled={generate.isPending}
                    className="rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50"
                >
                    Generate {count.toLocaleString()} transactions
                </button>
                <button
                    onClick={() => {
                        wipe.mutate();
                    }}
                    disabled={wipe.isPending}
                    className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
                >
                    Wipe transactions
                </button>
                <span>
                    {`Transactions: ${transactionCountQuery.data?.toLocaleString() ?? (transactionCountQuery.isLoading ? "..." : "0")}`}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => {
                        preProcess.mutate("1");
                    }}
                    disabled={preProcess.isPending}
                    className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
                >
                    PreProcess 1
                </button>
                <button
                    onClick={() => {
                        preProcess.mutate("2");
                    }}
                    disabled={preProcess.isPending}
                    className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
                >
                    PreProcess 2
                </button>
                <button
                    onClick={() => {
                        preProcess.mutate("3");
                    }}
                    disabled={preProcess.isPending}
                    className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
                >
                    PreProcess 3
                </button>
            </div>
        </main>
    );
}
