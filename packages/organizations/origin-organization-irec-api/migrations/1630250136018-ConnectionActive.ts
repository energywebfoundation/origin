import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConnectionActive1630250136018 implements MigrationInterface {
    name = 'ConnectionActive1630250136018';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_connection" ADD "active" boolean NOT NULL DEFAULT true`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "irec_connection" DROP COLUMN "active"`);
    }
}
