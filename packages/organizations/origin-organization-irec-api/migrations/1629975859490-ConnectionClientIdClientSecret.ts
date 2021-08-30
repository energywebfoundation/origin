import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConnectionClientIdClientSecret1629975859490 implements MigrationInterface {
    name = 'ConnectionClientIdClientSecret1629975859490';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_connection" ADD "clientId" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_connection" ADD "clientSecret" character varying NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "irec_connection" DROP COLUMN "clientSecret"`);
        await queryRunner.query(`ALTER TABLE "irec_connection" DROP COLUMN "clientId"`);
    }
}
