import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsISO8601, IsOptional, Matches } from "class-validator";

export class TransactionsQueryDto {
    @ApiPropertyOptional({ description: "Account IBAN" })
    @IsOptional()
    @Matches(/^[A-Za-z0-9]+$/)
    iban?: string;

    @ApiPropertyOptional({
        description: "ISO date (inclusive)",
        type: String,
        format: "date-time",
    })
    @IsOptional()
    @IsISO8601()
    @Type(() => Date)
    from?: Date;

    @ApiPropertyOptional({
        description: "ISO date (inclusive)",
        type: String,
        format: "date-time",
    })
    @IsOptional()
    @IsISO8601()
    @Type(() => Date)
    to?: Date;
}
