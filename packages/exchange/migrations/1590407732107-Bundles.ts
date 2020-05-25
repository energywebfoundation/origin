import { MigrationInterface, QueryRunner } from 'typeorm';

export class Bundles1590407732107 implements MigrationInterface {
    name = 'Bundles1590407732107';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `CREATE TABLE "bundle" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "price" integer NOT NULL, CONSTRAINT "PK_637e3f87e837d6532109c198dea" PRIMARY KEY ("id"))`,
            undefined
        );
        await queryRunner.query(
            `CREATE TABLE "bundle_item" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startVolume" character varying NOT NULL, "currentVolume" character varying NOT NULL, "assetId" uuid, "bundleId" uuid, CONSTRAINT "PK_c89b429c5d069d3399b935327f4" PRIMARY KEY ("id"))`,
            undefined
        );
        await queryRunner.query(
            `CREATE TABLE "bundle_trade" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "buyerId" character varying NOT NULL, "volume" character varying NOT NULL, "bundleId" uuid, CONSTRAINT "PK_d6947e1c1bffc399636a49a3243" PRIMARY KEY ("id"))`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "bundle_item" ADD CONSTRAINT "FK_45559b6111bf0664b49243bc67c" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "bundle_item" ADD CONSTRAINT "FK_21f62678875562cfa8afe7257a2" FOREIGN KEY ("bundleId") REFERENCES "bundle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "bundle_trade" ADD CONSTRAINT "FK_84d0a546dc26d9d4d0a1f484492" FOREIGN KEY ("bundleId") REFERENCES "bundle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "bundle" ADD "isCancelled" boolean NOT NULL`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "bundle_trade" DROP CONSTRAINT "FK_84d0a546dc26d9d4d0a1f484492"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "bundle_item" DROP CONSTRAINT "FK_21f62678875562cfa8afe7257a2"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "bundle_item" DROP CONSTRAINT "FK_45559b6111bf0664b49243bc67c"`,
            undefined
        );
        await queryRunner.query(`DROP TABLE "bundle_trade"`, undefined);
        await queryRunner.query(`DROP TABLE "bundle_item"`, undefined);
        await queryRunner.query(`DROP TABLE "bundle"`, undefined);
    }
}
