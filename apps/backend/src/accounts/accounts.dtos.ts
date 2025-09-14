import { ApiProperty } from "@nestjs/swagger";
import { Matches } from "class-validator";

export class IbanParamDto {
    @ApiProperty({ description: "Account IBAN" })
    @Matches(/^[A-Za-z0-9]+$/)
    iban!: string;
}
