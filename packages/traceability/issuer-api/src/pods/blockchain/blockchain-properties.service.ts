import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockchainProperties } from './blockchain-properties.entity';
import { BlockchainPropertiesDTO } from './blockchain-properties.dto';
import { IBlockchainProperties } from '@energyweb/issuer';
import { Injectable } from '@nestjs/common';
import { InternalSignerAdapter } from '../signer';

@Injectable()
export class BlockchainPropertiesService {
    constructor(
        @InjectRepository(BlockchainProperties)
        private repository: Repository<BlockchainProperties>,
        private signerAdapter: InternalSignerAdapter
    ) {}

    public async create(
        netId: number,
        registry: string,
        issuer: string,
        rpcNode: string,
        platformOperatorPrivateKey?: string,
        rpcNodeFallback?: string,
        privateIssuer?: string
    ): Promise<BlockchainProperties> {
        const blockchain = this.repository.create({
            netId,
            registry,
            issuer,
            rpcNode,
            rpcNodeFallback,
            privateIssuer
        });

        const blockchainProperties = await this.repository.save(blockchain);

        if (platformOperatorPrivateKey) {
            await this.signerAdapter.createSigner(netId, platformOperatorPrivateKey);
        }

        return blockchainProperties;
    }

    public async get(): Promise<BlockchainProperties> {
        const [blockchainProperties] = await this.repository.find();

        if (!blockchainProperties) {
            throw new Error('Blockchain properties not configured');
        }

        return blockchainProperties;
    }

    public async findByNetId(netId: number): Promise<BlockchainProperties | null> {
        return (
            (await this.repository.findOne({
                where: {
                    netId
                }
            })) ?? null
        );
    }

    public async getWrapped(): Promise<IBlockchainProperties> {
        const properties = await this.get();

        return properties.wrap(await this.signerAdapter.getSigner(properties));
    }

    public async dto(): Promise<BlockchainPropertiesDTO> {
        const [blockchainProperties] = await this.repository.find();

        return {
            netId: blockchainProperties.netId,
            registry: blockchainProperties.registry,
            issuer: blockchainProperties.issuer,
            privateIssuer: blockchainProperties.privateIssuer,
            rpcNode: blockchainProperties.rpcNode,
            rpcNodeFallback: blockchainProperties.rpcNodeFallback
        };
    }
}
