import { MigrationInterface, QueryRunner } from 'typeorm';

export class UploadFilesInDevice1589264954930 implements MigrationInterface {
    name = 'UploadFilesInDevice1589264954930';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device" ADD "files" text`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "files"`, undefined);
    }
}
