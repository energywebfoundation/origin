import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMappedOrderQuery } from '..';

@QueryHandler(GetMappedOrderQuery)
export class GetMappedOrderHandler implements IQueryHandler<GetMappedOrderQuery> {
    private readonly logger = new Logger(GetMappedOrderHandler.name);

    async execute() {
        this.logger.debug('Implement me.');
    }
}
