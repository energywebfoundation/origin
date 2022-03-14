import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetIrecTradeTransferQuery } from '../query';
import { IIrecTradeTransfer, IrecTradeTransfer } from '../irec-trade-transfer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@QueryHandler(GetIrecTradeTransferQuery)
export class GetIrecTradeTransfersHandler implements IQueryHandler<GetIrecTradeTransferQuery> {
    constructor(
        @InjectRepository(IrecTradeTransfer)
        private repository: Repository<IrecTradeTransfer>
    ) {}

    public async execute(query: GetIrecTradeTransferQuery): Promise<IIrecTradeTransfer[]> {
        return await this.repository.find();
    }
}
