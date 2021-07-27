import {
  orderBookControllerGetByProductPublic,
  orderBookControllerGetByProduct,
  Filter,
  OrderBookDTO,
} from '@energyweb/exchange-irec-react-query-client';
import { UserStatus } from '@energyweb/origin-backend-core';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { useEffect, useState } from 'react';
import { isEqual } from 'lodash';
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

const REFRESH_INTERVAL_MS = 5000;
const INITIAL_ORDERBOOK_STATE = {
  asks: [],
  bids: [],
  lastTradedPrice: null,
  totalAsks: null,
  totalBids: null,
};

export const useApiOrderbookPoll = (
  marketFilters: OrderBookFilters,
  user: UserDTO
) => {
  const [orderBookData, setOrderBookData] = useState<TOrderBookData>(
    INITIAL_ORDERBOOK_STATE
  );

  const getAndSetData = async () => {
    const productFilters = getProductFilterConfig(marketFilters);
    const userIsActive = user && user.status == UserStatus.Active;
    const orders = userIsActive
      ? await orderBookControllerGetByProduct(productFilters)
      : await orderBookControllerGetByProductPublic(productFilters);
    const totalOrders = await getOrdersTotalVolume(userIsActive);
    const newOrderBookData = {
      ...orders,
      ...totalOrders,
    };

    if (!isEqual(newOrderBookData, orderBookData)) {
      setOrderBookData(newOrderBookData);
    }
  };

  useEffect(() => {
    getAndSetData();
    const intervalRef = setInterval(getAndSetData, REFRESH_INTERVAL_MS);
    return () => {
      clearInterval(intervalRef);
    };
  }, [
    marketFilters.deviceType,
    marketFilters.gridOperator,
    marketFilters.location,
  ]);

  const isLoading =
    orderBookData.lastTradedPrice === null ||
    orderBookData.totalAsks === null ||
    orderBookData.totalBids === null;

  return { orderBookData, isLoading };
};
