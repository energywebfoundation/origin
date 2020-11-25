import { MigrationInterface, QueryRunner } from 'typeorm';

export class IRecOrganizationContactDetails1606335794845 implements MigrationInterface {
    name = 'IRecOrganizationContactDetails1606335794845';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "primaryContactOrganizationName" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "primaryContactOrganizationAddress" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "primaryContactOrganizationPostalCode" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "primaryContactOrganizationCountry" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "primaryContactName" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "primaryContactEmail" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "primaryContactPhoneNumber" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "primaryContactFax" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "leadUserTitle" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "leadUserFirstName" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "leadUserLastName" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "leadUserEmail" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "leadUserPhoneNumber" character varying NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD "leadUserFax" character varying NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "irec_registration" DROP COLUMN "leadUserFax"`);
        await queryRunner.query(
            `ALTER TABLE "irec_registration" DROP COLUMN "leadUserPhoneNumber"`
        );
        await queryRunner.query(`ALTER TABLE "irec_registration" DROP COLUMN "leadUserEmail"`);
        await queryRunner.query(`ALTER TABLE "irec_registration" DROP COLUMN "leadUserLastName"`);
        await queryRunner.query(`ALTER TABLE "irec_registration" DROP COLUMN "leadUserFirstName"`);
        await queryRunner.query(`ALTER TABLE "irec_registration" DROP COLUMN "leadUserTitle"`);
        await queryRunner.query(`ALTER TABLE "irec_registration" DROP COLUMN "primaryContactFax"`);
        await queryRunner.query(
            `ALTER TABLE "irec_registration" DROP COLUMN "primaryContactPhoneNumber"`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" DROP COLUMN "primaryContactEmail"`
        );
        await queryRunner.query(`ALTER TABLE "irec_registration" DROP COLUMN "primaryContactName"`);
        await queryRunner.query(
            `ALTER TABLE "irec_registration" DROP COLUMN "primaryContactOrganizationCountry"`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" DROP COLUMN "primaryContactOrganizationPostalCode"`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" DROP COLUMN "primaryContactOrganizationAddress"`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_registration" DROP COLUMN "primaryContactOrganizationName"`
        );
    }
}
