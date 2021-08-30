import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationId1626263673419 implements MigrationInterface {
    name = 'OrganizationId1626263673419';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_issuer_certification_request" RENAME COLUMN "userId" TO "organizationId"`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_issuer_certification_request" RENAME COLUMN "irecCertificateId" TO "irecAssetId"`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_issuer_certification_request" RENAME COLUMN "irecAssetId" TO "irecCertificateId"`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_issuer_certification_request" RENAME COLUMN "organizationId" TO "userId"`
        );
    }
}
