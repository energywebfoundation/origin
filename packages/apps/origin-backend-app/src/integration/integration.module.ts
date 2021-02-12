import { IExchangeConfigurationService, IExternalDeviceService } from '@energyweb/exchange';
import { Module } from '@nestjs/common';

import { ExchangeConfigurationService } from './exchange-configuration.service';
import { ExternalDeviceService } from './external-device.service';

const exchangeConfigurationService = {
    provide: IExchangeConfigurationService,
    useClass: ExchangeConfigurationService
};

const externalDeviceService = {
    provide: IExternalDeviceService,
    useClass: ExternalDeviceService
};

@Module({
    providers: [exchangeConfigurationService, externalDeviceService],
    exports: [exchangeConfigurationService, externalDeviceService]
})
export class IntegrationModule {}
