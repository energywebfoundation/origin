import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyIds1623276837283 implements MigrationInterface {
    name = 'UnifyIds1623276837283';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_issuer_certification_request" ALTER COLUMN "irecIssueId" SET DEFAULT ''`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_issuer_certification_request" ALTER COLUMN "irecIssueId" DROP DEFAULT`
        );
    }
}
