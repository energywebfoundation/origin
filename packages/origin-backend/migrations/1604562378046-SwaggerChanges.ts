import { MigrationInterface, QueryRunner } from 'typeorm';

export class SwaggerChanges1604562378046 implements MigrationInterface {
    name = 'SwaggerChanges1604562378046';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_invitation" DROP COLUMN "status"`);
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" ADD "status" character varying NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_invitation" DROP COLUMN "status"`);
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" ADD "status" integer NOT NULL`
        );
    }
}
