import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTokenIds1622458600677 implements MigrationInterface {
    name = 'RemoveTokenIds1622458600677';

    public async up(queryRunner: QueryRunner): Promise<void> {
        /* 
            CERTIFICATES
        */
        const oldCertificates = await queryRunner.query(
            `SELECT id, "tokenId" FROM "issuer_certificate"`
        );

        await queryRunner.query(`ALTER TABLE "issuer_certificate" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "issuer_certificate_id_seq"`);

        await Promise.all(
            oldCertificates.map(async (oldCertificate: any) => {
                return queryRunner.query(
                    `UPDATE "issuer_certificate" SET id = ${oldCertificate.tokenId} WHERE id = '${oldCertificate.id}'`
                );
            })
        );

        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" DROP CONSTRAINT "UQ_6489c34207c69cdc7b90afb4491"`
        );
        await queryRunner.query(`ALTER TABLE "issuer_certificate" DROP COLUMN "tokenId"`);

        /*
            CERTIFICATION REQUESTS
        */
        const oldCertificationRequests = await queryRunner.query(
            `SELECT id, "requestId" FROM "issuer_certification_request"`
        );

        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" RENAME COLUMN "issuedCertificateTokenId" to "issuedCertificateId"`
        );

        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ALTER COLUMN "id" DROP DEFAULT`
        );
        await queryRunner.query(`DROP SEQUENCE "issuer_certification_request_id_seq"`);

        await Promise.all(
            oldCertificationRequests.map(async (oldCertReq: any) => {
                return queryRunner.query(
                    `UPDATE "issuer_certification_request" SET id = ${oldCertReq.requestId} WHERE id = '${oldCertReq.id}'`
                );
            })
        );

        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" DROP CONSTRAINT "UQ_551869cc9ee5caeccd53c966cdd"`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" DROP COLUMN "requestId"`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        /* 
            CERTIFICATES
        */
        const oldCertificates = await queryRunner.query(`SELECT id FROM "issuer_certificate"`);

        await queryRunner.query(
            `CREATE SEQUENCE "issuer_certificate_id_seq" OWNED BY "issuer_certificate"."id"`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ALTER COLUMN "id" SET DEFAULT nextval('issuer_certificate_id_seq')`
        );
        await queryRunner.query(`ALTER TABLE "issuer_certificate" ADD "tokenId" integer`);
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ADD CONSTRAINT "UQ_6489c34207c69cdc7b90afb4491" UNIQUE ("tokenId")`
        );

        await Promise.all(
            oldCertificates.map(async (oldCertificate: any) => {
                return queryRunner.query(
                    `UPDATE "issuer_certificate" SET "tokenId" = ${oldCertificate.id} WHERE id = '${oldCertificate.id}'`
                );
            })
        );

        /*
            CERTIFICATION REQUESTS
        */
        const oldCertificationRequests = await queryRunner.query(
            `SELECT id FROM "issuer_certification_request"`
        );

        await queryRunner.query(
            `CREATE SEQUENCE "issuer_certification_request_id_seq" OWNED BY "issuer_certification_request"."id"`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ALTER COLUMN "id" SET DEFAULT nextval('issuer_certification_request_id_seq')`
        );

        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" RENAME COLUMN "issuedCertificateId" to "issuedCertificateTokenId"`
        );

        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD "requestId" integer`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD CONSTRAINT "UQ_551869cc9ee5caeccd53c966cdd" UNIQUE ("requestId")`
        );

        await Promise.all(
            oldCertificationRequests.map(async (oldCertReq: any) => {
                return queryRunner.query(
                    `UPDATE "issuer_certification_request" SET "requestId" = ${oldCertReq.requestId} WHERE id = '${oldCertReq.id}'`
                );
            })
        );
    }
}
