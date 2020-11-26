import { MigrationInterface, QueryRunner } from 'typeorm';

export class Missing1606392577731 implements MigrationInterface {
    name = 'Missing1606392577731';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "exchange_bundle_item" DROP CONSTRAINT "FK_45559b6111bf0664b49243bc67c"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_bundle_item" DROP CONSTRAINT "FK_21f62678875562cfa8afe7257a2"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_bundle_trade" DROP CONSTRAINT "FK_84d0a546dc26d9d4d0a1f484492"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_trade" DROP CONSTRAINT "FK_9cb1744cacf77d85709606bb70e"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_trade" DROP CONSTRAINT "FK_b71911724b2024af5ac4e8fc5bf"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_order" DROP CONSTRAINT "FK_7f2d092dc1c3229755959c49b45"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_order" DROP CONSTRAINT "FK_8b2e2e46cf8773a56a0fd512856"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" DROP CONSTRAINT "FK_ec4244fc73c558c2eae38ba8ea6"`
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
        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" ADD CONSTRAINT "FK_ec4244fc73c558c2eae38ba8ea6" FOREIGN KEY ("assetId") REFERENCES "exchange_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_order" ADD CONSTRAINT "FK_8b2e2e46cf8773a56a0fd512856" FOREIGN KEY ("assetId") REFERENCES "exchange_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_order" ADD CONSTRAINT "FK_7f2d092dc1c3229755959c49b45" FOREIGN KEY ("demandId") REFERENCES "exchange_demand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_trade" ADD CONSTRAINT "FK_b71911724b2024af5ac4e8fc5bf" FOREIGN KEY ("bidId") REFERENCES "exchange_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_trade" ADD CONSTRAINT "FK_9cb1744cacf77d85709606bb70e" FOREIGN KEY ("askId") REFERENCES "exchange_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_bundle_trade" ADD CONSTRAINT "FK_84d0a546dc26d9d4d0a1f484492" FOREIGN KEY ("bundleId") REFERENCES "bundle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_bundle_item" ADD CONSTRAINT "FK_21f62678875562cfa8afe7257a2" FOREIGN KEY ("bundleId") REFERENCES "bundle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_bundle_item" ADD CONSTRAINT "FK_45559b6111bf0664b49243bc67c" FOREIGN KEY ("assetId") REFERENCES "exchange_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }
}
