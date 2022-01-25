import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSignerTable1639660016195 implements MigrationInterface {
    name = 'AddSignerTable1639660016195';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "issuer_signer" ("blockchainNetId" integer NOT NULL, "platformOperatorPrivateKey" character varying NOT NULL, "isEncrypted" boolean NOT NULL, CONSTRAINT "PK_7c8b739645fb8518b866b45a8bb" PRIMARY KEY ("blockchainNetId"))`
        );

        const blockchainProperties = await queryRunner.query(
            `SELECT * FROM "issuer_blockchain_properties"`
        );

        for (const properties of blockchainProperties) {
            await queryRunner.query(`
                INSERT INTO issuer_signer
                ("blockchainNetId", "platformOperatorPrivateKey", "isEncrypted") VALUES
                 (${properties.netId}, '${properties.platformOperatorPrivateKey}', FALSE)
            `);
        }

        await queryRunner.query(
            `ALTER TABLE "issuer_blockchain_properties" DROP COLUMN "platformOperatorPrivateKey"`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_blockchain_properties" ADD "platformOperatorPrivateKey" character varying`
        );

        const signers = await queryRunner.query(`SELECT * FROM "issuer_signer"`);

        /** @WARN platformOperatorPrivateKey will stay encrypted, it requires manual decryption */
        for (const signer of signers) {
            await queryRunner.query(`
                UPDATE issuer_blockchain_properties
                SET "platformOperatorPrivateKey" = '${signer.platformOperatorPrivateKey}'
                WHERE "netId" = ${signer.blockchainNetId}
            `);
        }

        await queryRunner.query(
            `ALTER TABLE "issuer_blockchain_properties" ALTER COLUMN "platformOperatorPrivateKey" SET NOT NULL;`
        );
        await queryRunner.query(`DROP TABLE "issuer_signer"`);
    }
}
