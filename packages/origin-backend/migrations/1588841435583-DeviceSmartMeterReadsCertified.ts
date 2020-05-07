import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeviceSmartMeterReadsCertified1588841435583 implements MigrationInterface {
    name = 'DeviceSmartMeterReadsCertified1588841435583';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "device" DROP COLUMN "lastSmartMeterReading"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "device" ADD "meterStats" text NOT NULL DEFAULT '{"certified":{"_hex":"0x00"},"uncertified":{"_hex":"0x00"}}'`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "meterStats"`, undefined);
        await queryRunner.query(`ALTER TABLE "device" ADD "lastSmartMeterReading" text`, undefined);
    }
}
