import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';

import { Asset } from './asset.entity';
import { AssetDTO } from './asset.dto';

@Injectable()
export class AssetService {
    constructor(
        @InjectConnection()
        private readonly connection: Connection
    ) {}

    public async get(id: string) {
        return this.connection.getRepository<Asset>(Asset).findOne(id);
    }

    public async createIfNotExist(asset: AssetDTO, transaction?: EntityManager) {
        if (transaction) {
            return this.create(asset, transaction);
        }

        return this.connection.transaction(tr => this.create(asset, tr));
    }

    private async create(asset: AssetDTO, transaction: EntityManager) {
        let existingAsset = await transaction.findOne<Asset>(Asset, null, {
            where: {
                address: asset.address,
                tokenId: asset.tokenId
            }
        });

        if (!existingAsset) {
            existingAsset = await transaction.create<Asset>(Asset, asset).save();
        }

        return existingAsset;
    }
}
