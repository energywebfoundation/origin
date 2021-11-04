import { Map } from 'immutable';
import BN from 'bn.js';
import {
    AccountAssetDTO,
    AccountBalanceAssetService,
    AccountBalanceService,
    AssetService
} from '@energyweb/exchange';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExportedAsset } from './exported.entity';
import { Repository } from 'typeorm';

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
        const exportedAssetIds = await this.repository.find({ ownerId });
        return await Promise.all(
            exportedAssetIds.map(async (exported) => ({
                asset: await this.assetService.get(exported.assetId),
                amount: exported.amount
            }))
        );
    }
}
