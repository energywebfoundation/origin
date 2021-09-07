import { MigrationInterface, QueryRunner } from 'typeorm';

export class irecCertificateId1623950245266 implements MigrationInterface {
    name = 'irecCertificateId1623950245266';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_issuer_certification_request" RENAME COLUMN "irecIssueId" TO "irecIssueRequestId"`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_issuer_certification_request" ADD "irecCertificateId" character varying NOT NULL DEFAULT ''`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_issuer_certification_request" DROP COLUMN "irecCertificateId"`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_issuer_certification_request" RENAME COLUMN "irecIssueRequestId" TO "irecIssueId"`
        );
    }
}
