import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClaimData1638176424259 implements MigrationInterface {
    name = 'ClaimData1638176424259';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_transfer" ADD "claimData" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_transfer" DROP COLUMN "claimData"`);
    }
}
