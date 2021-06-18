import { MigrationInterface, QueryRunner } from 'typeorm';

export class RedundantCountry1624005598346 implements MigrationInterface {
    name = 'RedundantCountry1624005598346';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "irec_device_registry_device" DROP COLUMN "country"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ADD "country" character varying NOT NULL`
        );
    }
}
