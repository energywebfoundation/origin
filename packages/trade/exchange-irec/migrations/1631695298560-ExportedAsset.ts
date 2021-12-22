import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExportedAsset1631695298560 implements MigrationInterface {
    name = 'ExportedAsset1631695298560';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "exchange_exported" (
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "assetId" character varying NOT NULL, 
                "ownerId" character varying NOT NULL, 
                "amount" bigint NOT NULL, 
                CONSTRAINT "PK_3789cb80ae09cb1f20cc5e0b605" PRIMARY KEY ("id")
             )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "exchange_exported"`);
    }
}
