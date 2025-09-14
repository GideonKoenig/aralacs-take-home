import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({ name: "Transaction" })
export class TransactionDto {
    @ApiProperty({ type: String, format: "uuid" })
    id!: string;

    @ApiProperty({ type: String })
    accountIban!: string;

    @ApiProperty({ type: String })
    counterpartyIban!: string;

    @ApiProperty({ type: Number })
    amount!: number;

    @ApiProperty({ enum: ["debit", "credit"] })
    direction!: "debit" | "credit";

    @ApiProperty({ type: String, format: "date-time" })
    loadedAt!: Date;
}
