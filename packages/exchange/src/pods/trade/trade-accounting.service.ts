import { Injectable } from '@nestjs/common';
import { Map } from 'immutable';

import { TradeService } from './trade.service';
import {
    AccountAssetDTO,
    AccountBalanceAssetService,
    AccountBalanceService
} from '../account-balance';

@Injectable()
export class TradeAccountingService extends AccountBalanceAssetService {
    constructor(
        private readonly tradeService: TradeService,
        accountBalanceService: AccountBalanceService
    ) {
        super();
        accountBalanceService.registerAssetSource(this);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async lockedAssets(ownerId: string): Promise<Map<string, AccountAssetDTO>> {
        return Map<string, AccountAssetDTO>();
    }

    public async availableAssets(ownerId: string): Promise<Map<string, AccountAssetDTO>> {
        const trades = await this.tradeService.getAllByUser(ownerId, false);

        return this.sumByAsset(
            trades,
            (trade) => trade.ask.asset,
            (trade) => {
                const sign = trade.ask.userId === ownerId ? -1 : 1;
                return trade.volume.muln(sign);
            }
        ).filter((value) => !value.amount.isZero());
    }
}
