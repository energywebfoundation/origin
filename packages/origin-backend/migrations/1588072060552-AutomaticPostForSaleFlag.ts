import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutomaticPostForSaleFlag1588072060552 implements MigrationInterface {
    name = 'AutomaticPostForSaleFlag1588072060552';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "device" ADD "automaticPostForSale" boolean NOT NULL DEFAULT false`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "device" DROP COLUMN "automaticPostForSale"`,
            undefined
        );
    }
}
