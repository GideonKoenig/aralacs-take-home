import z from "zod";
import { ApiProperty, ApiSchema } from "@nestjs/swagger";

export const PersonLabel = "person" as const;
export const PersonEntity = z.object({
    id: z.number().int(),
    name: z.string(),
    email: z.string(),
    maxBorrowableCents: z.number().int().min(0).nullable().optional(),
    netWorthCents: z.number().int().nullable().optional(),
});
export type PersonType = z.infer<typeof PersonEntity>;
@ApiSchema({ name: "Person" })
export class PersonDto {
    @ApiProperty({ type: Number })
    public readonly id: number;

    @ApiProperty({ type: String })
    public readonly name: string;

    @ApiProperty({ type: String })
    public readonly email: string;

    @ApiProperty({ type: Number, nullable: true, required: false })
    public readonly maxBorrowableCents: number | undefined;

    @ApiProperty({ type: Number, nullable: true, required: false })
    public readonly netWorthCents: number | undefined;

    constructor(
        id: number,
        name: string,
        email: string,
        maxBorrowableCents: number | undefined,
        netWorthCents: number | undefined,
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.maxBorrowableCents = maxBorrowableCents;
        this.netWorthCents = netWorthCents;
    }
}

export const BankAccountLabel = "bankaccount" as const;
export const BankAccountEntity = z.object({
    iban: z.string(),
    balanceCents: z.number(),
    personId: z.number(),
});
export type BankAccountType = z.infer<typeof BankAccountEntity>;
@ApiSchema({ name: "BankAccount" })
export class BankAccountDto {
    @ApiProperty({ type: String })
    public readonly iban: string;

    @ApiProperty({ type: Number })
    public readonly balanceCents: number;

    @ApiProperty({ type: Number })
    public readonly personId: number;

    constructor(iban: string, balanceCents: number, personId: number) {
        this.iban = iban;
        this.balanceCents = balanceCents;
        this.personId = personId;
    }
}

export const FriendshipConnection = "has_friend" as const;
export const BankAccountOwnerConnection = "has_bankaccount" as const;
