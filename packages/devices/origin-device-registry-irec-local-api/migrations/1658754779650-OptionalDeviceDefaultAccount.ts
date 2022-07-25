import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptionalDeviceDefaultAccount1658754779650 implements MigrationInterface {
    name = 'OptionalDeviceDefaultAccount1658754779650';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ALTER COLUMN "defaultAccount" DROP NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ALTER COLUMN "defaultAccount" SET NOT NULL`
        );
    }
}
