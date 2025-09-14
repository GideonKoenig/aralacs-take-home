import { env } from "@/env.js";
import { Injectable, Inject } from "@nestjs/common";
import { initializePostgres } from "@scalara/db/postgres";
import { getSharedNumber } from "@scalara/shared/shared-number";
import { GremlinService } from "@/gremlin.service.js";

@Injectable()
export class AppService {
    constructor(
        @Inject(GremlinService) private readonly gremlin: GremlinService,
    ) {}

    async getHello(): Promise<string> {
        const response = [];
        response.push("Hello World from NestJs.");

        const sharedNumber = getSharedNumber(env);
        response.push(`The shared number is ${sharedNumber}.`);

        response.push(`env: ${JSON.stringify(env)}`);

        const dataSource = await initializePostgres(env);
        const tables = await dataSource.query<{ table_name: string }>(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);
        response.push(`The tables are ${JSON.stringify(tables)}`);

        const persons = await this.gremlin.getAllPersons();
        response.push(`The gremlin is ${persons.length}.`);

        return response.join("\n");
    }
}
