import * as Winston from 'winston';
import Web3 from 'web3';
import { IOffChainDataClient } from "@energyweb/origin-backend-client"


export interface Entity<TMarketLogic = any, TAssetLogic = any, TCertificateLogic = any, TUserLogic = any> {
    blockchainProperties: BlockchainProperties<TMarketLogic, TAssetLogic, TCertificateLogic, TUserLogic>;
    offChainDataSource?: OffChainDataSource;
    logger: Winston.Logger;
}

export interface OffChainDataSource {
    baseUrl: string;
    client: IOffChainDataClient;
}
export interface BlockchainProperties<TMarketLogic = any, TAssetLogic = any, TCertificateLogic = any, TUserLogic = any> {
    web3: Web3;
    marketLogicInstance?: TMarketLogic;
    assetLogicInstance?: TAssetLogic;
    certificateLogicInstance?: TCertificateLogic;
    userLogicInstance?: TUserLogic;
    activeUser?: EthAccount;
    privateKey?: string;
}

export interface EthAccount {
    address: string;
    privateKey?: string;
}
