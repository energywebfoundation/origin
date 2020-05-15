import { MigrationInterface, QueryRunner } from 'typeorm';

export class FilesEmptyArray1589378838360 implements MigrationInterface {
    name = 'FilesEmptyArray1589378838360';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "device" ALTER COLUMN "files" SET DEFAULT '[]'`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "device" ALTER COLUMN "files" SET DEFAULT ''`,
            undefined
        );
    }
}
