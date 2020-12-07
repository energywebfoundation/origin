import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1606988903798 implements MigrationInterface {
    name = 'Initial1606988903798';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "irec_device_registry_device" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ownerId" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Submitted', "facilityName" character varying NOT NULL, "description" character varying NOT NULL, "images" character varying NOT NULL, "files" character varying NOT NULL DEFAULT '[]', "address" character varying NOT NULL, "region" character varying NOT NULL, "province" character varying NOT NULL, "country" character varying NOT NULL, "operationalSince" integer NOT NULL, "capacityInW" integer NOT NULL, "gpsLatitude" character varying NOT NULL, "gpsLongitude" character varying NOT NULL, "timezone" character varying NOT NULL, "deviceType" character varying NOT NULL, "complianceRegistry" character varying NOT NULL, "otherGreenAttributes" character varying NOT NULL, "typeOfPublicSupport" character varying NOT NULL, "gridOperator" character varying, CONSTRAINT "PK_b9bcb43723bddf3084df4af6d05" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "irec_device_registry_device"`);
    }
}
