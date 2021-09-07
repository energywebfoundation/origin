import { MigrationInterface, QueryRunner } from 'typeorm';

export class BeneficiaryId1620638168072 implements MigrationInterface {
    name = 'BeneficiaryId1620638168072';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD "beneficiaryId" character varying NOT NULL DEFAULT ''`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platform_organization" DROP COLUMN "beneficiaryId"`);
    }
}
