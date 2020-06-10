import { MigrationInterface, QueryRunner } from 'typeorm';

export class CertificationRequestEnergyFilesNotNull1591774915665 implements MigrationInterface {
    name = 'CertificationRequestEnergyFilesNotNull1591774915665';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certification_request_queue_item" ALTER COLUMN "files" SET NOT NULL, ALTER COLUMN "files" SET DEFAULT '[]'`
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "energy" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "files" SET NOT NULL, ALTER COLUMN "files" SET DEFAULT '[]'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "files" DROP DEFAULT`
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "files" DROP NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "energy" DROP NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request_queue_item" ALTER COLUMN "files" DROP DEFAULT`
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request_queue_item" ALTER COLUMN "files" DROP NOT NULL`
        );
    }
}
