import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClaimAddress1639052544086 implements MigrationInterface {
    name = 'ClaimAddress1639052544086';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "exchange_transfer" ADD "claimAddress" character varying`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_transfer" DROP COLUMN "claimAddress"`);
    }
}
