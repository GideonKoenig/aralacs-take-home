import { Inject, Injectable } from "@nestjs/common";
import { GremlinService } from "@/db/gremlin.service.js";
import gremlin from "gremlin";
import {
    BankAccountLabel,
    BankAccountOwnerConnection,
    BankAccountType,
    PersonLabel,
} from "@scalara/db";

const { process: gprocess } = gremlin;
const { statics: __ } = gprocess;

@Injectable()
export class AccountsService {
    constructor(
        @Inject(GremlinService) private readonly gremlin: GremlinService,
    ) {}

    async listByPerson(personId: number) {
        const g = this.gremlin.traversal;
        return (await g
            .V(personId)
            .hasLabel(PersonLabel)
            .out(BankAccountOwnerConnection)
            .project("iban", "balanceCents")
            .by("iban")
            .by("balanceCents")
            .toList()) as BankAccountType[];
    }

    async getByIban(iban: string) {
        const g = this.gremlin.traversal;
        return (await g
            .V()
            .hasLabel(BankAccountLabel)
            .has("iban", iban)
            .project("vertexId", "iban", "balanceCents", "personId")
            .by("vertexId")
            .by("iban")
            .by("balanceCents")
            .by(__.in_(BankAccountOwnerConnection).values("id").limit(1))
            .next()) as { value?: BankAccountType };
    }
}
