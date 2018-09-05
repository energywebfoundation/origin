import Web3Type from '../types/web3'
import * as Winston from 'winston'

export interface Configuration {
    blockchainProperties: BlockchainProperties
    offChainDataSource?: OffChainDataSource
    logger: Winston.Logger

}

export interface OffChainDataSource {
    baseUrl: string
}
export interface BlockchainProperties {
    web3: Web3Type,
    demandLogicInstance?: any,
    producingAssetLogicInstance?: any,
    consumingAssetLogicInstance?: any,
    certificateLogicInstance?: any,
    userLogicInstance?: any,
    activeUser?: EthAccount,
    matcherAccount?: EthAccount
    privateKey?: string
}

export interface EthAccount {
    address: string
    privateKey?: string
}