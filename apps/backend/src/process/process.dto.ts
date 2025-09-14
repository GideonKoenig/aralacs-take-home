import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";
import z from "zod";

export const BodySchema = z.object({ processId: z.enum(["1", "2", "3"]) });
export type BodyType = z.infer<typeof BodySchema>;

export class BodyDto {
    @ApiProperty({ enum: ["1", "2", "3"] })
    @IsIn(["1", "2", "3"])
    processId!: BodyType;
}
