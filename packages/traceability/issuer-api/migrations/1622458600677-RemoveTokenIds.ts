import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTokenIds1622458600677 implements MigrationInterface {
    name = 'RemoveTokenIds1622458600677';

    public async up(queryRunner: QueryRunner): Promise<void> {
        /* 
            CERTIFICATES
        */
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" DROP CONSTRAINT "PK_e4ce09f2a73bbe3a7227df421e7"`
        );
        await queryRunner.query(`ALTER TABLE "issuer_certificate" DROP COLUMN id`);
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" DROP CONSTRAINT "UQ_6489c34207c69cdc7b90afb4491"`
        );

        await queryRunner.query(`ALTER TABLE "issuer_certificate" RENAME COLUMN "tokenId" to id`);

        await queryRunner.query(
            `CREATE SEQUENCE "issuer_certificate_id_seq" OWNED BY "issuer_certificate"."id"`
        );
        await queryRunner.query(
            `SELECT setval(pg_get_serial_sequence('issuer_certificate', 'id'), ( SELECT MAX("id") FROM issuer_certificate) + 1)`
        );

        /*
            CERTIFICATION REQUESTS
        */
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" RENAME COLUMN "issuedCertificateTokenId" to "issuedCertificateId"`
        );

        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" DROP CONSTRAINT "PK_126b742d59e12ccc099febcbc1e"`
        );
        await queryRunner.query(`ALTER TABLE "issuer_certification_request" DROP COLUMN id`);
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" DROP CONSTRAINT "UQ_551869cc9ee5caeccd53c966cdd"`
        );

        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" RENAME COLUMN "requestId" to id`
        );

        await queryRunner.query(
            `CREATE SEQUENCE "issuer_certification_request_id_seq" OWNED BY "issuer_certification_request"."id"`
        );
        await queryRunner.query(
            `SELECT setval(pg_get_serial_sequence('issuer_certification_request', 'id'), ( SELECT MAX("id") FROM issuer_certification_request) + 1)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        /* 
            CERTIFICATES
        */
        await queryRunner.query(`ALTER TABLE "issuer_certificate" ADD "tokenId" integer`);
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ADD CONSTRAINT "UQ_6489c34207c69cdc7b90afb4491" UNIQUE ("tokenId")`
        );

        await queryRunner.query(`UPDATE "issuer_certificate" SET "tokenId" = id`);

        /*
            CERTIFICATION REQUESTS
        */
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" RENAME COLUMN "issuedCertificateId" to "issuedCertificateTokenId"`
        );

        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD "requestId" integer`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD CONSTRAINT "UQ_551869cc9ee5caeccd53c966cdd" UNIQUE ("requestId")`
        );

        await queryRunner.query(`UPDATE "issuer_certification_request" SET "requestId" = id`);
    }
}
