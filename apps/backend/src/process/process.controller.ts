import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
} from "@nestjs/common";
import { ProcessService } from "@/process/process.service.js";
import { TriggerProcessRequest } from "@/process/process.dto.js";
import { ApiBody } from "@nestjs/swagger";

@Controller("process")
export class ProcessController {
    constructor(
        @Inject(ProcessService) private readonly service: ProcessService,
    ) {}

    @Post()
    @ApiBody({ type: TriggerProcessRequest })
    @HttpCode(HttpStatus.ACCEPTED)
    async trigger(@Body() body: TriggerProcessRequest) {
        await this.service.run(body.processId);
        return { ok: true } as const;
    }
}
