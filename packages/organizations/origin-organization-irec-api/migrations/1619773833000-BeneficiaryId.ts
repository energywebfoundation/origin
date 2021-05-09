import { MigrationInterface, QueryRunner } from 'typeorm';

export class BeneficiaryId1619773833000 implements MigrationInterface {
    name = 'BeneficiaryId1619773833000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "beneficiaryId" character varying NOT NULL DEFAULT ''`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "irec_registration" DROP COLUMN "beneficiaryId"`);
    }
}
