import { env } from "@/env.js";
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { initializeGremlin, type GremlinConnection } from "@scalara/db";

@Injectable()
export class GremlinService implements OnModuleInit, OnModuleDestroy {
    private connection: GremlinConnection | undefined;

    async onModuleInit() {
        this.connection = await initializeGremlin(env);
        console.log("[GremlinService] Connected to Gremlin");
    }

    async onModuleDestroy() {
        if (!this.connection) return;
        await this.connection.close();
        console.log("[GremlinService] Closed connection");
    }

    get traversal() {
        if (!this.connection) {
            throw new Error("Gremlin connection has not been initialized");
        }
        return this.connection.g;
    }
}
