import { Module } from "@nestjs/common";
import { ProcessService } from "@/process/process.service.js";
import { ProcessController } from "@/process/process.controller.js";
import { GremlinModule } from "@/db/gremlin.module.js";
import { PostgresModule } from "@/db/postgres.module.js";

@Module({
    imports: [GremlinModule, PostgresModule],
    providers: [ProcessService],
    controllers: [ProcessController],
})
export class ProcessModule {}
