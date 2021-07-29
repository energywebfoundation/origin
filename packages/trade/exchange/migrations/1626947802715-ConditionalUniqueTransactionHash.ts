import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConditionalUniqueTransactionHash1626947802715 implements MigrationInterface {
    name = 'ConditionalUniqueTransactionHash1626947802715';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" DROP CONSTRAINT "UQ_7b2ba7cec52ecbbe84acc5a077a"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" ADD CONSTRAINT "UQ_ecc2d7f727178682af4da287459" UNIQUE ("direction", "transactionHash")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" DROP CONSTRAINT "UQ_ecc2d7f727178682af4da287459"`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" ADD CONSTRAINT "UQ_7b2ba7cec52ecbbe84acc5a077a" UNIQUE ("transactionHash")`
        );
    }
}
