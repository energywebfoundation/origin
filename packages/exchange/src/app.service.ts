import { Injectable, Logger } from '@nestjs/common';
import { RunnerService } from './pods/runner';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    constructor(private readonly runnerService: RunnerService) {}

    public async init(deviceTypes: string[][]) {
        this.logger.log('Initializing matching engine');

        await this.runnerService.init(deviceTypes);
    }
}
