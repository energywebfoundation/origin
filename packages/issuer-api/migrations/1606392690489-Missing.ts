import { MigrationInterface, QueryRunner } from 'typeorm';

export class Missing1606392690489 implements MigrationInterface {
    name = 'Missing1606392690489';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `COMMENT ON COLUMN "issuer_certification_request"."status" IS NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ALTER COLUMN "status" DROP DEFAULT`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ALTER COLUMN "status" SET DEFAULT 'Executed'`
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "issuer_certification_request"."status" IS NULL`
        );
    }
}
