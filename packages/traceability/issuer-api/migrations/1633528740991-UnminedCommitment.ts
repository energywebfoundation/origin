import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnminedCommitment1633528740991 implements MigrationInterface {
    name = 'UnminedCommitment1633528740991';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "issuer_unmined_commitment" ("txHash" character varying NOT NULL, "commitment" text, CONSTRAINT "PK_adc77c37d27355b9a06c6370a52" PRIMARY KEY ("txHash"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "issuer_unmined_commitment"`);
    }
}
