/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SubmitOrderCommand } from '../../order/commands/submit-order.command';
import { MatchingEngineService } from '../matching-engine.service';

@CommandHandler(SubmitOrderCommand)
export class SubmitOrderHandler<TProduct, TProductFilter>
    implements ICommandHandler<SubmitOrderCommand> {
    private readonly logger = new Logger(SubmitOrderHandler.name);

    constructor(
        private readonly matchingEngineService: MatchingEngineService<TProduct, TProductFilter>
    ) {}

    async execute(command: SubmitOrderCommand): Promise<void> {
        this.logger.debug(`Executing SubmitOrderCommand `);

        await this.matchingEngineService.submit(command.order);
    }
}
