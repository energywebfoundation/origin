import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationInvitationSender1596616659110 implements MigrationInterface {
    name = 'OrganizationInvitationSender1596616659110';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" ADD "sender" character varying NOT NULL DEFAULT ''`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" DROP COLUMN "sender"`,
            undefined
        );
    }
}
