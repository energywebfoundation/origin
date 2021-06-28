import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeviceActiveField1624862179097 implements MigrationInterface {
    name = 'DeviceActiveField1624862179097';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ADD "active" boolean NOT NULL DEFAULT true`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "irec_device_registry_device" DROP COLUMN "active"`);
    }
}
