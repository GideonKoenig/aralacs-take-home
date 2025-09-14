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
    ApiBadRequestResponse,
    ApiOkResponse,
    ApiParam,
    ApiTags,
} from "@nestjs/swagger";
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
    @ApiBadRequestResponse({ description: "Invalid id" })
    @ApiNotFoundResponse({ description: "Person not found" })
    async get(@Param("id", ParseIntPipe) id: number) {
        const result = await this.people.getPerson(id);
        if (!result) throw new NotFoundException("Person not found");
        return result;
    }

    @Get(":id/friends")
    @ApiParam({ name: "id", type: Number })
    @ApiOkResponse({ type: [PersonDto] })
    @ApiBadRequestResponse({ description: "Invalid id" })
    async friends(@Param("id", ParseIntPipe) id: number) {
        return this.people.listFriends(id);
    }
}
