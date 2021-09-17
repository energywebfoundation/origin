import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';

import { RefreshAllTokensCommand } from '../commands';

@Injectable()
export class RefreshAllTokensTask {
    constructor(private readonly commandBus: CommandBus) {}

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async handleCron() {
        await this.commandBus.execute(new RefreshAllTokensCommand());
    }
}
