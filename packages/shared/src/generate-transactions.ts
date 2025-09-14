import {
    type initializeGremlin,
    type initializePostgres,
    TransactionEntity,
} from "@scalara/db";
import { Failure, Success, tryCatch } from "@scalara/db/try-catch";

type GremlinConnection = Awaited<ReturnType<typeof initializeGremlin>>;
type PostgresConnection = Awaited<ReturnType<typeof initializePostgres>>;

export async function generateDailyTransactions(
    gremlin: GremlinConnection,
    postgres: PostgresConnection,
    count: number,
) {
    if (!Number.isFinite(count) || count <= 0)
        return new Failure("Count must be a positive integer");

    const g = gremlin.g;

    const ibans = (await g
        .V()
        .hasLabel("bankaccount")
        .values("iban")
        .toList()) as string[];

    if (ibans.length < 2) {
        return new Failure(
            "Need at least two bank accounts to generate transactions",
        );
    }

    const transactions: Omit<TransactionEntity, "id">[] = [];
    const loadedAt = new Date();
    for (let i = 0; i < count; i++) {
        const a = choice(ibans);
        let b = choice(ibans);
        while (b === a) b = choice(ibans);

        const amount = randomInt(1, 100_000);
        const direction = Math.random() < 0.5 ? "debit" : "credit";
        transactions.push({
            accountIban: a,
            counterpartyIban: b,
            amount,
            direction,
            loadedAt,
        });
    }

    const repo = postgres.getRepository(TransactionEntity);
    await repo
        .createQueryBuilder()
        .insert()
        .into(TransactionEntity)
        .values(transactions)
        .execute();

    return new Success({ inserted: transactions.length });
}

export async function clearAllTransactions(postgres: PostgresConnection) {
    const repo = postgres.getRepository(TransactionEntity);
    const result = await tryCatch(repo.clear());
    return result;
}

function choice<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)]!;
}

function randomInt(min: number, max: number) {
    const r = Math.random();
    return Math.floor(r * (max - min + 1)) + min;
}
