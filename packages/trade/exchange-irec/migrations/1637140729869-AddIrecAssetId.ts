import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIrecAssetId1637140729869 implements MigrationInterface {
    name = 'AddIrecAssetId1637140729869';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "exchange_exported" ADD "irecAssetId" character varying NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_exported" DROP COLUMN "irecAssetId"`);
    }
}
