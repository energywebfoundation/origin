import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTables1606214214687 implements MigrationInterface {
    name = 'UpdateTables1606214214687';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "configuration"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "configuration" ALTER COLUMN "id" SET DEFAULT 1`);
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
        await queryRunner.query(`ALTER TABLE "configuration" ALTER COLUMN "id" SET DEFAULT '1'`);
        await queryRunner.query(`COMMENT ON COLUMN "configuration"."id" IS NULL`);
    }
}
