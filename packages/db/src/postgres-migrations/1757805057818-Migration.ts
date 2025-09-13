import { type MigrationInterface, type QueryRunner } from "typeorm";

export class Migration1757805057818 implements MigrationInterface {
    name = "Migration1757805057818";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fromIban" character varying(34) NOT NULL, "toIban" character varying(34) NOT NULL, "amount" integer NOT NULL, "isPositive" boolean NOT NULL, "loadedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_cf14afb44e071d77d322fbc1e7" ON "transactions" ("fromIban") `,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "public"."IDX_cf14afb44e071d77d322fbc1e7"`,
        );
        await queryRunner.query(`DROP TABLE "transactions"`);
    }
}
