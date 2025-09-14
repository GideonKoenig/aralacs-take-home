import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { env } from "@/env.js";
import { initializePostgres, type PostgresConnection } from "@scalara/db";

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
    private connection!: PostgresConnection;

    async onModuleInit() {
        this.connection = await initializePostgres(env);
        console.log("[PostgresService] Connected to Postgres");
    }

    async onModuleDestroy() {
        await this.connection.destroy();
        console.log("[PostgresService] Closed connection");
    }

    get() {
        return this.connection;
    }
}
