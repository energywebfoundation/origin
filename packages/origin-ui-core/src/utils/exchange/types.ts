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
