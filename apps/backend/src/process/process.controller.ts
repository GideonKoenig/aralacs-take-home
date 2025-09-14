import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
} from "@nestjs/common";
import { ProcessService } from "@/process/process.service.js";

type BodyDto = { process_id: 1 | 2 | 3 };

@Controller("webhook")
export class ProcessController {
    constructor(
        @Inject(ProcessService) private readonly service: ProcessService,
    ) {}

    @Post("process")
    @HttpCode(HttpStatus.ACCEPTED)
    async trigger(@Body() body: BodyDto) {
        const id = body.process_id;
        await this.service.run(id);
        return { ok: true } as const;
    }
}
