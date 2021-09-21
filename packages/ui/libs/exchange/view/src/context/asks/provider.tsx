import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import React, { createContext, useContext, FC } from 'react';

const OrderBookAsksStore = createContext<OrderBookOrderDTO[]>(null);

export const OrderBookAsksProvider: FC<{
  asks: OrderBookOrderDTO[];
}> = ({ asks, children }) => {
  return (
    <OrderBookAsksStore.Provider value={asks}>
      {children}
    </OrderBookAsksStore.Provider>
  );
};

export const useOrderBookAsksContext = () => {
  return useContext(OrderBookAsksStore);
};
