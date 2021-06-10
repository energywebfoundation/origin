import { MigrationInterface, QueryRunner } from 'typeorm';

export class FuelType1622464056793 implements MigrationInterface {
    name = 'FuelType1622464056793';

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
