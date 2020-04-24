import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransactionHashUnique1587383427737 implements MigrationInterface {
    name = 'TransactionHashUnique1587383427737';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "transfer" ADD CONSTRAINT "UQ_7b2ba7cec52ecbbe84acc5a077a" UNIQUE ("transactionHash")`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "transfer" DROP CONSTRAINT "UQ_7b2ba7cec52ecbbe84acc5a077a"`,
            undefined
        );
    }
}
