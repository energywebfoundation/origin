import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConnectionAttempts1630253190582 implements MigrationInterface {
    name = 'ConnectionAttempts1630253190582';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_connection" ADD "attempts" integer NOT NULL DEFAULT '0'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "irec_connection" DROP COLUMN "attempts"`);
    }
}
