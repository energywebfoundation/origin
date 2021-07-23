import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIrecCertificate1626725885177 implements MigrationInterface {
    name = 'RemoveIrecCertificate1626725885177';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "irec_issuer_certificate"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "irec_issuer_certificate" (
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "certificateId" integer NOT NULL,
                "irecCertificateId" character varying NOT NULL, 
                CONSTRAINT "PK_bdc74ba2885c16d4fe7959060f9" PRIMARY KEY ("certificateId"))
            `
        );
    }
}
