import { useApiFetchMyOrders } from '@energyweb/origin-ui-exchange-data-access';

export const useExchangeMyOrdersPageEffects = () => {
  const { data, isLoading } = useApiFetchMyOrders();
  let allDemands;
  let openBids;
  let openAsks;

  //activeOrders, allOrders, allDemands, demands
  return { allDemands, openAsks, openBids, isLoading };
};
