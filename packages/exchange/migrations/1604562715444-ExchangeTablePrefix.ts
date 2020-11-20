import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExchangeTablePrefix1604562715444 implements MigrationInterface {
    name = 'ExchangeTablePrefix1604562715444';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "exchange_account" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "address" character varying NOT NULL, CONSTRAINT "PK_6dbfd7bdb34f40b831d3013a57f" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "exchange_asset" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying NOT NULL, "tokenId" character varying NOT NULL, "deviceId" character varying NOT NULL, "generationFrom" TIMESTAMP WITH TIME ZONE NOT NULL, "generationTo" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_d63d88f7aefcf9fd35e87e1fbca" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "exchange_bundle_item" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startVolume" character varying NOT NULL, "currentVolume" character varying NOT NULL, "assetId" uuid, "bundleId" uuid, CONSTRAINT "PK_11c18f3930e45e8d66cc2e2e002" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "exchange_bundle_trade" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "buyerId" character varying NOT NULL, "volume" character varying NOT NULL, "bundleId" uuid, CONSTRAINT "PK_8bfa1210ef8d5acbc50e2603a69" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "exchange_trade" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created" TIMESTAMP WITH TIME ZONE NOT NULL, "volume" bigint NOT NULL, "price" integer NOT NULL, "bidId" uuid, "askId" uuid, CONSTRAINT "PK_61b4662c261623cd5dc65ea8d59" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "exchange_order" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "status" integer NOT NULL, "startVolume" bigint NOT NULL, "currentVolume" bigint NOT NULL, "side" integer NOT NULL, "price" integer NOT NULL, "type" integer NOT NULL DEFAULT 0, "directBuyId" uuid, "validFrom" TIMESTAMP WITH TIME ZONE NOT NULL, "product" json NOT NULL, "assetId" uuid, "demandId" uuid, CONSTRAINT "PK_2c02a30d4e80eac09b2bb44bed1" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "exchange_demand" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "price" integer NOT NULL, "start" TIMESTAMP WITH TIME ZONE NOT NULL, "end" TIMESTAMP WITH TIME ZONE NOT NULL, "volumePerPeriod" bigint NOT NULL, "periodTimeFrame" integer NOT NULL, "product" json NOT NULL, "status" integer NOT NULL, CONSTRAINT "PK_2ea4dfd3bfc7ff7a1cc1db2dd0b" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "exchange_transfer" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "amount" bigint NOT NULL, "transactionHash" character varying, "address" character varying NOT NULL, "status" integer NOT NULL, "confirmationBlock" integer, "direction" integer NOT NULL, "assetId" uuid, CONSTRAINT "UQ_a95a0e8db711b4aab6b03217f47" UNIQUE ("transactionHash"), CONSTRAINT "PK_d8b6e308f30ab8fce9de9c99c26" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_bundle_item" ADD CONSTRAINT "FK_ea7ef2648aeb57594f559a0d668" FOREIGN KEY ("assetId") REFERENCES "exchange_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_bundle_item" ADD CONSTRAINT "FK_55826177a962458e9f24c461bea" FOREIGN KEY ("bundleId") REFERENCES "bundle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_bundle_trade" ADD CONSTRAINT "FK_f6c1dd61858ecd0d3e2b3c5203b" FOREIGN KEY ("bundleId") REFERENCES "bundle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_trade" ADD CONSTRAINT "FK_32312824accf2673abf808cc917" FOREIGN KEY ("bidId") REFERENCES "exchange_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_trade" ADD CONSTRAINT "FK_7f367e6fbd75c7eaede1d7a2ee6" FOREIGN KEY ("askId") REFERENCES "exchange_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_order" ADD CONSTRAINT "FK_abeb2be191db972d3c59b7efe4f" FOREIGN KEY ("assetId") REFERENCES "exchange_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_order" ADD CONSTRAINT "FK_a53143d01a8d95b447dcdfa9791" FOREIGN KEY ("demandId") REFERENCES "exchange_demand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" ADD CONSTRAINT "FK_8dcdd29b961b42721e46dbc9ba1" FOREIGN KEY ("assetId") REFERENCES "exchange_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" DROP CONSTRAINT "FK_8dcdd29b961b42721e46dbc9ba1"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_order" DROP CONSTRAINT "FK_a53143d01a8d95b447dcdfa9791"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_order" DROP CONSTRAINT "FK_abeb2be191db972d3c59b7efe4f"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_trade" DROP CONSTRAINT "FK_7f367e6fbd75c7eaede1d7a2ee6"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_trade" DROP CONSTRAINT "FK_32312824accf2673abf808cc917"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_bundle_trade" DROP CONSTRAINT "FK_f6c1dd61858ecd0d3e2b3c5203b"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_bundle_item" DROP CONSTRAINT "FK_55826177a962458e9f24c461bea"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_bundle_item" DROP CONSTRAINT "FK_ea7ef2648aeb57594f559a0d668"`
        );
        await queryRunner.query(`DROP TABLE "exchange_transfer"`);
        await queryRunner.query(`DROP TABLE "exchange_demand"`);
        await queryRunner.query(`DROP TABLE "exchange_order"`);
        await queryRunner.query(`DROP TABLE "exchange_trade"`);
        await queryRunner.query(`DROP TABLE "exchange_bundle_trade"`);
        await queryRunner.query(`DROP TABLE "exchange_bundle_item"`);
        await queryRunner.query(`DROP TABLE "exchange_asset"`);
        await queryRunner.query(`DROP TABLE "exchange_account"`);
    }
}
