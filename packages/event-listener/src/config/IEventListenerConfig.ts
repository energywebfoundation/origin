import { IOffChainDataSource } from '@energyweb/origin-backend-client';

export interface IEventListenerConfig {
    web3Url: string;
    accountPrivKey: string;
    offChainDataSource: IOffChainDataSource;
    scanInterval: number;
    notificationInterval: number;
    marketLogicAddress?: string;
    mandrillApiKey?: string;
    emailFrom?: string;
}
