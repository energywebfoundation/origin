import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1606909977913 implements MigrationInterface {
    name = 'Initial1606909977913';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "device_registry_device" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner" character varying NOT NULL, "externalRegistryId" character varying NOT NULL, "smartMeterId" character varying NOT NULL, "externalDeviceIds" text, "description" character varying NOT NULL, "imageIds" text, CONSTRAINT "UQ_8974f494a40fd53d9468faf5f51" UNIQUE ("externalRegistryId"), CONSTRAINT "UQ_7bb21b40e689411f55ca88c8c7f" UNIQUE ("smartMeterId"), CONSTRAINT "PK_c70f8845a83c15207f3bf73d31b" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "device_registry_device"`);
    }
}
