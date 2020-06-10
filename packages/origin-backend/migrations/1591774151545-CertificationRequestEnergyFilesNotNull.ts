import { MigrationInterface, QueryRunner } from 'typeorm';

export class CertificationRequestEnergyFilesNotNull1591774151545 implements MigrationInterface {
    name = 'CertificationRequestEnergyFilesNotNull1591774151545';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "energy" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "files" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "files" SET DEFAULT '[]'`
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
    }
}
