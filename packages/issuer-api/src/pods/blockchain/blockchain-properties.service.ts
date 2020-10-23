import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { BlockchainProperties } from './blockchain-properties.entity';

export class BlockchainPropertiesService {
    constructor(
        @InjectRepository(BlockchainProperties)
        private readonly repository: Repository<BlockchainProperties>
    ) {}

    public async create(
        netId: number,
        registry: string,
        issuer: string,
        rpcNode: string,
        platformOperatorPrivateKey: string,
        rpcNodeFallback?: string
    ): Promise<BlockchainProperties> {
        const blockchain = this.repository.create({
            netId,
            registry,
            issuer,
            rpcNode,
            rpcNodeFallback,
            platformOperatorPrivateKey
        });

        return this.repository.save(blockchain);
    }

    public async get(): Promise<BlockchainProperties> {
        const [blockchainProperties] = await this.repository.find();

        if (!blockchainProperties) {
            throw new NotFoundException({
                success: false,
                message:
                    'No blockchain properties have been saved to the database. Please initialize blockchain properties before proceeding'
            });
        }

        return blockchainProperties;
    }
}
