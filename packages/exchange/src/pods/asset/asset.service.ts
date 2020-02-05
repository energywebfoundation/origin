import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Asset } from './asset.entity';

@Injectable()
export class AssetService {
    constructor(
        @InjectRepository(Asset)
        private readonly repository: Repository<Asset>
    ) {}

    public async createIfNotExist(
        address: string,
        tokenId: string,
        deviceId: string,
        manager?: EntityManager
    ) {
        const entityManager = manager || this.repository.manager;

        let existingAsset = await entityManager.findOne<Asset>(Asset, null, {
            where: {
                address,
                tokenId
            }
        });

        if (!existingAsset) {
            existingAsset = await entityManager
                .create<Asset>(Asset, {
                    address,
                    tokenId,
                    deviceId
                })
                .save();
        }

        return existingAsset;
    }
}
