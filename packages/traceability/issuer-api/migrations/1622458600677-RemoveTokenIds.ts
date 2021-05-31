import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTokenIds1622458600677 implements MigrationInterface {
    name = 'RemoveTokenIds1622458600677';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" DROP CONSTRAINT "UQ_6489c34207c69cdc7b90afb4491"`
        );
        await queryRunner.query(`ALTER TABLE "issuer_certificate" DROP COLUMN "tokenId"`);
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" DROP CONSTRAINT "UQ_551869cc9ee5caeccd53c966cdd"`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" DROP COLUMN "requestId"`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" DROP COLUMN "issuedCertificateTokenId"`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD "issuedCertificateId" integer`
        );
        await queryRunner.query(`ALTER TABLE "issuer_certificate" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "issuer_certificate_id_seq"`);
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ALTER COLUMN "id" DROP DEFAULT`
        );
        await queryRunner.query(`DROP SEQUENCE "issuer_certification_request_id_seq"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE SEQUENCE "issuer_certification_request_id_seq" OWNED BY "issuer_certification_request"."id"`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ALTER COLUMN "id" SET DEFAULT nextval('issuer_certification_request_id_seq')`
        );
        await queryRunner.query(
            `CREATE SEQUENCE "issuer_certificate_id_seq" OWNED BY "issuer_certificate"."id"`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ALTER COLUMN "id" SET DEFAULT nextval('issuer_certificate_id_seq')`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" DROP COLUMN "issuedCertificateId"`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD "issuedCertificateTokenId" integer`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD "requestId" integer`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD CONSTRAINT "UQ_551869cc9ee5caeccd53c966cdd" UNIQUE ("requestId")`
        );
        await queryRunner.query(`ALTER TABLE "issuer_certificate" ADD "tokenId" integer`);
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ADD CONSTRAINT "UQ_6489c34207c69cdc7b90afb4491" UNIQUE ("tokenId")`
        );
    }
}
