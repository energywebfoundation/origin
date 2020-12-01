import { Filter, Operator, OrderSide, Product, OrderStatus } from '@energyweb/exchange-core';
import { DemandStatus, TimeFrame } from '@energyweb/utils-general';
import { BigNumber } from 'ethers';

export type DeviceVintageDTO = {
    year: number;
    operator?: Operator;
};

export interface IProductDTO {
    deviceType?: string[];
    location?: string[];
    deviceVintage?: DeviceVintageDTO;
    generationFrom?: string;
    generationTo?: string;
    gridOperator?: string[];
}

export interface ITradeDTO {
    id: string;
    created: string;
    volume: string;
    price: number;
    bidId: string;
    askId: string;
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

export interface IProductFilterDTO extends IProductDTO {
    deviceTypeFilter: Filter;
    locationFilter: Filter;
    deviceVintageFilter: Filter;
    generationTimeFilter: Filter;
    gridOperatorFilter: Filter;
}

export interface IAsset {
    id: string;
    address: string;
    tokenId: string;
    deviceId: string;
    generationFrom: string;
    generationTo: string;
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

export interface IOrderBookOrderDTO {
    id: string;
    price: number;
    volume: string;
    product: Product;
    userId: string;
    assetId?: string;
}

export type TradePriceInfo = {
    created: string;
    volume: string;
    price: number;
    product: Product;
    assetId: string;
};

export type TOrderBook = {
    asks: IOrderBookOrderDTO[];
    bids: IOrderBookOrderDTO[];
    lastTradedPrice: TradePriceInfo;
};

export interface IDirectBuyDTO {
    askId: string;
    volume: string;
    price: number;
}

export interface IOrder {
    id: string;
    side: OrderSide;
    validFrom: string;
    product: IProductDTO;
    price: number;
    startVolume: string;
    currentVolume: string;
    directBuyId: string;
    asset: IAsset;
    assetId: string;
    userId: string;
    filled?: number;
    demandId?: string;
}

export type Order = IOrder & { assetId: string; status: OrderStatus };

export type RequestWithdrawalDTO = {
    readonly assetId: string;
    readonly address: string;
    readonly amount: string;
};

export type BundleItem = {
    id: string;
    asset: IAsset;
    startVolume: BigNumber;
    currentVolume: BigNumber;
};

export type Bundle = {
    id?: string;
    userId: string;
    price: number;
    isCancelled: boolean;
    items: BundleItem[];
    volume: BigNumber;
    own: boolean;
    splits?: Split[];
};

export type BundleItemDTO = {
    assetId: string;
    volume: string;
};

export type CreateBundleDTO = {
    price: number;
    items: BundleItemDTO[];
};

export type BuyBundleDTO = {
    bundleId: string;
    volume: string;
};

export type BundleSplits = {
    id: string;
    splits: Split[];
};

export type Split = {
    volume: BigNumber;
    items: SplitItem[];
};

export type SplitItem = {
    id: string;
    volume: BigNumber;
};

export type DemandSummaryDTO = {
    bids: CreateBidDTO[];
    volume: string;
};

export interface ICalculateVolumeData {
    volume: string;
    period: TimeFrame;
    start: Date;
    end: Date;
}

export interface IDemand {
    id: string;
    userId: string;
    price: string;
    start: Date;
    end: Date;
    volumePerPeriod: string;
    periodTimeFrame: TimeFrame;
    product: IProductDTO;
    bids: Order[];
    status: DemandStatus;
}

export type Demand = IDemand & { userId: string; bids: Order[]; status: DemandStatus };

export const ANY_VALUE = 'Any';
export const ANY_OPERATOR = 'TH-ANY';
