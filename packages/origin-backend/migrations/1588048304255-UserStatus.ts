import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserStatus1588048304255 implements MigrationInterface {
    name = 'UserStatus1588048304255';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD "status" integer NOT NULL DEFAULT 0`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD "kycStatus" integer NOT NULL DEFAULT 0`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ALTER COLUMN "kycStatus" DROP DEFAULT`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "user" ALTER COLUMN "kycStatus" DROP NOT NULL`,
            undefined
        );
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "status" DROP DEFAULT`, undefined);
        await queryRunner.query(
            `ALTER TABLE "user" ALTER COLUMN "status" DROP NOT NULL`,
            undefined
        );
    }
}
