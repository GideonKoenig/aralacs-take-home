import { Module } from "@nestjs/common";
import { PostgresService } from "@/db/postgres.service.js";

@Module({
    providers: [PostgresService],
    exports: [PostgresService],
})
export class PostgresModule {}
