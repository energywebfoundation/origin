import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSchemaVersionToCertificate1644231693035 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE issuer_certificate ADD COLUMN "schemaVersion" int4`);
        await queryRunner.query(`UPDATE issuer_certificate SET "schemaVersion" = 1`);
        await queryRunner.query(
            `ALTER TABLE issuer_certificate ALTER COLUMN "schemaVersion" SET NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE issuer_certificate DROP COLUMN "schemaVersion"`);
    }
}
