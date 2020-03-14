export interface IOrderBookOrderDTO {
    price: number;
    volume: string;
    userId?: string;
}

export type TOrderBook = {
    asks: IOrderBookOrderDTO[];
    bids: IOrderBookOrderDTO[];
};

export type ProductDTO = {
    deviceType?: string[];
    location?: string[];
};

export type CreateBidDTO = {
    volume: string;
    price: number;
    validFrom: string;
    product: ProductDTO;
};

export interface IOrder {
    id: string;
    userId: string;
    price: number;
}
