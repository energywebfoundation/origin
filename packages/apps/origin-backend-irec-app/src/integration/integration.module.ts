import {
    IExchangeConfigurationService,
    IExternalDeviceService,
    IExternalUserService
} from '@energyweb/exchange';
import { Module } from '@nestjs/common';

import { ExchangeConfigurationService } from './exchange-configuration.service';
import { ExternalDeviceService } from './external-device.service';
import { ExternalUserService } from './external-user.service';

const exchangeConfigurationService = {
    provide: IExchangeConfigurationService,
    useClass: ExchangeConfigurationService
};

const externalDeviceService = {
    provide: IExternalDeviceService,
    useClass: ExternalDeviceService
};

const externalUserService = {
    provide: IExternalUserService,
    useClass: ExternalUserService
};

@Module({
    providers: [exchangeConfigurationService, externalDeviceService, externalUserService],
    exports: [exchangeConfigurationService, externalDeviceService, externalUserService]
})
export class IntegrationModule {}
