import { MigrationInterface, QueryRunner } from 'typeorm';

export class TradeAccountCode1635837009356 implements MigrationInterface {
    name = 'TradeAccountCode1635837009356';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_issuer_certification_request" ADD "irecTradeAccountCode" character varying NOT NULL DEFAULT ''`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_issuer_certification_request" DROP COLUMN "irecTradeAccountCode"`
        );
    }
}
