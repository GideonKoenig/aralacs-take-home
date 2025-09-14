import { Inject, Injectable } from "@nestjs/common";
import { GremlinService } from "@/db/gremlin.service.js";
import { FriendshipConnection, PersonLabel, PersonType } from "@scalara/db";

@Injectable()
export class PeopleService {
    constructor(
        @Inject(GremlinService) private readonly gremlin: GremlinService,
    ) {}

    async listPeople(): Promise<PersonType[]> {
        const g = this.gremlin.traversal;
        const result = await g
            .V()
            .hasLabel(PersonLabel)
            .project("id", "name", "email")
            .by("id")
            .by("name")
            .by("email")
            .toList();
        return result as PersonType[];
    }

    async getPerson(id: number): Promise<{ value?: PersonType }> {
        const g = this.gremlin.traversal;
        return (await g
            .V(id)
            .hasLabel(PersonLabel)
            .project("id", "name", "email")
            .by("id")
            .by("name")
            .by("email")
            .next()) as { value?: PersonType };
    }

    async listFriends(id: number): Promise<PersonType[]> {
        const g = this.gremlin.traversal;
        const result = await g
            .V(id)
            .hasLabel(PersonLabel)
            .out(FriendshipConnection)
            .project("id", "name", "email")
            .by("id")
            .by("name")
            .by("email")
            .toList();
        return result as PersonType[];
    }
}
