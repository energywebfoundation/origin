import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserName1626682324674 implements MigrationInterface {
    name = 'UserName1626682324674';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_connection" ADD "userName" character varying NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "irec_connection" DROP COLUMN "userName"`);
    }
}
