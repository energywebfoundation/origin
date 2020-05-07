import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserStatusAndAutoPublish1588836930945 implements MigrationInterface {
    name = 'UserStatusAndAutoPublish1588836930945';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "autoPublish"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "autoPublish" text`, undefined);
    }
}
