import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AssetAmount } from '..';

import { AccountBalanceService } from '../account-balance.service';
import { GetAssetAmountQuery } from '../queries/get-asset-amount.query';

@QueryHandler(GetAssetAmountQuery)
export class GetAssetAmountQueryHandler implements IQueryHandler<GetAssetAmountQuery> {
    private readonly logger = new Logger(GetAssetAmountQueryHandler.name);

    constructor(private readonly accountBalanceService: AccountBalanceService) {}

    async execute({ userId, assetId }: GetAssetAmountQuery): Promise<AssetAmount> {
        this.logger.debug(
            `Received GetAssetAmountQuery query ${JSON.stringify({ userId, assetId })}`
        );

        return this.accountBalanceService.getAssetAmounts(userId, assetId);
    }
}
