import {
    Controller,
    Get,
    Inject,
    Param,
    Query,
    NotFoundException,
    ParseUUIDPipe,
} from "@nestjs/common";
import {
    ApiOkResponse,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
} from "@nestjs/swagger";
import { TransactionsService } from "@/transactions/transactions.service.js";
import { TransactionDto } from "@/transactions/transactions.dto.js";
import { TransactionsQueryDto } from "@/transactions/transactions.query.dto.js";

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
    @ApiOkResponse({ type: [TransactionDto] })
    @ApiBadRequestResponse({ description: "Invalid query params" })
    async list(
        @Query() query: TransactionsQueryDto,
    ): Promise<TransactionDto[]> {
        return this.transactions.list(query);
    }

    @Get(":id")
    @ApiParam({
        name: "id",
        type: String,
        description: "Transaction ID (uuid)",
    })
    @ApiOkResponse({ type: TransactionDto })
    @ApiNotFoundResponse({ description: "Transaction not found" })
    @ApiBadRequestResponse({ description: "Invalid id" })
    async get(
        @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    ): Promise<TransactionDto> {
        const tx = await this.transactions.get(id);
        if (!tx) throw new NotFoundException("Transaction not found");
        return tx;
    }
}
