import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
} from "@nestjs/common";
import { ProcessService } from "@/process/process.service.js";
import { BodyDto } from "@/process/process.dto.js";
import { ApiBody } from "@nestjs/swagger";

@Controller("process")
export class ProcessController {
    constructor(
        @Inject(ProcessService) private readonly service: ProcessService,
    ) {}

    @Post()
    @ApiBody({ type: BodyDto })
    @HttpCode(HttpStatus.ACCEPTED)
    async trigger(@Body() body: BodyDto) {
        await this.service.run(body.processId);
        return { ok: true } as const;
    }
}
