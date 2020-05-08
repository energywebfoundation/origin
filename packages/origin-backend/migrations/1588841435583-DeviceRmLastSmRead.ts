import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeviceRmLastSmRead1588841435583 implements MigrationInterface {
    name = 'DeviceRmLastSmRead1588841435583';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "device" DROP COLUMN "lastSmartMeterReading"`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device" ADD "lastSmartMeterReading" text`, undefined);
    }
}
