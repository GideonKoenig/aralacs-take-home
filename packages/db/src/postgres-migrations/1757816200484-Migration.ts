import { type MigrationInterface, type QueryRunner } from "typeorm";

export class Migration1757816200484 implements MigrationInterface {
    name = "Migration1757816200484";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "public"."IDX_cf14afb44e071d77d322fbc1e7"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP COLUMN "fromIban"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP COLUMN "toIban"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD "accountIban" character varying(34) NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD "counterpartyIban" character varying(34) NOT NULL`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_afe306d3b223d7d9166936a31a" ON "transactions" ("accountIban") `,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "public"."IDX_afe306d3b223d7d9166936a31a"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP COLUMN "counterpartyIban"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP COLUMN "accountIban"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD "toIban" character varying(34) NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD "fromIban" character varying(34) NOT NULL`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_cf14afb44e071d77d322fbc1e7" ON "transactions" ("fromIban") `,
        );
    }
}
