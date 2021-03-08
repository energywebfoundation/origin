/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClearMatchingEngineCommand } from '../commands/clear-matching-engine.command';

import { MatchingEngineService } from '../matching-engine.service';

@CommandHandler(ClearMatchingEngineCommand)
export class ClearMatchingEngineHandler<TProduct, TProductFilter>
    implements ICommandHandler<ClearMatchingEngineCommand> {
    constructor(
        private readonly matchingEngineService: MatchingEngineService<TProduct, TProductFilter>
    ) {}

    async execute(): Promise<void> {
        await this.matchingEngineService.clear();
    }
}
