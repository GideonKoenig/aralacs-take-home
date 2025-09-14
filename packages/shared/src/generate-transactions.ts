import { type GremlinConnection, type PostgresConnection } from "@scalara/db";
import { Failure, Success, tryCatch } from "./try-catch.js";

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

    // Note: this duplicates the TypeORM entity shape to avoid class identity issues
    // Ideally, we would import and use the single TransactionEntity, but it's failing for some reason
    type NewTransaction = {
        accountIban: string;
        counterpartyIban: string;
        amount: number;
        direction: "debit" | "credit";
        loadedAt: Date;
    };
    const transactions: NewTransaction[] = [];
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

    const CHUNK_SIZE = 10000;
    await postgres.transaction(async (manager) => {
        for (let start = 0; start < transactions.length; start += CHUNK_SIZE) {
            const chunk = transactions.slice(start, start + CHUNK_SIZE);
            await manager
                .createQueryBuilder()
                .insert()
                .into("transactions")
                .values(chunk)
                .execute();
        }
    });

    return new Success({ inserted: transactions.length });
}

export async function clearAllTransactions(postgres: PostgresConnection) {
    const result = await tryCatch(
        postgres.createQueryBuilder().delete().from("transactions").execute(),
    );
    return result;
}

function choice<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)]!;
}

function randomInt(min: number, max: number) {
    const r = Math.random();
    return Math.floor(r * (max - min + 1)) + min;
}
