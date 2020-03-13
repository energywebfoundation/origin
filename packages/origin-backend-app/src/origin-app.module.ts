import { DynamicModule, Module } from '@nestjs/common';
import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { AppModule as OriginBackendModule } from '@energyweb/origin-backend';
import { AppModule as ExchangeModule } from '@energyweb/exchange';

@Module({})
export class OriginAppModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: OriginAppModule,
            imports: [OriginBackendModule.register(smartMeterReadingsAdapter), ExchangeModule]
        };
    }
}
