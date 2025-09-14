import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { TransactionsService } from "@/transactions/transactions.service.js";
import { TransactionEntity } from "@scalara/db";

@ApiTags("transactions")
@Controller("transactions")
export class TransactionsController {
    constructor(
        @Inject(TransactionsService)
        private readonly transactions: TransactionsService,
    ) {}

    @Get()
    @ApiQuery({ name: "iban", required: false })
    @ApiQuery({ name: "from", required: false, description: "ISO date" })
    @ApiQuery({ name: "to", required: false, description: "ISO date" })
    @ApiOkResponse({ type: [TransactionEntity] })
    async list(
        @Query("iban") iban?: string,
        @Query("from") from?: string,
        @Query("to") to?: string,
    ) {
        const fromDate = from ? new Date(from) : undefined;
        const toDate = to ? new Date(to) : undefined;
        return this.transactions.list({ iban, from: fromDate, to: toDate });
    }

    @Get(":id")
    @ApiOkResponse({ type: TransactionEntity })
    async get(@Param("id") id: string) {
        return this.transactions.get(id);
    }
}
