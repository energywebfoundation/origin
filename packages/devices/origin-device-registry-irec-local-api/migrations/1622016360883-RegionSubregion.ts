import { MigrationInterface, QueryRunner } from 'typeorm';

export class RegionSubregion1622016360883 implements MigrationInterface {
    name = 'RegionSubregion1622016360883';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ADD "postalCode" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ADD "country" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ADD "region" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ADD "subregion" character varying NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" DROP COLUMN "subregion"`
        );
        await queryRunner.query(`ALTER TABLE "irec_device_registry_device" DROP COLUMN "region"`);
        await queryRunner.query(`ALTER TABLE "irec_device_registry_device" DROP COLUMN "country"`);
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" DROP COLUMN "postalCode"`
        );
    }
}
