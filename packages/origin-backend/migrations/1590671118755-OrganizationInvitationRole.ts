import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationInvitationRole1590671118755 implements MigrationInterface {
    name = 'OrganizationInvitationRole1590671118755';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" ADD "role" integer NOT NULL DEFAULT 4`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" DROP COLUMN "role"`,
            undefined
        );
    }
}
