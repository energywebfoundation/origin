import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockchainProperties } from './blockchain-properties.entity';
import { BlockchainPropertiesDTO } from './blockchain-properties.dto';

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

        return blockchainProperties;
    }

    public async dto(): Promise<BlockchainPropertiesDTO> {
        const [blockchainProperties] = await this.repository.find();

        return {
            netId: blockchainProperties.netId,
            registry: blockchainProperties.registry,
            issuer: blockchainProperties.issuer,
            rpcNode: blockchainProperties.rpcNode,
            rpcNodeFallback: blockchainProperties.rpcNodeFallback
        };
    }
}
