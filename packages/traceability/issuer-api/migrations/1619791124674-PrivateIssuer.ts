import { MigrationInterface, QueryRunner } from 'typeorm';

export class PrivateIssuer1619791124674 implements MigrationInterface {
    name = 'PrivateIssuer1619791124674';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_blockchain_properties" ADD "privateIssuer" character varying`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_blockchain_properties" DROP COLUMN "privateIssuer"`
        );
    }
}
