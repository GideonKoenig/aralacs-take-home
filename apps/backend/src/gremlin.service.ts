import { env } from "@/env.js";
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { initializeGremlin, type GremlinConnection } from "@scalara/db";

@Injectable()
export class GremlinService implements OnModuleInit, OnModuleDestroy {
    private connection!: GremlinConnection;

    async onModuleInit() {
        this.connection = await initializeGremlin(env);
        console.log("[GremlinService] Connected to Gremlin");
    }

    async onModuleDestroy() {
        await this.connection.close();
        console.log("[GremlinService] Closed connection");
    }

    get traversal() {
        return this.connection.g;
    }

    async getAllPersons() {
        return this.connection.g.V().hasLabel("person").values("name").toList();
    }
}
