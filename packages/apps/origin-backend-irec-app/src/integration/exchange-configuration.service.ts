import { IExchangeConfigurationService } from '@energyweb/exchange';
import { ConfigurationService } from '@energyweb/origin-backend';
import { BlockchainPropertiesService } from '@energyweb/issuer-irec-api';
import { IDeviceType } from '@energyweb/origin-backend-core';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class ExchangeConfigurationService implements IExchangeConfigurationService {
    private _configService: ConfigurationService;

    private _blockchainPropertiesService: BlockchainPropertiesService;

    constructor(private readonly moduleRef: ModuleRef) {}

    private get configService() {
        if (this._configService) {
            return this._configService;
        }

        this._configService = this.moduleRef.get<ConfigurationService>(ConfigurationService, {
            strict: false
        });

        return this._configService;
    }

    private get blockchainPropertiesService() {
        if (this._blockchainPropertiesService) {
            return this._blockchainPropertiesService;
        }

        this._blockchainPropertiesService = this.moduleRef.get<BlockchainPropertiesService>(
            BlockchainPropertiesService,
            {
                strict: false
            }
        );

        return this._blockchainPropertiesService;
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
        const { registry } = await this.blockchainPropertiesService.get();
        return registry;
    }

    public async getIssuerAddress(): Promise<string> {
        const { issuer } = await this.blockchainPropertiesService.get();
        return issuer;
    }
}
