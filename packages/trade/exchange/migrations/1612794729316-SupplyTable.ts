import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupplyTable1612794729316 implements MigrationInterface {
    name = 'SupplyTable1612794729316';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "exchange_supply" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ownerId" character varying NOT NULL, "deviceId" character varying NOT NULL, "active" boolean NOT NULL, "price" integer NOT NULL, CONSTRAINT "PK_647f6dbaff57fd0030fbd54dcd1" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "exchange_supply"`);
    }
}
