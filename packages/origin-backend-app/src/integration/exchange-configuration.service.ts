import { IExchangeConfigurationService } from '@energyweb/exchange';
import { ConfigurationService } from '@energyweb/origin-backend';
import { IDeviceType } from '@energyweb/origin-backend-core';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class ExchangeConfigurationService implements IExchangeConfigurationService {
    private configService: ConfigurationService;

    constructor(private readonly moduleRef: ModuleRef) {
        this.configService = this.moduleRef.get<ConfigurationService>(ConfigurationService, {
            strict: false
        });
    }

    public async getDeviceTypes(): Promise<IDeviceType[]> {
        const { deviceTypes } = await this.configService.get();
        return deviceTypes;
    }

    public async getGridOperators(): Promise<string[]> {
        const { gridOperators } = await this.configService.get();
        return gridOperators;
    }

    public async getRegistryAddress(): Promise<string> {
        const { contractsLookup } = await this.configService.get();
        return contractsLookup.registry;
    }

    public async getIssuerAddress(): Promise<string> {
        const { contractsLookup } = await this.configService.get();
        return contractsLookup.issuer;
    }
}
