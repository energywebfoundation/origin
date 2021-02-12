import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { HasEnoughAssetAmountQuery } from '../../order/queries/has-enough-asset-amount.query';
import { AccountBalanceService } from '../account-balance.service';

@QueryHandler(HasEnoughAssetAmountQuery)
export class HasEnoughAssetAmountQueryHandler implements IQueryHandler<HasEnoughAssetAmountQuery> {
    private readonly logger = new Logger(HasEnoughAssetAmountQueryHandler.name);

    constructor(private readonly accountBalanceService: AccountBalanceService) {}

    async execute({ userId, assets }: HasEnoughAssetAmountQuery): Promise<boolean> {
        this.logger.debug(
            `Received HasEnoughAssetAmountQuery query ${JSON.stringify({ userId, assets })}`
        );

        return this.accountBalanceService.hasEnoughAssetAmount(userId, ...assets);
    }
}
