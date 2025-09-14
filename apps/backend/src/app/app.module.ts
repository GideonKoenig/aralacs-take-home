import { Module } from "@nestjs/common";
import { GremlinModule } from "@/db/gremlin.module.js";
import { ProcessModule } from "@/process/process.module.js";
import { PostgresModule } from "@/db/postgres.module.js";
import { PeopleModule } from "@/people/people.module.js";
import { AccountsModule } from "@/accounts/accounts.module.js";
import { MetricsModule } from "@/metrics/metrics.module.js";
import { TransactionsModule } from "@/transactions/transactions.module.js";

@Module({
    imports: [
        GremlinModule,
        PostgresModule,
        ProcessModule,
        PeopleModule,
        AccountsModule,
        MetricsModule,
        TransactionsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
