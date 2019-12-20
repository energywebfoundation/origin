import { IOffChainDataClient, IConfigurationClient } from '@energyweb/origin-backend-client';

export interface IEventListenerConfig {
    web3Url: string;
    accountPrivKey: string;
    offChainDataSourceUrl: string;
    offChainDataSourceClient: IOffChainDataClient;
    configurationClient: IConfigurationClient;
    scanInterval: number;
    notificationInterval: number;
    marketLogicAddress?: string;
    mandrillApiKey?: string;
    emailFrom?: string;
}
