import * as Winston from 'winston';
import { Wallet } from 'ethers';

import { IOffChainDataSource } from '@energyweb/origin-backend-client';
import { IDeviceTypeService } from './DeviceTypeService';

export interface Entity<TRegistry = any, TIssuer = any> {
    blockchainProperties: BlockchainProperties<TRegistry, TIssuer>;
    logger: Winston.Logger;
    deviceTypeService?: IDeviceTypeService;
    offChainDataSource?: IOffChainDataSource;
}

export interface BlockchainProperties<TRegistry = any, TIssuer = any> {
    registry?: TRegistry;
    issuer?: TIssuer;
    activeUser?: Wallet;
    privateKey?: string;
}
