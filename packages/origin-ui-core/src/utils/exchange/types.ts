import { Filter, Operator } from '@energyweb/exchange-core';

export interface IOrderBookOrderDTO {
    price: number;
    volume: string;
    userId?: string;
}

export type TOrderBook = {
    asks: IOrderBookOrderDTO[];
    bids: IOrderBookOrderDTO[];
};

export type DeviceVintageDTO = {
    year: number;
    operator?: Operator;
};

export interface IProductDTO {
    deviceType?: string[];
    location?: string[];
    deviceVintage?: DeviceVintageDTO;
    generationFrom: string;
    generationTo: string;
}

export type CreateBidDTO = {
    volume: string;
    price: number;
    validFrom: string;
    product: IProductDTO;
};

export type CreateAskDTO = {
    volume: string;
    price: number;
    validFrom: string;
    assetId: string;
};

export interface IOrder {
    id: string;
    userId: string;
    price: number;
}

export interface IProductFilterDTO extends IProductDTO {
    deviceTypeFilter: Filter;
    locationFilter: Filter;
    deviceVintageFilter: Filter;
    generationTimeFilter: Filter;
}

export interface IAsset {
    id: string;
    address: string;
    tokenId: string;
    deviceId: string;
    generationFrom: Date;
    generationTo: Date;
}

export type AccountAsset = {
    asset: IAsset;
    amount: string;
};

export type AccountBalance = {
    available: AccountAsset[];
    locked: AccountAsset[];
};

export type ExchangeAccount = {
    address: string;
    balances: AccountBalance;
};

export enum TransferStatus {
    Unknown,
    Accepted,
    Unconfirmed,
    Confirmed,
    Error
}

export enum TransferDirection {
    Deposit,
    Withdrawal
}

export interface ITransfer {
    id: string;
    userId: string;
    asset: IAsset;
    amount: string;
    transactionHash: string;
    address: string;
    status: TransferStatus;
    confirmationBlock?: number;
    direction: TransferDirection;
}
