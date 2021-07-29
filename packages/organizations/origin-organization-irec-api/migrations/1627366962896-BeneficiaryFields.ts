import { MigrationInterface, QueryRunner } from 'typeorm';

export class BeneficiaryFields1627366962896 implements MigrationInterface {
    name = 'BeneficiaryFields1627366962896';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_beneficiary" ADD "name" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_beneficiary" ADD "countryCode" character varying NOT NULL`
        );
        await queryRunner.query(`ALTER TABLE "irec_beneficiary" ADD "active" boolean NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE "irec_beneficiary" ADD "location" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_beneficiary" ALTER COLUMN "ownerId" DROP NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_beneficiary" ALTER COLUMN "organizationId" DROP NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_beneficiary" ALTER COLUMN "ownerId" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_beneficiary" ALTER COLUMN "organizationId" SET NOT NULL`
        );
        await queryRunner.query(`ALTER TABLE "irec_beneficiary" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "irec_beneficiary" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "irec_beneficiary" DROP COLUMN "countryCode"`);
        await queryRunner.query(`ALTER TABLE "irec_beneficiary" DROP COLUMN "name"`);
    }
}
