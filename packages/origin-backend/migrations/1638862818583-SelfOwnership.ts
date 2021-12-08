import { MigrationInterface, QueryRunner } from 'typeorm';

export class SelfOwnership1638862818583 implements MigrationInterface {
    name = 'SelfOwnership1638862818583';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD "selfOwnership" boolean NOT NULL DEFAULT false`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platform_organization" DROP COLUMN "selfOwnership"`);
    }
}
