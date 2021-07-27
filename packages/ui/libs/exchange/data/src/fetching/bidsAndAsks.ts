import {
  OrderSide,
  useOrderControllerGetMyOrders,
} from '@energyweb/exchange-irec-react-query-client';

export const useApiBidsAndAsks = () => {
  const { data: orders, isLoading } = useOrderControllerGetMyOrders();

  const bids = orders?.filter(
    (order) => order.side === OrderSide.Bid && !(order as any)?.demandId
  );
  const asks = orders?.filter((order) => order.side === OrderSide.Ask);

  return { asks, bids, isLoading };
};
