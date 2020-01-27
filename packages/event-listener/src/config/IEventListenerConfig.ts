import {
    IOffChainDataClient,
    IConfigurationClient,
    IUserClient
} from '@energyweb/origin-backend-client';

export interface IEventListenerConfig {
    web3Url: string;
    accountPrivKey: string;
    offChainDataSourceUrl: string;
    offChainDataSourceClient: IOffChainDataClient;
    configurationClient: IConfigurationClient;
    userClient: IUserClient;
    scanInterval: number;
    notificationInterval: number;
    marketLogicAddress?: string;
    mandrillApiKey?: string;
    emailFrom?: string;
}
