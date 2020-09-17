import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlatformOrganization1599144425247 implements MigrationInterface {
    name = 'PlatformOrganization1599144425247';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP CONSTRAINT "FK_dfda472c0af7812401e592b6a61"`
        );
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" DROP CONSTRAINT "FK_58d9ca5d9f882ad8be530d247f1"`
        );
        await queryRunner.query(
            `ALTER TABLE "device" DROP CONSTRAINT "FK_c48c741b40e9f453eb1602928d6"`
        );
        await queryRunner.query(
            `CREATE TABLE "platform_organization" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL, "address" character varying NOT NULL, "zipCode" character varying NOT NULL, "city" character varying NOT NULL, "country" integer NOT NULL, "businessType" character varying NOT NULL, "tradeRegistryCompanyNumber" character varying NOT NULL, "vatNumber" character varying NOT NULL, "signatoryFullName" character varying NOT NULL, "signatoryAddress" character varying NOT NULL, "signatoryZipCode" character varying NOT NULL, "signatoryCity" character varying NOT NULL, "signatoryCountry" integer NOT NULL, "signatoryEmail" character varying NOT NULL, "signatoryPhoneNumber" character varying NOT NULL, "status" integer NOT NULL, CONSTRAINT "PK_4e1e830dc563bf0a62776c49aed" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" ALTER COLUMN "sender" DROP DEFAULT`
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "FK_dfda472c0af7812401e592b6a61" FOREIGN KEY ("organizationId") REFERENCES "platform_organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" ADD CONSTRAINT "FK_58d9ca5d9f882ad8be530d247f1" FOREIGN KEY ("organizationId") REFERENCES "platform_organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "device" ADD CONSTRAINT "FK_c48c741b40e9f453eb1602928d6" FOREIGN KEY ("organizationId") REFERENCES "platform_organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "device" DROP CONSTRAINT "FK_c48c741b40e9f453eb1602928d6"`
        );
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" DROP CONSTRAINT "FK_58d9ca5d9f882ad8be530d247f1"`
        );
        await queryRunner.query(
            `ALTER TABLE "user" DROP CONSTRAINT "FK_dfda472c0af7812401e592b6a61"`
        );
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" ALTER COLUMN "sender" SET DEFAULT ''`
        );
        await queryRunner.query(`DROP TABLE "platform_organization"`);
        await queryRunner.query(
            `ALTER TABLE "device" ADD CONSTRAINT "FK_c48c741b40e9f453eb1602928d6" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" ADD CONSTRAINT "FK_58d9ca5d9f882ad8be530d247f1" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "FK_dfda472c0af7812401e592b6a61" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }
}
