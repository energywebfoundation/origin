import { MigrationInterface, QueryRunner } from 'typeorm';

export class BlockchainAddressUnique1611928473862 implements MigrationInterface {
    name = 'BlockchainAddressUnique1611928473862';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP CONSTRAINT "UQ_6f73e3508ecb836bd99ec2ea6a0"`
        );
        await queryRunner.query(`COMMENT ON COLUMN "user"."email" IS NULL`);
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`
        );
        await queryRunner.query(`COMMENT ON COLUMN "user"."blockchainAccountAddress" IS NULL`);
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "UQ_3e71ea3e520c84b9d9ec1199432" UNIQUE ("blockchainAccountAddress")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP CONSTRAINT "UQ_3e71ea3e520c84b9d9ec1199432"`
        );
        await queryRunner.query(`COMMENT ON COLUMN "user"."blockchainAccountAddress" IS NULL`);
        await queryRunner.query(
            `ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`
        );
        await queryRunner.query(`COMMENT ON COLUMN "user"."email" IS NULL`);
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "UQ_6f73e3508ecb836bd99ec2ea6a0" UNIQUE ("email", "blockchainAccountAddress")`
        );
    }
}
