import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPasswordNullable1621942514841 implements MigrationInterface {
    name = 'UserPasswordNullable1621942514841';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
    }
}
