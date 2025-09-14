"use client";
import { api } from "@/trpc/react";
import { useState } from "react";

export default function Home() {
    const { data } = api.helloWorld.helloWorld.useQuery(undefined, {
        retry: false,
    });
    const utils = api.useUtils();
    const [count, setCount] = useState<number>(10_000);
    const generate = api.transactions.generate.useMutation({
        onSuccess: () => utils.invalidate(),
    });
    const wipe = api.transactions.clear.useMutation({
        onSuccess: () => utils.invalidate(),
    });
    return (
        <main className="space-y-4 p-4 whitespace-pre">
            <div>{data}</div>
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
            </div>
        </main>
    );
}
