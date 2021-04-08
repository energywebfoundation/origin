import { MigrationInterface, QueryRunner } from 'typeorm';

export class Missing1606392690489 implements MigrationInterface {
    name = '1617821910000-IrecIssueId';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD "irecIssueId" varchar DEFAULT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" DROP COLUMN "irecIssueId"`
        );
    }
}
