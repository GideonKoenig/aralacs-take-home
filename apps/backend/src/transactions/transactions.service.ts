import { Inject, Injectable } from "@nestjs/common";
import { PostgresService } from "@/db/postgres.service.js";
import { TransactionEntity } from "@scalara/db";
import { TransactionDto } from "@/transactions/transactions.dto.js";

@Injectable()
export class TransactionsService {
    constructor(
        @Inject(PostgresService) private readonly postgres: PostgresService,
    ) {}

    async list(params: {
        iban?: string;
        from?: Date;
        to?: Date;
    }): Promise<TransactionDto[]> {
        const pg = this.postgres.get();
        const qb = pg.getRepository(TransactionEntity).createQueryBuilder("t");
        if (params.iban)
            qb.andWhere("t.accountIban = :iban", { iban: params.iban });
        if (params.from)
            qb.andWhere("t.loadedAt >= :from", { from: params.from });
        if (params.to) qb.andWhere("t.loadedAt <= :to", { to: params.to });
        qb.orderBy("t.loadedAt", "ASC");
        const rows = await qb.getMany();
        return rows.map((r) => this.toDto(r));
    }

    async get(id: string): Promise<TransactionDto | null> {
        const pg = this.postgres.get();
        const row = await pg
            .getRepository(TransactionEntity)
            .findOne({ where: { id } });
        return row ? this.toDto(row) : null;
    }

    private toDto(row: TransactionEntity): TransactionDto {
        return {
            id: row.id,
            accountIban: row.accountIban,
            counterpartyIban: row.counterpartyIban,
            amount: row.amount,
            direction: row.direction,
            loadedAt: row.loadedAt,
        };
    }
}
