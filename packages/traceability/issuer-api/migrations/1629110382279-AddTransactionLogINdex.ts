import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionLogINdex1629110382279 implements MigrationInterface {
    name = 'AddTransactionLogINdex1629110382279';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX "IDX_5b23ec78be49b0a85570e2841c" ON "transaction_log" ("certificateId") `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issuer_certificate" ALTER COLUMN "id" DROP NOT NULL`);
    }
}
