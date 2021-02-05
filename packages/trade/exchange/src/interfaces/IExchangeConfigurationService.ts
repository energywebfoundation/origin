import { IDeviceType } from '@energyweb/origin-backend-core';

export const IExchangeConfigurationService = Symbol('IExchangeConfigurationService');
export interface IExchangeConfigurationService {
    getDeviceTypes(): Promise<IDeviceType[]>;
    getGridOperators(): Promise<string[]>;
    getRegistryAddress(): Promise<string>;
    getIssuerAddress(): Promise<string>;
}
