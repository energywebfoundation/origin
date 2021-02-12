import { Injectable, Logger } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';

import { Asset } from './asset.entity';
import { CreateAssetDTO } from './create-asset.dto';

@Injectable()
export class AssetService {
    private readonly logger = new Logger(AssetService.name);

    constructor(private readonly connection: Connection) {}

    public async get(id: string) {
        return this.connection.getRepository<Asset>(Asset).findOne(id);
    }

    public async createIfNotExist(asset: CreateAssetDTO, transaction?: EntityManager) {
        this.logger.debug(`Requested asset ${JSON.stringify(asset)}`);
        if (transaction) {
            return this.create(asset, transaction);
        }

        return this.connection.transaction(async (tr) => this.create(asset, tr));
    }

    private async create(asset: CreateAssetDTO, transaction: EntityManager) {
        const repository = transaction.getRepository<Asset>(Asset);
        let existingAsset = await repository.findOne(null, {
            where: {
                address: asset.address,
                tokenId: asset.tokenId
            }
        });

        if (!existingAsset) {
            this.logger.debug(`Asset does not exist. Creating.`);
            existingAsset = await repository.save(asset);
        }

        this.logger.debug(`Returning asset ${JSON.stringify(existingAsset)}`);

        return existingAsset;
    }
}
