import { MigrationInterface, QueryRunner } from 'typeorm';

export class FileContentTypeAndOwership1611823766569 implements MigrationInterface {
    name = 'FileContentTypeAndOwership1611823766569';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" ADD "isPublic" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "isPublic"`);
    }
}
