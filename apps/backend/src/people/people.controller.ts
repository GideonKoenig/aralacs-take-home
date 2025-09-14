import { Controller, Get, Inject, Param, ParseIntPipe } from "@nestjs/common";
import { ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { PersonDto } from "@scalara/db";
import { PeopleService } from "@/people/people.service.js";

@ApiTags("people")
@Controller("people")
export class PeopleController {
    constructor(
        @Inject(PeopleService)
        private readonly people: PeopleService,
    ) {}

    @Get()
    @ApiOkResponse({ type: [PersonDto] })
    async list() {
        return this.people.listPeople();
    }

    @Get(":id")
    @ApiParam({ name: "id", type: Number })
    @ApiOkResponse({ type: PersonDto })
    async get(@Param("id", ParseIntPipe) id: number) {
        const result = await this.people.getPerson(id);
        console.log("result", result);
        return result;
    }

    @Get(":id/friends")
    @ApiParam({ name: "id", type: Number })
    @ApiOkResponse({ type: [PersonDto] })
    async friends(@Param("id", ParseIntPipe) id: number) {
        return this.people.listFriends(id);
    }
}
