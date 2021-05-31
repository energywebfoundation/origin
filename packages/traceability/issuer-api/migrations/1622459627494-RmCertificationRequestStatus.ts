import { MigrationInterface, QueryRunner } from 'typeorm';

export class RmCertificationRequestStatus1622459627494 implements MigrationInterface {
    name = 'RmCertificationRequestStatus1622459627494';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issuer_certification_request" DROP COLUMN "status"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD "status" character varying NOT NULL`
        );
    }
}
