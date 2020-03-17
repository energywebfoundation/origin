import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigurationService } from '@energyweb/origin-backend';
import { IDeviceType } from '@energyweb/origin-backend-core';
import { MatchingEngineService } from '../matching-engine/matching-engine.service';
import { OrderService } from '../order/order.service';
import { DepositWatcherService } from '../deposit-watcher/deposit-watcher.service';
import { WithdrawalProcessorService } from '../withdrawal-processor/withdrawal-processor.service';

const wait = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

@Injectable()
export class RunnerService implements OnModuleInit {
    private initialized = false;

    private readonly logger = new Logger(RunnerService.name);

    private readonly scanInterval = 30000;

    constructor(
        private readonly originBackendConfigurationService: ConfigurationService,
        private readonly matchingEngineService: MatchingEngineService,
        private readonly ordersService: OrderService,
        private readonly depositWatcherService: DepositWatcherService,
        private readonly withdrawalProcessorService: WithdrawalProcessorService
    ) {}

    public onModuleInit() {
        this.fetchDeviceTypesAndInit();
    }

    public async fetchDeviceTypesAndInit() {
        const getDeviceTypes = async () => {
            let deviceTypes: IDeviceType[] = [];

            try {
                const configuration = await this.originBackendConfigurationService.get();

                deviceTypes = configuration.deviceTypes || [];
                // eslint-disable-next-line no-empty
            } catch (error) {}

            return deviceTypes;
        };

        let deviceTypes = await getDeviceTypes();

        while (deviceTypes.length === 0) {
            await wait(this.scanInterval);

            this.logger.log(
                `DeviceTypes are empty. Retrying in ${this.scanInterval} milliseconds.`
            );

            deviceTypes = await getDeviceTypes();
        }

        this.logger.log('DeviceTypes loaded. Initializing RunnerService.');
        this.init(deviceTypes);
    }

    public async init(deviceTypes: string[][]) {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        const orders = await this.ordersService.getAllActiveOrders();

        this.matchingEngineService.init(orders, deviceTypes);

        await this.depositWatcherService.init();

        await this.withdrawalProcessorService.init();

        this.logger.log('Initialized');
    }
}
