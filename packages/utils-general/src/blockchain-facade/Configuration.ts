import * as Winston from 'winston';
import Web3 from 'web3';
import { IOffChainDataClient } from "@energyweb/origin-backend-client"


export interface Entity<TMarketLogic = any, TProducingAssetLogic = any, TConsumingAssetLogic = any, TCertificateLogic = any, TUserLogic = any> {
    blockchainProperties: BlockchainProperties<TMarketLogic, TProducingAssetLogic, TConsumingAssetLogic, TCertificateLogic, TUserLogic>;
    offChainDataSource?: OffChainDataSource;
    logger: Winston.Logger;
}

export interface OffChainDataSource {
    baseUrl: string;
    client: IOffChainDataClient;
}
export interface BlockchainProperties<TMarketLogic = any, TProducingAssetLogic = any, TConsumingAssetLogic = any, TCertificateLogic = any, TUserLogic = any> {
    web3: Web3;
    marketLogicInstance?: TMarketLogic;
    producingAssetLogicInstance?: TProducingAssetLogic;
    consumingAssetLogicInstance?: TConsumingAssetLogic;
    certificateLogicInstance?: TCertificateLogic;
    userLogicInstance?: TUserLogic;
    activeUser?: EthAccount;
    privateKey?: string;
}

export interface EthAccount {
    address: string;
    privateKey?: string;
}
