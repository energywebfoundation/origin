import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeviceStatusToString1606382412522 implements MigrationInterface {
    name = 'DeviceStatusToString1606382412522';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "status"`);
        await queryRunner.query(
            `ALTER TABLE "device" ADD "status" character varying NOT NULL DEFAULT 'Submitted'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "device" ADD "status" integer NOT NULL`);
    }
}
