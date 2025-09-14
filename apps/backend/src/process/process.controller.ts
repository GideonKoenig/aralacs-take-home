import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
} from "@nestjs/common";
import { ProcessService } from "@/process/process.service.js";
import { BodyDto, BodySchema } from "@/process/process.dto.js";
import { ApiBody } from "@nestjs/swagger";

@Controller("process")
export class ProcessController {
    constructor(
        @Inject(ProcessService) private readonly service: ProcessService,
    ) {}

    @Post()
    @ApiBody({
        schema: {
            type: "object",
            properties: { processId: { enum: ["1", "2", "3"] } },
        },
    })
    @HttpCode(HttpStatus.ACCEPTED)
    async trigger(@Body() body: BodyDto) {
        const id = BodySchema.safeParse(body);
        if (!id.success) {
            throw new BadRequestException("Invalid process ID");
        }
        await this.service.run(id.data.processId);
        return { ok: true } as const;
    }
}
