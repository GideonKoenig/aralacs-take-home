import { Inject, Injectable } from "@nestjs/common";
import { GremlinService } from "@/db/gremlin.service.js";
import gremlin from "gremlin";
import {
    BankAccountEntity,
    BankAccountLabel,
    BankAccountOwnerConnection,
    PersonLabel,
} from "@scalara/db";
import { parseElementMaps, parseElementMapValue } from "@/lib/utils.js";

const { process: gprocess } = gremlin;
const { statics: __ } = gprocess;

@Injectable()
export class AccountsService {
    constructor(
        @Inject(GremlinService) private readonly gremlin: GremlinService,
    ) {}

    async listByPerson(personId: number) {
        const g = this.gremlin.traversal;
        const result = await g
            .V()
            .hasLabel(PersonLabel)
            .has("id", personId)
            .out(BankAccountOwnerConnection)
            .project("iban", "balanceCents", "personId")
            .by("iban")
            .by("balanceCents")
            .by(__.constant(personId))
            .toList();
        const parsed = parseElementMaps(result, BankAccountEntity);
        if (!parsed.success) {
            throw new Error(parsed.error);
        }
        return parsed.data;
    }

    async listAll() {
        const g = this.gremlin.traversal;
        const result = await g
            .V()
            .hasLabel(BankAccountLabel)
            .project("iban", "balanceCents", "personId")
            .by("iban")
            .by("balanceCents")
            .by(__.in_(BankAccountOwnerConnection).values("id").limit(1))
            .toList();
        const parsed = parseElementMaps(result, BankAccountEntity);
        if (!parsed.success) {
            throw new Error(parsed.error);
        }
        return parsed.data;
    }

    async getByIban(iban: string) {
        const g = this.gremlin.traversal;
        const result = await g
            .V()
            .has(BankAccountLabel, "iban", iban)
            .limit(1)
            .project("iban", "balanceCents", "personId")
            .by("iban")
            .by("balanceCents")
            .by(__.in_(BankAccountOwnerConnection).values("id").limit(1))
            .next();
        const parsed = parseElementMapValue(result, BankAccountEntity);
        if (!parsed.success) {
            throw new Error(parsed.error);
        }
        return parsed.data;
    }
}
