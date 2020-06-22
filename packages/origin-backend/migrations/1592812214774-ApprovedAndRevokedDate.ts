import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApprovedAndRevokedDate1592812214774 implements MigrationInterface {
    name = 'ApprovedAndRevokedDate1592812214774';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certification_request" ADD "approvedDate" TIMESTAMP WITH TIME ZONE`
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ADD "revokedDate" TIMESTAMP WITH TIME ZONE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "certification_request" DROP COLUMN "revokedDate"`);
        await queryRunner.query(`ALTER TABLE "certification_request" DROP COLUMN "approvedDate"`);
    }
}
