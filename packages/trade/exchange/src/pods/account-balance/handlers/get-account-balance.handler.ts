import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AccountBalanceService } from '../account-balance.service';
import { GetAccountBalanceQuery } from '../queries';
import { AccountBalanceDTO } from '..';

@QueryHandler(GetAccountBalanceQuery)
export class GetAccountBalanceQueryHandler implements IQueryHandler<GetAccountBalanceQuery> {
    private readonly logger = new Logger(GetAccountBalanceQueryHandler.name);

    constructor(private readonly accountBalanceService: AccountBalanceService) {}

    async execute({ ownerId }: GetAccountBalanceQuery): Promise<AccountBalanceDTO> {
        this.logger.debug(`Received GetAccountBalanceQuery query ${JSON.stringify({ ownerId })}`);

        return this.accountBalanceService.getAccountBalance(ownerId);
    }
}
