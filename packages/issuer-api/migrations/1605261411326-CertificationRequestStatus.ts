import { MigrationInterface, QueryRunner } from 'typeorm';

export class CertificationRequestStatus1605261411326 implements MigrationInterface {
    name = 'CertificationRequestStatus1605261411326';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD "status" varchar NOT NULL DEFAULT 'Executed'`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ALTER COLUMN "requestId" DROP NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ALTER COLUMN "created" DROP NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ALTER COLUMN "created" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ALTER COLUMN "requestId" SET NOT NULL`
        );
        await queryRunner.query(`ALTER TABLE "issuer_certification_request" DROP COLUMN "status"`);
    }
}
