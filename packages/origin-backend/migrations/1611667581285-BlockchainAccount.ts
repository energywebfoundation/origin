import { MigrationInterface, QueryRunner } from 'typeorm';

export class BlockchainAccount1611667581285 implements MigrationInterface {
    name = 'BlockchainAccount1611667581285';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "blockchain_account" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying NOT NULL, "type" character varying NOT NULL, "signedMessage" character varying, CONSTRAINT "UQ_92091a03afd83bfb7768e62bce4" UNIQUE ("address"), CONSTRAINT "PK_3d07d692a436bc34ef4093d9c60" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "user_blockchain_accounts_blockchain_account" ("userId" integer NOT NULL, "blockchainAccountId" uuid NOT NULL, CONSTRAINT "PK_481e7b4bc4129647dcd9481fea1" PRIMARY KEY ("userId", "blockchainAccountId"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_f434a01c9fff089cebd36b661c" ON "user_blockchain_accounts_blockchain_account" ("userId") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_2f3e551dcf42733873b99bbdcb" ON "user_blockchain_accounts_blockchain_account" ("blockchainAccountId") `
        );
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "blockchainAccounts"`);
        await queryRunner.query(
            `ALTER TABLE "user_blockchain_accounts_blockchain_account" ADD CONSTRAINT "FK_f434a01c9fff089cebd36b661c4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "user_blockchain_accounts_blockchain_account" ADD CONSTRAINT "FK_2f3e551dcf42733873b99bbdcbc" FOREIGN KEY ("blockchainAccountId") REFERENCES "blockchain_account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user_blockchain_accounts_blockchain_account" DROP CONSTRAINT "FK_2f3e551dcf42733873b99bbdcbc"`
        );
        await queryRunner.query(
            `ALTER TABLE "user_blockchain_accounts_blockchain_account" DROP CONSTRAINT "FK_f434a01c9fff089cebd36b661c4"`
        );
        await queryRunner.query(`ALTER TABLE "user" ADD "blockchainAccounts" text`);
        await queryRunner.query(`DROP INDEX "IDX_2f3e551dcf42733873b99bbdcb"`);
        await queryRunner.query(`DROP INDEX "IDX_f434a01c9fff089cebd36b661c"`);
        await queryRunner.query(`DROP TABLE "user_blockchain_accounts_blockchain_account"`);
        await queryRunner.query(`DROP TABLE "blockchain_account"`);
    }
}
