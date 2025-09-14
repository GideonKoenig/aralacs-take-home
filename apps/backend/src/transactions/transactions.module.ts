import { Module } from "@nestjs/common";
import { TransactionsService } from "@/transactions/transactions.service.js";
import { TransactionsController } from "@/transactions/transactions.controller.js";
import { PostgresModule } from "@/db/postgres.module.js";

@Module({
    imports: [PostgresModule],
    providers: [TransactionsService],
    controllers: [TransactionsController],
})
export class TransactionsModule {}
