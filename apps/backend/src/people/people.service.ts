import { Inject, Injectable } from "@nestjs/common";
import { GremlinService } from "@/db/gremlin.service.js";
import {
    FriendshipConnection,
    PersonEntity,
    PersonLabel,
    PersonType,
} from "@scalara/db";
import { parseElementMaps, parseElementMapValue } from "@/lib/utils.js";
import gremlin from "gremlin";
const { process: gprocess } = gremlin;
const { statics: __ } = gprocess;

@Injectable()
export class PeopleService {
    constructor(
        @Inject(GremlinService) private readonly gremlin: GremlinService,
    ) {}

    async listPeople(): Promise<PersonType[]> {
        const g = this.gremlin.traversal;
        const traverserList = await g
            .V()
            .hasLabel(PersonLabel)
            .project(
                "id",
                "name",
                "email",
                "maxBorrowableCents",
                "netWorthCents",
            )
            .by("id")
            .by("name")
            .by("email")
            .by(__.coalesce(__.values("maxBorrowableCents"), __.constant(null)))
            .by(__.coalesce(__.values("netWorthCents"), __.constant(null)))
            .toList();
        const result = parseElementMaps(traverserList, PersonEntity);
        if (!result.success) {
            throw new Error(result.error);
        }
        return result.unwrap();
    }

    async getPerson(id: number): Promise<PersonType | null> {
        const g = this.gremlin.traversal;
        const result = await g
            .V()
            .hasLabel(PersonLabel)
            .has("id", id)
            .project(
                "id",
                "name",
                "email",
                "maxBorrowableCents",
                "netWorthCents",
            )
            .by("id")
            .by("name")
            .by("email")
            .by(__.coalesce(__.values("maxBorrowableCents"), __.constant(null)))
            .by(__.coalesce(__.values("netWorthCents"), __.constant(null)))
            .next();
        console.log("result", result);
        const parsed = parseElementMapValue(result, PersonEntity);
        if (!parsed.success) {
            throw new Error(parsed.error);
        }
        return parsed.unwrap();
    }

    async listFriends(id: number): Promise<PersonType[]> {
        const g = this.gremlin.traversal;
        const result = await g
            .V()
            .hasLabel(PersonLabel)
            .has("id", id)
            .out(FriendshipConnection)
            .project(
                "id",
                "name",
                "email",
                "maxBorrowableCents",
                "netWorthCents",
            )
            .by("id")
            .by("name")
            .by("email")
            .by(__.coalesce(__.values("maxBorrowableCents"), __.constant(null)))
            .by(__.coalesce(__.values("netWorthCents"), __.constant(null)))
            .toList();
        const parsed = parseElementMaps(result, PersonEntity);
        if (!parsed.success) {
            throw new Error(parsed.error);
        }
        return parsed.unwrap();
    }
}
