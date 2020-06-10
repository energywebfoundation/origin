import { MigrationInterface, QueryRunner } from 'typeorm';

export class CertificationRequestEnergyNotNull1591772684577 implements MigrationInterface {
    name = 'CertificationRequestEnergyNotNull1591772684577';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "energy" SET NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "energy" DROP NOT NULL`
        );
    }
}
