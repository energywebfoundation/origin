import {
  OrderSide,
  OrderStatus,
  useOrderControllerGetMyOrders,
} from '@energyweb/exchange-irec-react-query-client';

export const useApiBidsAndAsks = () => {
  const { data: orders, isLoading } = useOrderControllerGetMyOrders();

  const bids = orders?.filter(
    (order) =>
      order.side === OrderSide.Bid &&
      (order.status === OrderStatus.Active ||
        order.status === OrderStatus.PartiallyFilled) &&
      !(order as any).demandId
  );
  const asks = orders?.filter(
    (order) =>
      order.side === OrderSide.Ask &&
      (order.status === OrderStatus.Active ||
        order.status === OrderStatus.PartiallyFilled)
  );

  return { asks, bids, isLoading };
};
