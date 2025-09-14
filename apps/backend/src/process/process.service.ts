import { Injectable, Inject } from "@nestjs/common";
import { GremlinService } from "@/db/gremlin.service.js";
import {
    BankAccountLabel,
    BankAccountOwnerConnection,
    FriendshipConnection,
    PersonLabel,
    TransactionEntity,
    type PostgresConnection,
} from "@scalara/db";
import {
    getLastProcessExecution,
    logProcessExecution,
} from "@scalara/shared/log-process-call";
import { PostgresService } from "@/db/postgres.service.js";
import { calculateBorrowAmount, parseElementMaps } from "@/lib/utils.js";
import gremlin from "gremlin";
import z from "zod";
const { process: gprocess } = gremlin;
const { statics: __ } = gprocess;

@Injectable()
export class ProcessService {
    constructor(
        @Inject(GremlinService) private readonly gremlin: GremlinService,
        @Inject(PostgresService) private readonly postgres: PostgresService,
    ) {}

    async run(processId: "1" | "2" | "3") {
        const pg = this.postgres.get();
        if (processId >= "1") await this.aggregateTransactions(pg);
        if (processId >= "2") await this.computeNetWorth();
        if (processId >= "3") await this.computeBorrowable();
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
                    __.project("old", "delta")
                        .by(
                            __.coalesce(
                                __.values("balanceCents"),
                                __.constant(0),
                            ),
                        )
                        .by(__.constant(delta))
                        .math("old + delta"),
                )
                .iterate();
        }

        const processedCount = Number(stats?.count ?? 0);
        const startLoadedAt = stats?.min ? new Date(stats.min) : null;
        const endLoadedAt = stats?.max ? new Date(stats.max) : null;

        console.log(`Processed ${processedCount} transactions`);

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
        const results = (await g
            .V()
            .hasLabel(PersonLabel)
            .project("id", "netWorthCents")
            .by("id")
            .by(__.out(BankAccountOwnerConnection).values("balanceCents").sum())
            .toList()) as Map<string, unknown>[];
        const parsed = parseElementMaps(
            results,
            z.object({
                id: z.number(),
                netWorthCents: z.number(),
            }),
        );
        if (!parsed.success) {
            throw new Error(parsed.error);
        }
        const persons = parsed.unwrap();

        for (const row of persons) {
            const personId = row.id;
            const netWorth = row.netWorthCents;
            await g
                .V()
                .has(PersonLabel, "id", personId)
                .property("netWorthCents", netWorth)
                .iterate();
        }
    }

    private async computeBorrowable() {
        const g = this.gremlin.traversal;
        const results = (await g
            .V()
            .hasLabel(PersonLabel)
            .project("id", "myBalanceCents", "friendMaxCents")
            .by("id")
            .by(
                __.coalesce(
                    __.out(BankAccountOwnerConnection)
                        .values("balanceCents")
                        .sum(),
                    __.constant(0),
                ),
            )
            .by(
                __.coalesce(
                    __.out(FriendshipConnection)
                        .map(
                            __.coalesce(
                                __.out(BankAccountOwnerConnection)
                                    .values("balanceCents")
                                    .sum(),
                                __.constant(0),
                            ),
                        )
                        .max(),
                    __.constant(0),
                ),
            )
            .toList()) as Map<string, unknown>[];

        const parsed = parseElementMaps(
            results,
            z.object({
                id: z.number(),
                myBalanceCents: z.number(),
                friendMaxCents: z.number(),
            }),
        );
        if (!parsed.success) throw new Error(parsed.error);
        const persons = parsed.unwrap();

        for (const row of persons) {
            const myBalance = row.myBalanceCents;
            const friendMax = row.friendMaxCents;
            const borrowable = calculateBorrowAmount(myBalance, friendMax);
            await g
                .V()
                .has(PersonLabel, "id", row.id)
                .property("maxBorrowableCents", borrowable)
                .iterate();
        }
    }
}
