import { MigrationInterface, QueryRunner } from 'typeorm';

export class BeneficiariesTable1622745517894 implements MigrationInterface {
    name = 'BeneficiariesTable1622745517894';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "irec_beneficiary" (
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "id" SERIAL NOT NULL, 
                "irecBeneficiaryId" integer NOT NULL, 
                "organizationId" integer NOT NULL, 
                "ownerOrganizationId" integer NOT NULL, 
                CONSTRAINT "PK_d23471635c3409decbd1995f5eb" PRIMARY KEY ("id")
            )`
        );
        await queryRunner.query(`ALTER TABLE "irec_registration" DROP COLUMN "beneficiaryId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "beneficiaryId" character varying NOT NULL DEFAULT ''`
        );
        await queryRunner.query(`DROP TABLE "irec_beneficiary"`);
    }
}
