import { Controller, Get, Inject, Param, ParseIntPipe } from "@nestjs/common";
import { ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { AccountsService } from "@/accounts/accounts.service.js";
import { BankAccountDto } from "@scalara/db";

@ApiTags("accounts")
@Controller("accounts")
export class AccountsController {
    constructor(
        @Inject(AccountsService) private readonly accounts: AccountsService,
    ) {}

    @Get()
    @ApiOkResponse({ type: [BankAccountDto] })
    async listAll() {
        return this.accounts.listAll();
    }

    @Get("person/:id")
    @ApiParam({ name: "id", type: Number })
    @ApiOkResponse({ type: [BankAccountDto] })
    async listByPerson(@Param("id", ParseIntPipe) id: number) {
        return this.accounts.listByPerson(id);
    }

    @Get(":iban")
    @ApiParam({ name: "iban", type: String })
    @ApiOkResponse({ type: BankAccountDto })
    async get(@Param("iban") iban: string) {
        const res = await this.accounts.getByIban(iban);
        return res;
    }
}
