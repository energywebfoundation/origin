import { MigrationInterface, QueryRunner } from 'typeorm';

export class CertificateMetadata1621262657405 implements MigrationInterface {
    name = 'CertificateMetadata1621262657405';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ADD "metadata" character varying NOT NULL DEFAULT ''`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issuer_certificate" DROP COLUMN "metadata"`);
    }
}
