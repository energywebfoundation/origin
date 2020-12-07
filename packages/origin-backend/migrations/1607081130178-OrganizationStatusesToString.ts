import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationStatusesToString1607081130178 implements MigrationInterface {
    name = 'OrganizationStatusesToString1607081130178';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platform_organization" DROP COLUMN "status"`);
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD "status" character varying NOT NULL DEFAULT 'Submitted'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platform_organization" DROP COLUMN "status"`);
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD "status" integer NOT NULL`
        );
    }
}
