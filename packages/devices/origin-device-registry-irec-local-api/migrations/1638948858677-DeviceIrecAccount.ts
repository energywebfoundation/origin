import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeviceIrecAccount1638948858677 implements MigrationInterface {
    name = 'DeviceIrecAccount1638948858677';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ADD "irecTradeAccountCode" character varying DEFAULT ''`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" DROP COLUMN "irecTradeAccountCode"`
        );
    }
}
