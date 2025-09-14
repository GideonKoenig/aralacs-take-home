import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export class BodyDto {
    @ApiProperty({ enum: ["1", "2", "3"] })
    @IsIn(["1", "2", "3"])
    processId!: "1" | "2" | "3";
}
