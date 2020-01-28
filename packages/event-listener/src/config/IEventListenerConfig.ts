import {
    IOffChainDataClient,
    IConfigurationClient,
    IUserClient,
    IDeviceClient
} from '@energyweb/origin-backend-client';

export interface IEventListenerConfig {
    web3Url: string;
    accountPrivKey: string;
    offChainDataSourceUrl: string;
    offChainDataSourceClient: IOffChainDataClient;
    configurationClient: IConfigurationClient;
    userClient: IUserClient;
    deviceClient: IDeviceClient;
    scanInterval: number;
    notificationInterval: number;
    marketLogicAddress?: string;
    mandrillApiKey?: string;
    emailFrom?: string;
}
