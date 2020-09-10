import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1599568015729 implements MigrationInterface {
    name = 'Initial1599568015729';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "irec_connect" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner" character varying NOT NULL, "code" character varying NOT NULL, "leadUserFullName" character varying NOT NULL, "leadUserEmail" character varying NOT NULL, CONSTRAINT "PK_2aa469bd74f7d7e30528ecbe79f" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "irec_registration" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner" character varying NOT NULL, "accountType" integer NOT NULL, "headquarterCountry" character varying NOT NULL, "registrationYear" integer NOT NULL, "employeesNumber" character varying NOT NULL, "shareholders" character varying NOT NULL, "website" character varying NOT NULL, "activeCountries" text NOT NULL, CONSTRAINT "PK_6ccb6c24949f636aafdc84b4ecc" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "irec_registration"`);
        await queryRunner.query(`DROP TABLE "irec_connect"`);
    }
}
