import { type MigrationInterface, type QueryRunner } from "typeorm";

export class Migration1757816390105 implements MigrationInterface {
    name = "Migration1757816390105";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "transactions" RENAME COLUMN "isPositive" TO "direction"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP COLUMN "direction"`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."transactions_direction_enum" AS ENUM('debit', 'credit')`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD "direction" "public"."transactions_direction_enum" NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP COLUMN "direction"`,
        );
        await queryRunner.query(
            `DROP TYPE "public"."transactions_direction_enum"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD "direction" boolean NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" RENAME COLUMN "direction" TO "isPositive"`,
        );
    }
}
