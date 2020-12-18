import { Filter } from '@energyweb/exchange-core';
import { UserStatus, IUser } from '@energyweb/origin-backend-core';
import { ExchangeClient } from './ExchangeClient';

export interface IOrdersTotalVolume {
    totalAsks: number;
    totalBids: number;
}

export async function getOrdersTotalVolume(
    exchangeClient: ExchangeClient,
    user: IUser
): Promise<IOrdersTotalVolume> {
    const filterAll = {
        deviceTypeFilter: Filter.All,
        locationFilter: Filter.All,
        gridOperatorFilter: Filter.All,
        generationTimeFilter: Filter.All,
        deviceVintageFilter: Filter.All
    };

    try {
        const orderbookData =
            user && user?.status === UserStatus.Active && exchangeClient?.accessToken
                ? await exchangeClient?.orderbookClient.getByProduct(filterAll)
                : await exchangeClient?.orderbookClient.getByProductPublic(filterAll);

        return {
            totalAsks: orderbookData?.data.asks.length,
            totalBids: orderbookData?.data.bids.length
        };
    } catch (error) {
        console.log('Unable to get orders total volume due to error:', error);
    }
}
