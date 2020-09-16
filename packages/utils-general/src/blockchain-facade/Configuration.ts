import * as Winston from 'winston';
import { Signer, providers } from 'ethers';

import { IOffChainDataSource } from '@energyweb/origin-backend-core';
import { IDeviceTypeService } from './DeviceTypeService';

export interface Entity<TRegistry = any, TIssuer = any> {
    blockchainProperties: BlockchainProperties<TRegistry, TIssuer>;
    logger: Winston.Logger;
    deviceTypeService?: IDeviceTypeService;
    offChainDataSource?: IOffChainDataSource;
}

export interface BlockchainProperties<TRegistry = any, TIssuer = any> {
    web3?: providers.FallbackProvider | providers.JsonRpcProvider;
    registry?: TRegistry;
    issuer?: TIssuer;
    activeUser?: Signer;
    privateKey?: string;
}
