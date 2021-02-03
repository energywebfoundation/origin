/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CancelOrderCommand } from '../../order/commands/cancel-order.command';
import { MatchingEngineService } from '../matching-engine.service';

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler<TProduct, TProductFilter>
    implements ICommandHandler<CancelOrderCommand> {
    constructor(
        private readonly matchingEngineService: MatchingEngineService<TProduct, TProductFilter>
    ) {}

    async execute(command: CancelOrderCommand): Promise<void> {
        this.matchingEngineService.cancel(command.orderId);
    }
}
