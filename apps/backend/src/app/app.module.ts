import { Module } from "@nestjs/common";
import { AppController } from "@/app/app.controller.js";
import { AppService } from "@/app/app.service.js";
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
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
