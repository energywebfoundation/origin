import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExchangeTablePrefix1604562715444 implements MigrationInterface {
    name = 'ExchangeTablePrefix1604562715444';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" RENAME TO "exchange_account"`);
        await queryRunner.query(`ALTER TABLE "asset" RENAME TO "exchange_asset"`);
        await queryRunner.query(`ALTER TABLE "bundle_item" RENAME TO "exchange_bundle_item"`);
        await queryRunner.query(`ALTER TABLE "bundle_trade" RENAME TO "exchange_bundle_trade"`);
        await queryRunner.query(`ALTER TABLE "trade" RENAME TO "exchange_trade"`);
        await queryRunner.query(`ALTER TABLE "order" RENAME TO "exchange_order"`);
        await queryRunner.query(`ALTER TABLE "demand" RENAME TO "exchange_demand"`);
        await queryRunner.query(`ALTER TABLE "transfer" RENAME TO "exchange_transfer"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_account" RENAME TO "account"`);
        await queryRunner.query(`ALTER TABLE "exchange_asset" RENAME TO "asset"`);
        await queryRunner.query(`ALTER TABLE "exchange_bundle_item" RENAME TO "bundle_item"`);
        await queryRunner.query(`ALTER TABLE "exchange_bundle_trade" RENAME TO "bundle_trade"`);
        await queryRunner.query(`ALTER TABLE "exchange_trade" RENAME TO "trade"`);
        await queryRunner.query(`ALTER TABLE "exchange_order" RENAME TO "order"`);
        await queryRunner.query(`ALTER TABLE "exchange_demand" RENAME TO "demand"`);
        await queryRunner.query(`ALTER TABLE "exchange_transfer" RENAME TO "transfer"`);
    }
}
