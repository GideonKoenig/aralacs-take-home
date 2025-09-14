import { Controller, Get, Param, ParseIntPipe, Inject } from "@nestjs/common";
import { ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { MetricsService } from "@/metrics/metrics.service.js";
import { BorrowableDto, NetWorthDto } from "@/metrics/metrics.dtos.js";

@ApiTags("metrics")
@Controller("metrics")
export class MetricsController {
    constructor(
        @Inject(MetricsService) private readonly metrics: MetricsService,
    ) {}

    @Get("people/:id/net-worth")
    @ApiParam({ name: "id", type: Number })
    @ApiOkResponse({ type: NetWorthDto })
    async netWorth(@Param("id", ParseIntPipe) id: number) {
        return this.metrics.netWorth(id);
    }

    @Get("people/:id/borrowable")
    @ApiParam({ name: "id", type: Number })
    @ApiOkResponse({ type: BorrowableDto })
    async borrowable(@Param("id", ParseIntPipe) id: number) {
        return this.metrics.borrowable(id);
    }
}
