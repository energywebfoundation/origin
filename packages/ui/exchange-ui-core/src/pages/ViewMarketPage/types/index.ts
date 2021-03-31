import { Dispatch } from 'redux';

type FilterString = string;
type FilterStringList = FilterString[];

export type OrderBookFilterConfig = {
    deviceType: FilterStringList;
    gridOperator: FilterStringList;
    generationDateStart: FilterString;
    generationDateEnd: FilterString;
    location: FilterStringList;
};

export type BuyDirectParams = {
    orderId: string;
    volume: string;
    price: number;
    dispatch: Dispatch<any>;
};
