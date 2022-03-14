import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIrecTradeTransferTable1647257464647 implements MigrationInterface {
    name = 'AddIrecTradeTransferTable1647257464647';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "irec_trade_transfer" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "tokenId" character varying NOT NULL, "verificationKey" character varying NOT NULL, CONSTRAINT "PK_88d5a99f171739679ba201b6489" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "irec_trade_transfer"`);
    }
}
