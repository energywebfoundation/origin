import { MigrationInterface, QueryRunner } from 'typeorm';

export class IrecIssueId1617821910000 implements MigrationInterface {
    name = 'IrecIssueId1617821910000';

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
