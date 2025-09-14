import { Injectable, Inject } from "@nestjs/common";
import { GremlinService } from "@/db/gremlin.service.js";
import {
    BankAccountLabel,
    BankAccountOwnerConnection,
    FriendshipConnection,
    PersonLabel,
    PersonType,
    TransactionEntity,
    type PostgresConnection,
} from "@scalara/db";
import {
    getLastProcessExecution,
    logProcessExecution,
} from "@scalara/shared/log-process-call";
import { PostgresService } from "@/db/postgres.service.js";
import { calculateLoan } from "@/lib/utils.js";

@Injectable()
export class ProcessService {
    constructor(
        @Inject(GremlinService) private readonly gremlin: GremlinService,
        @Inject(PostgresService) private readonly postgres: PostgresService,
    ) {}

    async run(processId: 1 | 2 | 3) {
        const pg = this.postgres.get();
        if (processId >= 1) await this.aggregateTransactions(pg);
        if (processId >= 2) await this.computeNetWorth();
        if (processId >= 3) await this.computeBorrowable();
    }

    private async aggregateTransactions(pg: PostgresConnection) {
        const lastResult = await getLastProcessExecution(pg);
        if (!lastResult.success) throw lastResult.error;

        const since = lastResult.data?.endLoadedAt ?? null;
        const whereClause = since ? "t.loadedAt > :since" : "1=1";
        const whereParams = since ? { since } : {};

        const aggregation = await pg
            .getRepository(TransactionEntity)
            .createQueryBuilder("t")
            .select("t.accountIban", "iban")
            .addSelect(
                "SUM(CASE WHEN t.direction = 'credit' THEN t.amount ELSE -t.amount END)",
                "delta",
            )
            .where(whereClause, whereParams)
            .groupBy("t.accountIban")
            .getRawMany<{ iban: string; delta: string }>();

        const stats = await pg
            .getRepository(TransactionEntity)
            .createQueryBuilder("t")
            .select("COUNT(*)", "count")
            .addSelect("MIN(t.loadedAt)", "min")
            .addSelect("MAX(t.loadedAt)", "max")
            .where(whereClause, whereParams)
            .getRawOne<{
                count: string | null;
                min: string | null;
                max: string | null;
            }>();

        const g = this.gremlin.traversal;
        for (const row of aggregation) {
            const iban = row.iban;
            const delta = Number(row.delta);
            if (delta === 0) continue;
            await g
                .V()
                .hasLabel(BankAccountLabel)
                .has("iban", iban)
                .property(
                    "balanceCents",
                    g.inject(delta).math("_ + balanceCents"),
                )
                .iterate();
        }

        const processedCount = Number(stats?.count ?? 0);
        const startLoadedAt = stats?.min ? new Date(stats.min) : null;
        const endLoadedAt = stats?.max ? new Date(stats.max) : null;

        if (processedCount > 0 && endLoadedAt) {
            const res = await logProcessExecution(
                pg,
                processedCount,
                startLoadedAt ?? endLoadedAt,
                endLoadedAt,
            );
            if (!res.success) throw res.error;
        }
    }

    private async computeNetWorth() {
        const g = this.gremlin.traversal;
        const persons = (await g
            .V()
            .hasLabel(PersonLabel)
            .toList()) as PersonType[];
        for (const p of persons) {
            const sum = await g
                .V(p.id)
                .out(BankAccountOwnerConnection)
                .values("balanceCents")
                .sum()
                .next();
            const value = Number(sum.value);
            await g.V(p.id).property("netWorthCents", value).iterate();
        }
    }

    private async computeBorrowable() {
        const g = this.gremlin.traversal;
        const persons = (await g
            .V()
            .hasLabel(PersonLabel)
            .toList()) as PersonType[];
        for (const p of persons) {
            const myBalance = (
                await g
                    .V(p.id)
                    .out(BankAccountOwnerConnection)
                    .values("balanceCents")
                    .sum()
                    .next()
            ).value as number;

            const friendMax = (
                await g
                    .V(p.id)
                    .out(FriendshipConnection)
                    .out(BankAccountOwnerConnection)
                    .values("balanceCents")
                    .max()
                    .next()
            ).value as number | undefined;

            const friendMaxNum = typeof friendMax === "number" ? friendMax : 0;
            const borrowable = calculateLoan(myBalance, friendMaxNum);
            await g
                .V(p.id)
                .property("maxBorrowableCents", borrowable)
                .iterate();
        }
    }
}
