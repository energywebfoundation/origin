import { Repository } from 'typeorm';
import { Map } from 'immutable';
import BN from 'bn.js';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    AccountAssetDTO,
    AccountBalanceAssetService,
    AccountBalanceService,
    AssetService
} from '@energyweb/exchange';
import { ExportedAsset } from './exported.entity';

@Injectable()
export class ExportAccountingService extends AccountBalanceAssetService {
    constructor(
        @InjectRepository(ExportedAsset)
        private readonly repository: Repository<ExportedAsset>,
        accountBalanceService: AccountBalanceService,
        private readonly assetService: AssetService
    ) {
        super();
        accountBalanceService.registerAssetSource(this);
    }

    public async findByOwner(ownerId: string) {
        return this.repository.find({ ownerId });
    }

    public async lockedAssets(ownerId: string): Promise<Map<string, AccountAssetDTO>> {
        const exportedAssets = await this.getExportedAssets(ownerId);

        return this.sumByAsset(
            exportedAssets,
            (exported) => exported.asset,
            (exported) => new BN(exported.amount)
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async availableAssets(ownerId: string): Promise<Map<string, AccountAssetDTO>> {
        const exportedAssets = await this.getExportedAssets(ownerId);

        return this.sumByAsset(
            exportedAssets,
            (exported) => exported.asset,
            (exported) => new BN(exported.amount).neg()
        );
    }

    private async getExportedAssets(ownerId: string) {
        const exportedAssets = await this.findByOwner(ownerId);
        return await Promise.all(
            exportedAssets.map(async (exported) => ({
                asset: await this.assetService.get(exported.assetId),
                amount: exported.amount
            }))
        );
    }
}
