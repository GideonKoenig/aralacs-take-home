import { Inject, Injectable } from "@nestjs/common";
import { PostgresService } from "@/db/postgres.service.js";
import { TransactionEntity } from "@scalara/db";

@Injectable()
export class TransactionsService {
    constructor(
        @Inject(PostgresService) private readonly postgres: PostgresService,
    ) {}

    async list(params: { iban?: string; from?: Date; to?: Date }) {
        const pg = this.postgres.get();
        const qb = pg.getRepository(TransactionEntity).createQueryBuilder("t");
        if (params.iban)
            qb.andWhere("t.accountIban = :iban", { iban: params.iban });
        if (params.from)
            qb.andWhere("t.loadedAt >= :from", { from: params.from });
        if (params.to) qb.andWhere("t.loadedAt <= :to", { to: params.to });
        qb.orderBy("t.loadedAt", "ASC");
        return qb.getMany();
    }

    async get(id: string) {
        const pg = this.postgres.get();
        return pg.getRepository(TransactionEntity).findOne({ where: { id } });
    }
}
