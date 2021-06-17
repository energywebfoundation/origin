import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveBeneficiaryId1622627218779 implements MigrationInterface {
    name = 'RemoveBeneficiaryId1622627218779';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platform_organization" DROP COLUMN "beneficiaryId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD "beneficiaryId" character varying NOT NULL DEFAULT ''`
        );
    }
}
