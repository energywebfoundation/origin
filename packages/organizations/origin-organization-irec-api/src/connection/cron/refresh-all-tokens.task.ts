import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';

import { RefreshAllTokensCommand } from '../commands';

@Injectable()
export class RefreshAllTokensTask {
    constructor(private readonly commandBus: CommandBus) {}

    @Cron(CronExpression.EVERY_4_HOURS)
    async handleCron() {
        await this.commandBus.execute(new RefreshAllTokensCommand());
    }
}
