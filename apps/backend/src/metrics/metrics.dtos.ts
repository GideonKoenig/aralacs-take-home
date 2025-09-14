import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({ name: "NetWorth" })
export class NetWorthDto {
    @ApiProperty({ type: Number })
    personId!: number;

    @ApiProperty({ type: Number })
    netWorthCents!: number;
}

@ApiSchema({ name: "Borrowable" })
export class BorrowableDto {
    @ApiProperty({ type: Number })
    personId!: number;

    @ApiProperty({ type: Number })
    borrowableCents!: number;
}
