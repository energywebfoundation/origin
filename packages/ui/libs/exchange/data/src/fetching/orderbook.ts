import {
  orderBookControllerGetByProductPublic,
  orderBookControllerGetByProduct,
  Filter,
  OrderBookDTO,
} from '@energyweb/exchange-irec-react-query-client';
import { UserStatus } from '@energyweb/origin-backend-core';
import {
  getUserControllerMeQueryKey,
  UserDTO,
} from '@energyweb/origin-backend-react-query-client';
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { getProductFilterConfig, OrderBookFilters } from '../utils';

export type TOrdersTotalVolume = {
  totalAsks: number;
  totalBids: number;
};

export type TOrderBookData = OrderBookDTO & TOrdersTotalVolume;

const getOrdersTotalVolume = async (
  userIsActive: boolean
): Promise<TOrdersTotalVolume> => {
  const filterAll = {
    deviceTypeFilter: Filter.All,
    locationFilter: Filter.All,
    gridOperatorFilter: Filter.All,
    generationTimeFilter: Filter.All,
    deviceVintageFilter: Filter.All,
  };

  try {
    const orderbookData = userIsActive
      ? await orderBookControllerGetByProduct(filterAll)
      : await orderBookControllerGetByProductPublic(filterAll);

    return {
      totalAsks: orderbookData?.asks.length,
      totalBids: orderbookData?.bids.length,
    };
  } catch (error) {
    console.error('Unable to get orders total volume due to error:', error);
  }
};

const REFRESH_INTERVAL_MS = 3000;
const INITIAL_ORDERBOOK_STATE = {
  asks: [],
  bids: [],
  lastTradedPrice: null,
  totalAsks: null,
  totalBids: null,
};

export const useApiOrderbookPoll = (marketFilters: OrderBookFilters) => {
  const [orderbookData, setOrderbookData] = useState<TOrderBookData>(
    INITIAL_ORDERBOOK_STATE
  );
  const productFilters = getProductFilterConfig(marketFilters);
  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();

  const fetchOrderBook = async (isMounted: boolean) => {
    const user = queryClient.getQueryData<UserDTO>(userQueryKey);
    const userIsActive = user?.status === UserStatus.Active;

    const orderBookData = userIsActive
      ? await orderBookControllerGetByProduct(productFilters)
      : await orderBookControllerGetByProductPublic(productFilters);

    const orderBookTotalOrders = await getOrdersTotalVolume(userIsActive);
    if (isMounted) {
      const newOrderbookData = {
        ...orderBookData,
        ...orderBookTotalOrders,
      };
      setOrderbookData(newOrderbookData || INITIAL_ORDERBOOK_STATE);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const _fetch = async () => {
      await fetchOrderBook(isMounted);
    };

    _fetch();
    const intervalRef = setInterval(_fetch, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalRef);
    };
  }, []);

  const isLoading =
    orderbookData?.lastTradedPrice === null ||
    orderbookData?.totalAsks === null ||
    orderbookData?.totalBids === null;

  return { orderbookData, isLoading };
};
