import { createZodDto } from "@anatine/zod-nestjs";
import z from "zod";

export declare const PersonLabel: "person";
export const PersonEntity = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    maxBorrowableCents: z.number().optional(),
});
export type PersonType = z.infer<typeof PersonEntity>;
export class PersonDto extends createZodDto(PersonEntity) {}

export declare const BankAccountLabel: "bankaccount";
export const BankAccountEntity = z.object({
    vertexId: z.number(),
    iban: z.string(),
    balanceCents: z.number(),
    personId: z.number(),
});
export type BankAccountType = z.infer<typeof BankAccountEntity>;
export class BankAccountDto extends createZodDto(BankAccountEntity) {}

export declare const FriendshipConnection: "has_friend";
export declare const BankAccountOwnerConnection: "has_bankaccount";
