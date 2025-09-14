import { Module } from "@nestjs/common";
import { AccountsService } from "@/accounts/accounts.service.js";
import { AccountsController } from "@/accounts/accounts.controller.js";
import { GremlinModule } from "@/db/gremlin.module.js";

@Module({
    imports: [GremlinModule],
    providers: [AccountsService],
    controllers: [AccountsController],
})
export class AccountsModule {}
