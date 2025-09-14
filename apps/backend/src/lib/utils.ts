import { Failure, type Result, Success } from "@/lib/try-catch.js";
import type z from "zod";

export function calculateBorrowAmount(
    myBalance: number,
    maxFriendBalance: number | undefined,
) {
    if (maxFriendBalance === undefined) return 0;
    if (maxFriendBalance === 0) return 0;
    if (myBalance >= maxFriendBalance) return 0;

    const delta = maxFriendBalance - myBalance;
    return Math.min(maxFriendBalance, delta);
}

export function parseElementMaps<Schema extends z.ZodType>(
    traversers: unknown[],
    schema: Schema,
): Result<z.infer<Schema>[], string> {
    const results = traversers.map((t) => {
        const target = Object.fromEntries(
            (t as Map<string, unknown>).entries(),
        ) as Record<string, unknown>;

        const parsed = schema.safeParse(target);
        if (!parsed.success) {
            return new Failure(parsed.error);
        }
        return new Success(parsed.data);
    });

    if (results.some((r) => !r.success)) {
        return new Failure("Failed to parse elements");
    }

    return new Success(results.map((r) => r.unwrap()));
}

export function parseElementMapValue<Schema extends z.ZodType>(
    result: IteratorResult<unknown>,
    schema: Schema,
): Result<z.infer<Schema> | null, string> {
    if (result.done || result.value === undefined) return new Success(null);

    let target: unknown;

    if (result.value instanceof Map) {
        target = Object.fromEntries(
            (result.value as Map<string, unknown>).entries(),
        );
    } else {
        target = result.value;
    }

    const parsed = schema.safeParse(target);
    if (!parsed.success) {
        return new Failure(parsed.error.message);
    }

    return new Success(parsed.data);
}
