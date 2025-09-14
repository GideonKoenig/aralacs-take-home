import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { env } from "@/env.js";
import { initializePostgres, type PostgresConnection } from "@scalara/db";

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
    private connection: PostgresConnection | undefined;

    async onModuleInit() {
        this.connection = await initializePostgres(env);
        console.log("[PostgresService] Connected to Postgres");
    }

    async onModuleDestroy() {
        if (!this.connection) return;
        await this.connection.destroy();
        console.log("[PostgresService] Closed connection");
    }

    get() {
        if (!this.connection) {
            throw new Error("Postgres connection has not been initialized");
        }
        return this.connection;
    }
}
