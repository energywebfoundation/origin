import { MigrationInterface, QueryRunner } from 'typeorm';

export class CertificationRequestUserId1588936623018 implements MigrationInterface {
    name = 'CertificationRequestUserId1588936623018';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certification_request" ADD "userId" character varying NOT NULL`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certification_request" DROP COLUMN "userId"`,
            undefined
        );
    }
}
