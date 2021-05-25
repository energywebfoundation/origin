import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1621926541087 implements MigrationInterface {
    name = 'Init1621926541087';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "irec_issuer_certification_request" (
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "id" SERIAL NOT NULL, 
                "certificationRequestId" integer NOT NULL, 
                "userId" character varying NOT NULL, 
                "irecIssueId" character varying NOT NULL, 
                CONSTRAINT "PK_d723daa2222d7cb23a68d181551" PRIMARY KEY ("id")
            )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "irec_issuer_certification_request"`);
    }
}
