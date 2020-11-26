import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeviceStatusToString1606381512317 implements MigrationInterface {
    name = 'DeviceStatusToString1606381512317';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "device" ADD "status" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "device" ADD "status" integer NOT NULL`);
    }
}
