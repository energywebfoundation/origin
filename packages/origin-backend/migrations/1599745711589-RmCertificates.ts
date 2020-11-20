import { MigrationInterface, QueryRunner } from 'typeorm';

export class RmCertificates1599745711589 implements MigrationInterface {
    name = 'RmCertificates1599745711589';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "configuration" DROP COLUMN "contractsLookup"`);
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" ALTER COLUMN "sender" DROP DEFAULT`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "organization_invitation" ALTER COLUMN "sender" SET DEFAULT ''`
        );
        await queryRunner.query(`ALTER TABLE "configuration" ADD "contractsLookup" text`);
    }
}
