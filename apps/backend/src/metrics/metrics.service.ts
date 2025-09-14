import { Inject, Injectable } from "@nestjs/common";
import { GremlinService } from "@/db/gremlin.service.js";
import { BankAccountOwnerConnection, FriendshipConnection } from "@scalara/db";
import { calculateLoan } from "@/lib/utils.js";

@Injectable()
export class MetricsService {
    constructor(
        @Inject(GremlinService) private readonly gremlin: GremlinService,
    ) {}

    async netWorth(personId: number) {
        const g = this.gremlin.traversal;
        const res = (await g
            .V(personId)
            .out(BankAccountOwnerConnection)
            .values("balanceCents")
            .sum()
            .next()) as { value: number };
        return { personId, netWorthCents: res.value } as const;
    }

    async borrowable(personId: number) {
        const g = this.gremlin.traversal;
        const myBalance = (
            await g
                .V(personId)
                .out(BankAccountOwnerConnection)
                .values("balanceCents")
                .sum()
                .next()
        ).value as number;
        const friendMax = (
            await g
                .V(personId)
                .out(FriendshipConnection)
                .out(BankAccountOwnerConnection)
                .values("balanceCents")
                .max()
                .next()
        ).value as number | undefined;
        const borrowable = calculateLoan(myBalance, friendMax);
        return { personId, borrowableCents: borrowable } as const;
    }
}
