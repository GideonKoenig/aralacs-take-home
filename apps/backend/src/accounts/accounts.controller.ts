import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AccountsService } from "@/accounts/accounts.service.js";
import { BankAccountDto } from "@scalara/db";

@ApiTags("accounts")
@Controller("accounts")
export class AccountsController {
    constructor(private readonly accounts: AccountsService) {}

    @Get("person/:id")
    @ApiOkResponse({ type: [BankAccountDto] })
    async listByPerson(@Param("id", ParseIntPipe) id: number) {
        return this.accounts.listByPerson(id);
    }

    @Get(":iban")
    @ApiOkResponse({ type: BankAccountDto })
    async get(@Param("iban") iban: string) {
        const res = await this.accounts.getByIban(iban);
        return res.value ?? null;
    }
}
