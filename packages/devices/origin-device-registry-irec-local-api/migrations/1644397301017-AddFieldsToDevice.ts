import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldsToDevice1644397301017 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_device_registry_device" ADD COLUMN "files" character varying DEFAULT '[]'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "irec_device_registry_device" DROP COLUMN "files"`);
    }
}
