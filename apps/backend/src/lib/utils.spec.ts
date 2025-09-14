import { describe, it, expect } from "vitest";
import {
    calculateBorrowAmount,
    parseElementMapValue,
    parseElementMaps,
} from "@/lib/utils.js";
import z from "zod";

describe("utils", () => {
    describe("calculateBorrowAmount", () => {
        it("returns 0 when no friend balance", () => {
            expect(calculateBorrowAmount(100, undefined)).toBe(0);
            expect(calculateBorrowAmount(100, 0)).toBe(0);
        });
        it("returns 0 when my balance >= friend", () => {
            expect(calculateBorrowAmount(100, 50)).toBe(0);
            expect(calculateBorrowAmount(100, 100)).toBe(0);
        });
        it("caps at friend max", () => {
            expect(calculateBorrowAmount(50, 100)).toBe(50);
            expect(calculateBorrowAmount(1, 2)).toBe(1);
        });
        it("friend cannot go negative", () => {
            expect(calculateBorrowAmount(-100, 100)).toBe(100);
            expect(calculateBorrowAmount(-200, 200)).toBe(200);
        });
    });

    describe("parseElementMaps", () => {
        const schema = z.object({ a: z.number(), b: z.string() });
        it("parses valid traversers", () => {
            const traversers = [
                new Map<string, unknown>(Object.entries({ a: 1, b: "x" })),
            ];
            const res = parseElementMaps(traversers, schema);
            expect(res.success).toBe(true);
            expect(res.unwrap()).toEqual([{ a: 1, b: "x" }]);
        });
        it("fails on invalid entries", () => {
            const traversers = [
                new Map<string, unknown>(Object.entries({ a: "bad", b: "x" })),
            ];
            const res = parseElementMaps(traversers, schema);
            expect(res.success).toBe(false);
        });
    });

    describe("parseElementMapValue", () => {
        const schema = z.number();
        it("returns null on done", () => {
            const res = parseElementMapValue(
                { done: true, value: undefined },
                schema,
            );
            expect(res.success).toBe(true);
            expect(res.unwrap()).toBeNull();
        });
        it("parses primitive value", () => {
            const res = parseElementMapValue({ done: false, value: 5 }, schema);
            expect(res.unwrap()).toBe(5);
        });
        it("parses map value", () => {
            const res = parseElementMapValue(
                { done: false, value: new Map([["x", 1]]) },
                z.object({ x: z.number() }),
            );
            expect(res.unwrap()).toEqual({ x: 1 });
        });
    });
});
