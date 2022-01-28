import { Injectable } from '@nestjs/common';
import { Signer, Wallet } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { SignerEntity } from './signer.entity';
import { SignerAdapter } from './tokens';
import CryptrModule from 'cryptr';
import { BlockchainProperties } from '../blockchain';

export const encryptOperatorKey = (operatorKey: string, encryptionKey: string): string => {
    return new CryptrModule(encryptionKey).encrypt(operatorKey);
};

@Injectable()
export class EncryptedSignerAdapter implements SignerAdapter {
    constructor(
        @InjectRepository(SignerEntity)
        private signerRepository: Repository<SignerEntity>
    ) {}

    public async getSigner(blockchainProperties: BlockchainProperties): Promise<Signer> {
        const web3 = getProviderWithFallback(
            ...[blockchainProperties.rpcNode, blockchainProperties.rpcNodeFallback].filter((url) =>
                Boolean(url)
            )
        );

        const wallet = new Wallet(
            await this.getPlatformOperatorKey(blockchainProperties.netId),
            web3
        );

        return wallet;
    }

    public async createSigner(
        blockchainNetId: number,
        platformOperatorPrivateKey: string
    ): Promise<void> {
        await this.signerRepository.save({
            blockchainNetId,
            platformOperatorPrivateKey: encryptOperatorKey(
                platformOperatorPrivateKey,
                this.getEncryptionKey()
            ),
            isEncrypted: true
        });
    }

    private async getPlatformOperatorKey(blockchainNetId: number): Promise<string> {
        const [signerEntity] = await this.signerRepository.find({
            where: { blockchainNetId }
        });

        if (!signerEntity) {
            throw new Error(
                'Signer not configured. Make sure you pass platformOperatorPrivateKey during blockchain properties creation or use custom signer adapter in IssuerApiModule options'
            );
        }

        const assure0x = (privateKey: string) =>
            privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

        if (!signerEntity.isEncrypted) {
            await this.signerRepository.update(
                { blockchainNetId },
                {
                    platformOperatorPrivateKey: encryptOperatorKey(
                        signerEntity.platformOperatorPrivateKey,
                        this.getEncryptionKey()
                    ),
                    isEncrypted: true
                }
            );

            return assure0x(signerEntity.platformOperatorPrivateKey);
        }

        return assure0x(this.decryptOperatorKey(signerEntity.platformOperatorPrivateKey));
    }

    private decryptOperatorKey(encryptedKey: string): string {
        return new CryptrModule(this.getEncryptionKey()).decrypt(encryptedKey);
    }

    private getEncryptionKey(): string {
        /* const key = this.configService.get<string>('OPERATOR_ENCRYPTION_KEY'); */
        const key = '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';
        if (!key) {
            throw new Error(
                'Operator encryption key not configured (set `OPERATOR_ENCRYPTION_KEY` env variable or use custom signer adapter)'
            );
        }

        return key;
    }
}
