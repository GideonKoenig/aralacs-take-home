import { Module } from "@nestjs/common";
import { MetricsService } from "@/metrics/metrics.service.js";
import { MetricsController } from "@/metrics/metrics.controller.js";
import { GremlinModule } from "@/db/gremlin.module.js";

@Module({
    imports: [GremlinModule],
    providers: [MetricsService],
    controllers: [MetricsController],
})
export class MetricsModule {}
