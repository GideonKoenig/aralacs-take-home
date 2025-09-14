import {
    Controller,
    Get,
    Inject,
    Param,
    ParseIntPipe,
    NotFoundException,
} from "@nestjs/common";
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiParam,
    ApiTags,
    ApiBadRequestResponse,
} from "@nestjs/swagger";
import { AccountsService } from "@/accounts/accounts.service.js";
import { BankAccountDto } from "@scalara/db";
import { IbanParamDto } from "@/accounts/accounts.dtos.js";

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
    @ApiBadRequestResponse({ description: "Invalid id" })
    async listByPerson(@Param("id", ParseIntPipe) id: number) {
        return this.accounts.listByPerson(id);
    }

    @Get("iban/:iban")
    @ApiParam({ name: "iban", type: String })
    @ApiOkResponse({ type: BankAccountDto })
    @ApiNotFoundResponse({ description: "Bank account not found" })
    async get(@Param() params: IbanParamDto) {
        const { iban } = params;
        const res = await this.accounts.getByIban(iban);
        if (!res) throw new NotFoundException("Bank account not found");
        return res;
    }
}
