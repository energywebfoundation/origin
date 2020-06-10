import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAllUserStatusActive1591766102307 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "user" SET status = 1`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "user" SET status = 0`, undefined);
    }
}
