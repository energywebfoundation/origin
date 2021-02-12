import { MigrationInterface, QueryRunner } from 'typeorm';

export class ValidationChanges1603808802907 implements MigrationInterface {
    name = 'ValidationChanges1603808802907';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ALTER COLUMN "tokenId" DROP NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ALTER COLUMN "creationBlockHash" DROP NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ALTER COLUMN "creationBlockHash" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ALTER COLUMN "tokenId" SET NOT NULL`
        );
    }
}
