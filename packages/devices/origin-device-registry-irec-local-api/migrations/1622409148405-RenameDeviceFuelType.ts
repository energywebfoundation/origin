import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameDeviceFuelType1622409148405 implements MigrationInterface {
    name = 'RenameDeviceFuelType1622409148405';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" RENAME COLUMN "fuel" TO "fuelType"`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ALTER COLUMN "subregion" SET DEFAULT ''`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ALTER COLUMN "subregion" DROP DEFAULT`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" RENAME COLUMN "fuelType" TO "fuel"`
        );
    }
}
