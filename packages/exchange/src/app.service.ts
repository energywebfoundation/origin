import { Injectable, Logger } from '@nestjs/common';
import { MatchingEngineService } from './pods/matching-engine/matching-engine.service';
import { OrderService } from './pods/order/order.service';
import { DepositWatcherService } from './pods/deposit-watcher/deposit-watcher.service';
import { WithdrawalProcessorService } from './pods/withdrawal-processor/withdrawal-processor.service';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    constructor(
        private readonly matchingEngineService: MatchingEngineService,
        private readonly ordersService: OrderService,
        private readonly depositWatcherService: DepositWatcherService,
        private readonly withdrawalProcessorService: WithdrawalProcessorService
    ) {}

    public async init(deviceTypes: string[][]) {
        this.logger.log('Initializing matching engine');

        const orders = await this.ordersService.getAllActiveOrders();

        this.matchingEngineService.init(orders, deviceTypes);

        await this.depositWatcherService.init();

        await this.withdrawalProcessorService.init();
    }
}
