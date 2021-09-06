import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1611309056702 implements MigrationInterface {
    name = 'Initial1611309056702';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "irec_device_registry_device" (
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "ownerId" character varying NOT NULL, 
                "code" character varying NOT NULL, 
                "name" character varying NOT NULL, 
                "defaultAccount" character varying NOT NULL, 
                "deviceType" character varying NOT NULL, 
                "fuel" character varying NOT NULL, 
                "countryCode" character varying NOT NULL, 
                "registrantOrganization" character varying NOT NULL, 
                "issuer" character varying NOT NULL, 
                "capacity" integer NOT NULL, 
                "commissioningDate" TIMESTAMP NOT NULL, 
                "registrationDate" TIMESTAMP NOT NULL, 
                "address" character varying NOT NULL,
                "latitude" character varying NOT NULL, 
                "longitude" character varying NOT NULL, 
                "notes" character varying, 
                "status" character varying NOT NULL DEFAULT 'Submitted', 
                "timezone" character varying NOT NULL, 
                "gridOperator" character varying, 
                CONSTRAINT "PK_b9bcb43723bddf3084df4af6d05" PRIMARY KEY ("id")
            )
       `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "irec_device_registry_device"`);
    }
}
