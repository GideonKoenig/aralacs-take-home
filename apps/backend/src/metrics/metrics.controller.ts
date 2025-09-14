import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { MetricsService } from "@/metrics/metrics.service.js";
import { BorrowableDto, NetWorthDto } from "@/metrics/dtos.js";

@ApiTags("metrics")
@Controller("metrics")
export class MetricsController {
    constructor(private readonly metrics: MetricsService) {}

    @Get("people/:id/net-worth")
    @ApiOkResponse({ type: NetWorthDto })
    async netWorth(@Param("id", ParseIntPipe) id: number) {
        return this.metrics.netWorth(id);
    }

    @Get("people/:id/borrowable")
    @ApiOkResponse({ type: BorrowableDto })
    async borrowable(@Param("id", ParseIntPipe) id: number) {
        return this.metrics.borrowable(id);
    }
}
