import * as Winston from 'winston';
import Web3 from 'web3';

import { IOffChainDataSource } from '@energyweb/origin-backend-client';

export interface Entity<
    TMarketLogic = any,
    TDeviceLogic = any,
    TCertificateLogic = any,
    TUserLogic = any
> {
    blockchainProperties: BlockchainProperties<
        TMarketLogic,
        TDeviceLogic,
        TCertificateLogic,
        TUserLogic
    >;
    offChainDataSource?: IOffChainDataSource;
    logger: Winston.Logger;
}

export interface BlockchainProperties<
    TIssuerLogic = { public: any; private: any },
    TMarketLogic = any,
    TDeviceLogic = any,
    TCertificateLogic = any,
    TUserLogic = any
> {
    web3: Web3;
    issuerLogicInstance?: TIssuerLogic;
    marketLogicInstance?: TMarketLogic;
    deviceLogicInstance?: TDeviceLogic;
    certificateLogicInstance?: TCertificateLogic;
    userLogicInstance?: TUserLogic;
    activeUser?: EthAccount;
    privateKey?: string;
}

export interface EthAccount {
    address: string;
    privateKey?: string;
}

export const getAccount = (configuration: Entity) => ({
    from: configuration.blockchainProperties.activeUser.address,
    privateKey: configuration.blockchainProperties.activeUser.privateKey
});
