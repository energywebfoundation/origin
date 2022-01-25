import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTransactionLog1642494810106 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "transaction_log"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
