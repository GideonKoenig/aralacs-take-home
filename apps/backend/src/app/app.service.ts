import { Injectable, Inject } from "@nestjs/common";
import { GremlinService } from "@/db/gremlin.service.js";
import { PostgresService } from "@/db/postgres.service.js";

@Injectable()
export class AppService {
    constructor(
        @Inject(GremlinService) private readonly gremlin: GremlinService,
        @Inject(PostgresService) private readonly postgres: PostgresService,
    ) {}

    async getHello(): Promise<string> {
        const response = [];
        response.push("Hello World from NestJs.");

        const tableCount = await this.postgres.get().query<{
            table_name: string;
        }>(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);
        response.push(`The tables are ${Object.keys(tableCount).length}.`);

        const persons = await this.gremlin.traversal
            .V()
            .hasLabel("person")
            .values("name")
            .toList();
        response.push(`The gremlin is ${persons.length}.`);

        return response.join("\n");
    }
}
