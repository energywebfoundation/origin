import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserStatusesToString1606471100149 implements MigrationInterface {
    name = 'UserStatusesToString1606471100149';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
        await queryRunner.query(
            `ALTER TABLE "user" ADD "status" character varying NOT NULL DEFAULT 'Pending'`
        );
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "kycStatus"`);
        await queryRunner.query(
            `ALTER TABLE "user" ADD "kycStatus" character varying NOT NULL DEFAULT 'Pending'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "kycStatus"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "kycStatus" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "status" integer NOT NULL DEFAULT '0'`);
    }
}
