import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserDidField1621942557906 implements MigrationInterface {
    name = 'UserDidField1621942557906';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "did" character varying`);
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "UQ_7d4ee7205853cfea0f68240b589" UNIQUE ("did")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP CONSTRAINT "UQ_7d4ee7205853cfea0f68240b589"`
        );
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "did"`);
    }
}
