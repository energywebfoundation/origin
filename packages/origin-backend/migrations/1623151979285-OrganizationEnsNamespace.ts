import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationEnsNamespace1623151979285 implements MigrationInterface {
    name = 'OrganizationEnsNamespace1623151979285';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD "ensNamespace" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD CONSTRAINT "UQ_999eab7a1ff9893feceace27cf3" UNIQUE ("ensNamespace")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "platform_organization" DROP CONSTRAINT "UQ_999eab7a1ff9893feceace27cf3"`
        );
        await queryRunner.query(`ALTER TABLE "platform_organization" DROP COLUMN "ensNamespace"`);
    }
}
