import { MigrationInterface, QueryRunner } from 'typeorm';

export class CapacityString1631576581265 implements MigrationInterface {
    name = 'CapacityString1631576581265';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ALTER COLUMN "capacity" TYPE character varying`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ALTER COLUMN "capacity" TYPE integer`
        );
    }
}
