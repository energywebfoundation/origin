import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserMultipleBlockchainAccounts1611566273436 implements MigrationInterface {
    name = 'UserMultipleBlockchainAccounts1611566273436';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP CONSTRAINT "UQ_6f73e3508ecb836bd99ec2ea6a0"`
        );
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "blockchainAccountAddress"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "blockchainAccountSignedMessage"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "blockchainAccounts" text`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."email" IS NULL`);
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`
        );
        await queryRunner.query(`COMMENT ON COLUMN "user"."email" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "blockchainAccounts"`);
        await queryRunner.query(
            `ALTER TABLE "user" ADD "blockchainAccountSignedMessage" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD "blockchainAccountAddress" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "UQ_6f73e3508ecb836bd99ec2ea6a0" UNIQUE ("email", "blockchainAccountAddress")`
        );
    }
}
