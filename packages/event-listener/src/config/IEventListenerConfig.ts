import { IOffChainDataClient } from '@energyweb/origin-backend-client';

export interface IEventListenerConfig {
    web3Url: string;
    accountPrivKey: string;
    offChainDataSourceUrl: string;
    offChainDataSourceClient: IOffChainDataClient;
    scanInterval: number;
    notificationInterval: number;
    marketLogicAddress?: string;
    mandrillApiKey?: string;
    emailFrom?: string;
}
