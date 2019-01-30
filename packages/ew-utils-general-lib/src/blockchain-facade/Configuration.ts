import * as Winston from 'winston';
import Web3 = require('web3');

export interface Entity {
    blockchainProperties: BlockchainProperties;
    offChainDataSource?: OffChainDataSource;
    logger: Winston.Logger;

}

export interface OffChainDataSource {
    baseUrl: string;
}
export interface BlockchainProperties {
    web3: Web3;
    demandLogicInstance?: any;
    producingAssetLogicInstance?: any;
    consumingAssetLogicInstance?: any;
    certificateLogicInstance?: any;
    userLogicInstance?: any;
    activeUser?: EthAccount;
    matcherAccount?: EthAccount;
    privateKey?: string;
}

export interface EthAccount {
    address: string;
    privateKey?: string;
}
