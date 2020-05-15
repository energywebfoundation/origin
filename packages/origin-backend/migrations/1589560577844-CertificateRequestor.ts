import { MigrationInterface, QueryRunner } from 'typeorm';

export class CertificateRequestor1589560577844 implements MigrationInterface {
    name = 'CertificateRequestor1589560577844';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "certificate" ADD "originalRequestor" character varying NOT NULL`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "certificate" DROP COLUMN "originalRequestor"`,
            undefined
        );
    }
}
