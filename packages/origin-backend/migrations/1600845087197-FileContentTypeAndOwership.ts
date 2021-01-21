import { MigrationInterface, QueryRunner } from 'typeorm';

export class FileContentTypeAndOwership1600845087197 implements MigrationInterface {
    name = 'FileContentTypeAndOwership1600845087197';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" ADD "contentType" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "file" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "file" ADD "organizationId" character varying`);
        await queryRunner.query(`ALTER TABLE "file" ADD "isPublic" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "IsPublic"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "contentType"`);
    }
}
