import {
    Inject,
    Injectable,
    UnprocessableEntityException,
} from "@nestjs/common";
import { GremlinService } from "@/db/gremlin.service.js";
import {
    BankAccountOwnerConnection,
    FriendshipConnection,
    PersonLabel,
} from "@scalara/db";
import { calculateBorrowAmount, parseElementMapValue } from "@/lib/utils.js";
import z from "zod";
import gremlin from "gremlin";

const { process: gprocess } = gremlin;
const { statics: __ } = gprocess;

@Injectable()
export class MetricsService {
    constructor(
        @Inject(GremlinService) private readonly gremlin: GremlinService,
    ) {}

    async netWorth(personId: number) {
        const g = this.gremlin.traversal;
        // Prefer precomputed property from ProcessService
        const storedRaw = await g
            .V()
            .has(PersonLabel, "id", personId)
            .values("netWorthCents")
            .next();
        const storedParsed = parseElementMapValue(
            storedRaw,
            z.number().int().min(0).nullable(),
        );
        if (!storedParsed.success)
            throw new UnprocessableEntityException({
                error: "ValidationError",
                message: "Failed to parse stored net worth",
                details: storedParsed.error,
            });
        const stored = storedParsed.data;
        if (typeof stored === "number") {
            return { personId, netWorthCents: stored } as const;
        }

        // Fallback compute if not yet processed
        const computedRaw = await g
            .V()
            .has(PersonLabel, "id", personId)
            .out(BankAccountOwnerConnection)
            .values("balanceCents")
            .sum()
            .next();
        const computedParsed = parseElementMapValue(
            computedRaw,
            z.number().int().min(0).nullable(),
        );
        if (!computedParsed.success)
            throw new UnprocessableEntityException({
                error: "ValidationError",
                message: "Failed to compute net worth",
                details: computedParsed.error,
            });
        return {
            personId,
            netWorthCents: computedParsed.data ?? 0,
        } as const;
    }

    async borrowable(personId: number) {
        const g = this.gremlin.traversal;
        // Prefer precomputed property from ProcessService
        const storedRaw = await g
            .V()
            .has(PersonLabel, "id", personId)
            .values("maxBorrowableCents")
            .next();
        const storedParsed = parseElementMapValue(
            storedRaw,
            z.number().int().min(0).nullable(),
        );
        if (!storedParsed.success)
            throw new UnprocessableEntityException({
                error: "ValidationError",
                message: "Failed to parse stored borrowable",
                details: storedParsed.error,
            });
        const stored = storedParsed.data;
        if (typeof stored === "number") {
            return { personId, borrowableCents: stored } as const;
        }

        // Fallback compute if not yet processed
        const myBalanceRaw = await g
            .V()
            .has(PersonLabel, "id", personId)
            .out(BankAccountOwnerConnection)
            .values("balanceCents")
            .sum()
            .next();
        const parsedMyBalance = parseElementMapValue(
            myBalanceRaw,
            z.number().int().min(0).nullable(),
        );
        if (!parsedMyBalance.success)
            throw new UnprocessableEntityException({
                error: "ValidationError",
                message: "Failed to compute balance",
                details: parsedMyBalance.error,
            });
        const myBalance = parsedMyBalance.data ?? 0;

        const friendMaxRaw = await g
            .V()
            .has(PersonLabel, "id", personId)
            .out(FriendshipConnection)
            .map(
                __.coalesce(
                    __.out(BankAccountOwnerConnection)
                        .values("balanceCents")
                        .sum(),
                    __.constant(0),
                ),
            )
            .max()
            .next();
        const parsedFriendMax = parseElementMapValue(
            friendMaxRaw,
            z.number().int().min(0).nullable(),
        );
        if (!parsedFriendMax.success)
            throw new UnprocessableEntityException({
                error: "ValidationError",
                message: "Failed to compute friend max",
                details: parsedFriendMax.error,
            });
        const friendMax = parsedFriendMax.data ?? 0;
        const borrowable = calculateBorrowAmount(myBalance, friendMax);
        return { personId, borrowableCents: borrowable } as const;
    }
}
