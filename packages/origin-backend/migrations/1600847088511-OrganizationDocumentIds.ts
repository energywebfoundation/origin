import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationDocumentIds1600847088511 implements MigrationInterface {
    name = 'OrganizationDocumentIds1600847088511';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platform_organization" ADD "documentIds" text`);
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD "signatoryDocumentIds" text`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platform_organization" DROP COLUMN "documentIds"`);
        await queryRunner.query(
            `ALTER TABLE "platform_organization" DROP COLUMN "signatoryDocumentIds"`
        );
    }
}
