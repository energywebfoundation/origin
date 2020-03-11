import * as Winston from 'winston';
import Web3 from 'web3';

import { IOffChainDataSource } from '@energyweb/origin-backend-client';
import { IDeviceTypeService } from './DeviceTypeService';

export interface Entity<
    TUserLogic = any,
    TDeviceLogic = any,
    TRegistry = any,
    TIssuer = any
> {
    blockchainProperties: BlockchainProperties<
        TUserLogic,
        TDeviceLogic,
        TRegistry,
        TIssuer
    >;
    logger: Winston.Logger;
    deviceTypeService?: IDeviceTypeService;
    offChainDataSource?: IOffChainDataSource;
}

export interface BlockchainProperties<
    TUserLogic = any,
    TDeviceLogic = any,
    TRegistry = any,
    TIssuer = any
> {
    web3: Web3;
    userLogicInstance?: TUserLogic;
    deviceLogicInstance?: TDeviceLogic;
    registry?: TRegistry;
    issuer?: TIssuer;
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
