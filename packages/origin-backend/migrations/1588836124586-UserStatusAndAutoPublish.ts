import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserStatusAndAutoPublish1588836124586 implements MigrationInterface {
    name = 'UserStatusAndAutoPublish1588836124586';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "autoPublish"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`, undefined);
        await queryRunner.query(
            `ALTER TABLE "user" ALTER COLUMN "kycStatus" DROP DEFAULT`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ALTER COLUMN "kycStatus" SET DEFAULT 0`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 0`,
            undefined
        );
        await queryRunner.query(`ALTER TABLE "user" ADD "autoPublish" text`, undefined);
    }
}
