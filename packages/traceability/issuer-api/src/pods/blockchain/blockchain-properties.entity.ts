import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IsInt } from 'class-validator';
import { IBlockchainProperties, Contracts } from '@energyweb/issuer';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { Signer, Wallet } from 'ethers';

export const BLOCKCHAIN_PROPERTIES_TABLE_NAME = 'issuer_blockchain_properties';

@Entity({ name: BLOCKCHAIN_PROPERTIES_TABLE_NAME })
export class BlockchainProperties extends ExtendedBaseEntity {
    @PrimaryColumn()
    @IsInt()
    netId: number;

    @Column()
    registry: string;

    @Column()
    issuer: string;

    @Column()
    rpcNode: string;

    @Column()
    platformOperatorPrivateKey: string;

    @Column({ nullable: true })
    rpcNodeFallback?: string;

    @Column({ nullable: true })
    privateIssuer?: string;

    wrap(signerOrPrivateKey?: Signer | string): IBlockchainProperties {
        const web3 = getProviderWithFallback(
            ...[this.rpcNode, this.rpcNodeFallback].filter((url) => !!url)
        );
        const assure0x = (privateKey: string) =>
            privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

        let signer: Signer;

        if (signerOrPrivateKey) {
            signer =
                typeof signerOrPrivateKey === 'string'
                    ? new Wallet(assure0x(signerOrPrivateKey), web3)
                    : signerOrPrivateKey;
        } else {
            signer = new Wallet(assure0x(this.platformOperatorPrivateKey), web3);
        }

        return {
            web3,
            registry: Contracts.factories.RegistryExtendedFactory.connect(this.registry, signer),
            issuer: Contracts.factories.IssuerFactory.connect(this.issuer, signer),
            privateIssuer: this.privateIssuer
                ? Contracts.factories.PrivateIssuerFactory.connect(this.privateIssuer, signer)
                : null,
            activeUser: signer
        };
    }
}
