import { MigrationInterface, QueryRunner } from 'typeorm';

export class DefaultDeviceStatus1614160908509 implements MigrationInterface {
    name = 'DefaultDeviceStatus1614160908509';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ALTER COLUMN "status" SET DEFAULT 'Draft'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ALTER COLUMN "status" SET DEFAULT 'Submitted'`
        );
    }
}
