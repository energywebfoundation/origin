import { MigrationInterface, QueryRunner } from 'typeorm';

export class StoreTxHashInsteadBlock1633507266818 implements MigrationInterface {
    name = 'StoreTxHashInsteadBlock1633507266818';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // TO-DO: Write proper migrations
        await queryRunner.query(`ALTER TABLE "issuer_certificate" DROP COLUMN "creationBlockHash"`);
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ADD "creationTransactionHash" character varying NOT NULL`
        );

        await queryRunner.query(`ALTER TABLE "issuer_certificate" ALTER COLUMN "id" SET NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ADD CONSTRAINT "PK_e4ce09f2a73bbe3a7227df421e7" PRIMARY KEY ("id")`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ALTER COLUMN "id" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD CONSTRAINT "PK_126b742d59e12ccc099febcbc1e" PRIMARY KEY ("id")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" DROP CONSTRAINT "PK_126b742d59e12ccc099febcbc1e"`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ALTER COLUMN "id" DROP NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" DROP CONSTRAINT "PK_e4ce09f2a73bbe3a7227df421e7"`
        );
        await queryRunner.query(`ALTER TABLE "issuer_certificate" ALTER COLUMN "id" DROP NOT NULL`);

        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" DROP COLUMN "creationTransactionHash"`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ADD "creationBlockHash" character varying`
        );
    }
}
