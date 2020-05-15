import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeviceFilesType1589357904074 implements MigrationInterface {
    name = 'DeviceFilesType1589357904074';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "files"`, undefined);
        await queryRunner.query(
            `ALTER TABLE "device" ADD "files" character varying NOT NULL DEFAULT ''`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "files"`, undefined);
        await queryRunner.query(`ALTER TABLE "device" ADD "files" text`, undefined);
    }
}
