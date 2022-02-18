import { Certificate, Contracts, IBlockchainProperties } from '@energyweb/issuer';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { Wallet } from 'ethers';
import { MigrationInterface, QueryRunner } from 'typeorm';

import { BlockchainProperties } from '../src/pods/blockchain/blockchain-properties.entity';

export class StoreTxHashInsteadBlock1633507266818 implements MigrationInterface {
    name = 'StoreTxHashInsteadBlock1633507266818';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ADD "creationTransactionHash" character varying`
        );
        const existingCertificates = await queryRunner.query(`SELECT id FROM "issuer_certificate"`);

        if (existingCertificates.length > 0) {
            const blockchainProperties = await queryRunner.query(
                `SELECT * FROM "issuer_blockchain_properties"`
            );
            const wrapped: IBlockchainProperties =
                this.getBlockchainProperties(blockchainProperties);

            const syncedCertificates = await Promise.all(
                existingCertificates.map((cert: any) => new Certificate(cert.id, wrapped, 1).sync())
            );

            syncedCertificates.forEach(async (cert: Certificate) => {
                await queryRunner.query(
                    `UPDATE "issuer_certificate" SET "creationTransactionHash" = ${cert.creationTransactionHash} WHERE id = '${cert.id}'`
                );
            });
        }

        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ALTER COLUMN "creationTransactionHash" SET NOT NULL`
        );

        await queryRunner.query(`ALTER TABLE "issuer_certificate" DROP COLUMN "creationBlockHash"`);

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

    private getBlockchainProperties(
        // At this point of migration platformOperatorPrivateKey is existing in database
        // It is removed in later migration
        blockchainProperties: BlockchainProperties & { platformOperatorPrivateKey: string }
    ): IBlockchainProperties {
        const web3 = getProviderWithFallback(
            ...[blockchainProperties.rpcNode, blockchainProperties.rpcNodeFallback].filter(
                (url) => !!url
            )
        );
        const assure0x = (privateKey: string) =>
            privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

        const signer = new Wallet(assure0x(blockchainProperties.platformOperatorPrivateKey), web3);

        return {
            web3,
            registry: Contracts.factories.RegistryExtendedFactory.connect(
                blockchainProperties.registry,
                signer
            ),
            issuer: Contracts.factories.IssuerFactory.connect(blockchainProperties.issuer, signer),
            privateIssuer: blockchainProperties.privateIssuer
                ? Contracts.factories.PrivateIssuerFactory.connect(
                      blockchainProperties.privateIssuer,
                      signer
                  )
                : null,
            activeUser: signer
        };
    }
}
