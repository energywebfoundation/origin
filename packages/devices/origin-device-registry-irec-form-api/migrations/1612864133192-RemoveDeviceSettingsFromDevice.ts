import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDeviceSettingsFromDevice1612864133192 implements MigrationInterface {
    name = 'RemoveDeviceSettingsFromDevice1612864133192';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "defaultAskPrice"`);
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "automaticPostForSale"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "device" ADD "automaticPostForSale" boolean NOT NULL DEFAULT false`
        );
        await queryRunner.query(`ALTER TABLE "device" ADD "defaultAskPrice" integer`);
    }
}
